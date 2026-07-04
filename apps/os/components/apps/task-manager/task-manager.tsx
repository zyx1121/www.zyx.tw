"use client"

import * as React from "react"

import { APPS } from "@/components/apps/registry"
import { Button } from "@/components/ui/button"
import { useSystem } from "@/lib/os/sdk/use-system"
import { cn } from "@/lib/utils"
import type { Pid } from "@/lib/os/types"

function formatStartedAt(ms: number) {
  return new Date(ms).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function TaskManagerApp() {
  const { processes, kill } = useSystem()
  const [selected, setSelected] = React.useState<Pid | null>(null)

  const handleEndTask = () => {
    if (selected === null) return
    kill(selected)
    setSelected(null)
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="bevel-sunken flex-1 overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bevel-raised sticky top-0 bg-surface text-win98-text">
              <th className="px-2 py-1 font-normal">名稱</th>
              <th className="px-2 py-1 font-normal">PID</th>
              <th className="px-2 py-1 font-normal">啟動時間</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <tr
                key={process.pid}
                className={cn(
                  "cursor-default select-none",
                  selected === process.pid &&
                    "bg-selection text-selection-foreground"
                )}
                onClick={() => setSelected(process.pid)}
              >
                <td className="truncate px-2 py-0.5">
                  {APPS[process.appId]?.name ?? process.appId}
                </td>
                <td className="px-2 py-0.5">{process.pid}</td>
                <td className="px-2 py-0.5">
                  {formatStartedAt(process.startedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button
          tone="default"
          onClick={handleEndTask}
          disabled={selected === null}
        >
          結束工作
        </Button>
      </div>
    </div>
  )
}
