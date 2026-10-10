import { describe, expect, test } from "bun:test"
import { z } from "zod"

import { createTools, defineTool, ToolError } from "./tools"

type User = { id: string }
const tool = defineTool<User>()
const changes: string[] = []
const tools = createTools<User>(
  {
    whoami: tool({
      kind: "query",
      description: "Who is signed in.",
      input: z.object({}),
      run: async (user) => ({ id: user.id }),
    }),
    add_item: tool({
      kind: "mutation",
      description: "Add an item.",
      input: z.object({ name: z.string().min(1) }),
      run: async (_user, { name }) => {
        if (name === "boom")
          throw new Error("SELECT * FROM secret_table failed")
        if (name === "taken") throw new ToolError("That name is taken.")
        return { name }
      },
    }),
    internal: tool({
      kind: "query",
      description: "Not for agents.",
      input: z.object({}),
      run: async () => 1,
      mcpExcludedBecause: "page only",
    }),
  },
  {
    afterMutation: (name) => {
      changes.push(name)
      throw new Error("announcing failed")
    },
  }
)
const user = { id: "u1" }

describe("run", () => {
  test("parses the input and runs as the person", async () => {
    expect(await tools.run(user, "whoami", undefined, "web")).toEqual({
      id: "u1",
    })
    expect(await tools.run(user, "add_item", { name: "a" }, "web")).toEqual({
      name: "a",
    })
  })
  test("refuses an unknown or inherited name and bad input with a ToolError", async () => {
    await expect(tools.run(user, "nope", {}, "web")).rejects.toBeInstanceOf(
      ToolError
    )
    await expect(
      tools.run(user, "constructor", {}, "web")
    ).rejects.toBeInstanceOf(ToolError)
    await expect(
      tools.run(user, "add_item", { name: "" }, "web")
    ).rejects.toThrow("name:")
  })
  test("announces mutations only, and a failed announcement fails nothing", async () => {
    changes.length = 0
    await tools.run(user, "whoami", {}, "web")
    await tools.run(user, "add_item", { name: "b" }, "web")
    expect(changes).toEqual(["add_item"])
  })
  test("names must be snake_case", () => {
    expect(() =>
      createTools({
        "Bad-Name": tool({
          kind: "query",
          description: "",
          input: z.object({}),
          run: async () => 0,
        }),
      })
    ).toThrow()
  })
})

describe("forChat", () => {
  test("returns ToolError messages and hides other errors", async () => {
    const chat = tools.forChat(user)
    const call = (name: string, input: unknown) =>
      chat[name]!.execute!(
        input as never,
        { toolCallId: "1", messages: [] } as never
      )
    expect(await call("add_item", { name: "taken" })).toEqual({
      error: "That name is taken.",
    })
    expect(await call("add_item", { name: "boom" })).toEqual({
      error: "The tool failed.",
    })
    expect(Object.keys(tools.forChat(user, ["whoami"]))).toEqual(["whoami"])
  })
})

describe("mcp", () => {
  const serve = tools.mcp({
    name: "test",
    version: "0.0.0",
    instructions: "Start with whoami.",
  })
  const rpc = (body: unknown, as: User | undefined = user) =>
    serve(
      new Request("http://localhost/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          "mcp-protocol-version": "2025-06-18",
        },
        body: JSON.stringify(body),
      }),
      as as User
    )
  const result = async (response: Response) => {
    const text = await response.text()
    const json = text.startsWith("{")
      ? text
      : text
          .split("\n")
          .find((line) => line.startsWith("data: "))!
          .slice(6)
    return JSON.parse(json).result
  }

  test("lists the tools except excluded ones, queries read-only", async () => {
    const { tools: listed } = await result(
      await rpc({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} })
    )
    expect(listed.map((t: { name: string }) => t.name).sort()).toEqual([
      "add_item",
      "whoami",
    ])
    expect(
      listed.find((t: { name: string }) => t.name === "whoami").annotations
        .readOnlyHint
    ).toBe(true)
  })
  test("calls a tool as the authenticated person", async () => {
    const out = await result(
      await rpc({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "whoami", arguments: {} },
      })
    )
    expect(JSON.parse(out.content[0].text)).toEqual({ id: "u1" })
  })
  test("hides internal errors from MCP clients too", async () => {
    const out = await result(
      await rpc({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "add_item", arguments: { name: "boom" } },
      })
    )
    expect(out.isError).toBe(true)
    expect(out.content[0].text).toBe("The tool failed.")
  })
})
