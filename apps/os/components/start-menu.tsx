import { PixelIcon } from "@/components/pixel-icon"
import { APPS } from "@/components/apps/registry"
import { cn } from "@/lib/utils"
import { TASKBAR_HEIGHT } from "@/lib/constants"

const MENU_ITEMS: string[] = [
  "notepad",
  "control-panel",
  "task-manager",
  "about",
]

export function StartMenu({ onOpenApp }: { onOpenApp: (id: string) => void }) {
  return (
    <div
      className="bevel-raised absolute left-0 flex w-56 bg-surface"
      style={{ bottom: TASKBAR_HEIGHT, zIndex: 1000 }}
    >
      <div className="flex w-6 shrink-0 items-end bg-selection pb-2">
        <span className="rotate-180 text-sm font-bold tracking-widest text-white [writing-mode:vertical-rl]">
          OS 98
        </span>
      </div>
      <ul className="m-0 flex flex-1 list-none flex-col gap-0.5 p-0.5">
        {MENU_ITEMS.map((id) => {
          const app = APPS[id]
          if (!app) return null
          return (
            <li key={id}>
              <button
                type="button"
                className="win98-focusable flex w-full items-center gap-2 px-2 py-1.5 text-left text-win98-text hover:bg-selection hover:text-selection-foreground"
                onClick={() => onOpenApp(id)}
              >
                <PixelIcon name={app.icon} size={20} />
                {app.name}
              </button>
            </li>
          )
        })}
        <li className="my-0.5 border-t border-b border-button-shadow border-b-button-highlight" />
        <li>
          <button
            type="button"
            disabled
            className={cn(
              "flex w-full items-center gap-2 px-2 py-1.5 text-left text-button-shadow",
              "[text-shadow:1px_1px_0_var(--color-button-highlight)]"
            )}
          >
            <PixelIcon name="shutdown" size={20} />
            關機...
          </button>
        </li>
      </ul>
    </div>
  )
}
