// One registry of tools serves the page, the chat agent and MCP, so every
// action a person can take on the page an agent can take too, through the
// same validation, permissions and trace. Define each tool once:
//
//   const tool = defineTool<User>()
//   export const tools = createTools({
//     list_orders: tool({ kind: "query", description: "...", input: z.object({}), run: (user) => ... }),
//   })
//
// then `tools.run(user, name, input, "web")` from a server action,
// `tools.forChat(user)` for streamText, and `tools.mcp(...)` for /mcp.

import { createMcpHandler, McpServer } from "@modelcontextprotocol/server"
import { tool as chatTool, type ToolSet } from "ai"
import type { z } from "zod"

import { inSpan } from "./telemetry"

/** Where a call came from; recorded on its span as tool.via. */
export type Via = "web" | "chat" | "mcp"

export type Tool<
  Ctx,
  Input extends z.ZodObject = z.ZodObject,
  Output = unknown,
> = {
  /** What a person calls it, in their language: the MCP tool title. */
  title?: string
  /** For agents: when to use it and what it returns. */
  description: string
  /** query reads, mutation writes; MCP marks queries read-only. */
  kind: "query" | "mutation"
  input: Input
  /** Runs as ctx (the signed-in person); input is already parsed. */
  run: (ctx: Ctx, input: z.infer<Input>) => Promise<Output>
  /** Set only to keep the tool off MCP, with the reason. */
  mcpExcludedBecause?: string
}

/** An error whose message the person or the agent may read as it is. */
export class ToolError extends Error {
  override name = "ToolError"
}

/** What to tell the caller: a ToolError's own message, otherwise nothing internal. */
export function toolErrorMessage(error: unknown): string {
  return error instanceof ToolError ? error.message : "The tool failed."
}

/** `const tool = defineTool<User>()` fixes the context type for each tool. */
export function defineTool<Ctx>() {
  return <Input extends z.ZodObject, Output>(
    definition: Tool<Ctx, Input, Output>
  ) => definition
}

const NAME = /^[a-z][a-z0-9_]{0,63}$/

export function createTools<Ctx>(
  // Each tool keeps its own input type through defineTool.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: Record<string, Tool<Ctx, any, any>>,
  options: {
    /** After a mutation succeeds: announce it so open pages refresh. It runs in the background: it never delays, fails or hangs the call. */
    afterMutation?: (name: string, ctx: Ctx) => unknown
  } = {}
) {
  for (const name of Object.keys(tools))
    if (!NAME.test(name))
      throw new Error(`tool name must be snake_case: ${name}`)

  /** Parse the input the same way for every caller, then run the tool as ctx. */
  async function run(ctx: Ctx, name: string, input: unknown, via: Via) {
    const tool = Object.hasOwn(tools, name) ? tools[name] : undefined
    if (!tool) throw new ToolError(`There is no tool named ${name}.`)
    const parsed = tool.input.safeParse(input ?? {})
    if (!parsed.success)
      throw new ToolError(
        parsed.error.issues
          .map(
            (issue: { path: PropertyKey[]; message: string }) =>
              `${issue.path.join(".") || "input"}: ${issue.message}`
          )
          .join("; ")
      )
    return inSpan(
      `tool ${name}`,
      { "tool.name": name, "tool.kind": tool.kind, "tool.via": via },
      async () => {
        const result = await tool.run(ctx, parsed.data)
        if (tool.kind === "mutation" && options.afterMutation)
          void Promise.resolve()
            .then(() => options.afterMutation!(name, ctx))
            .catch(() => {})
        return result
      }
    )
  }

  /** The tools for streamText. A failure comes back to the model as { error }. */
  function forChat(ctx: Ctx, only?: string[]): ToolSet {
    const names = Object.keys(tools).filter(
      (name) => !only || only.includes(name)
    )
    return Object.fromEntries(
      names.map((name) => [
        name,
        chatTool({
          description: tools[name]!.description,
          inputSchema: tools[name]!.input,
          execute: async (input: unknown) => {
            try {
              return await run(ctx, name, input, "chat")
            } catch (error) {
              return { error: toolErrorMessage(error) }
            }
          },
        }),
      ])
    )
  }

  /**
   * A stateless MCP endpoint over the same tools, serving 2026 and 2025-era
   * clients. Authenticate the request first, then pass who it acts as:
   * `export async function POST(request) { const user = await tokenUser(request); if (!user) return unauthorized(); return serve(request, user) }`.
   */
  function mcp(server: {
    name: string
    version: string
    instructions?: string
  }) {
    const handler = createMcpHandler(({ authInfo }) => {
      const ctx = authInfo?.extra?.ctx as Ctx | undefined
      const instance = new McpServer(
        { name: server.name, version: server.version },
        server.instructions ? { instructions: server.instructions } : {}
      )
      for (const [name, tool] of Object.entries(tools)) {
        if (tool.mcpExcludedBecause) continue
        instance.registerTool(
          name,
          {
            ...(tool.title && { title: tool.title }),
            description: tool.description,
            inputSchema: tool.input,
            annotations: { readOnlyHint: tool.kind === "query" },
          },
          async (input: unknown) => {
            if (ctx === undefined)
              return {
                content: [{ type: "text" as const, text: "Not signed in." }],
                isError: true,
              }
            try {
              const result = await run(ctx, name, input, "mcp")
              return {
                content: [
                  {
                    type: "text" as const,
                    text: JSON.stringify(result ?? null),
                  },
                ],
              }
            } catch (error) {
              return {
                content: [
                  { type: "text" as const, text: toolErrorMessage(error) },
                ],
                isError: true,
              }
            }
          }
        )
      }
      return instance
    })
    return (request: Request, ctx: Ctx) =>
      handler.fetch(request, {
        authInfo: { token: "", clientId: "", scopes: [], extra: { ctx } },
      })
  }

  return { tools, run, forChat, mcp }
}
