import { PixelIcon } from "@/components/pixel-icon"
import { APPS } from "@/components/apps/registry"
import { TASKBAR_HEIGHT } from "@/lib/constants"

// Menu items are derived straight from the registry (declaration order —
// see components/apps/registry.ts's MANIFESTS array), not a hand-maintained
// whitelist: a new app is a manifest + registry line and nothing else,
// including its start menu entry. Opt out via manifest.startMenuHidden.
const MENU_APPS = Object.values(APPS).filter((app) => !app.startMenuHidden)

export function StartMenu({
  onOpenApp,
  onShutdown,
}: {
  onOpenApp: (id: string) => void
  onShutdown: () => void
}) {
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
        {MENU_APPS.map((app) => (
          <li key={app.id}>
            <button
              type="button"
              className="win98-focusable flex w-full items-center gap-2 px-2 py-1.5 text-left text-win98-text hover:bg-selection hover:text-selection-foreground"
              onClick={() => onOpenApp(app.id)}
            >
              <PixelIcon name={app.icon} size={20} />
              {app.name}
            </button>
          </li>
        ))}
        <li className="my-0.5 border-t border-b border-button-shadow border-b-button-highlight" />
        <li>
          <button
            type="button"
            className="win98-focusable flex w-full items-center gap-2 px-2 py-1.5 text-left text-win98-text hover:bg-selection hover:text-selection-foreground"
            onClick={onShutdown}
          >
            <PixelIcon name="shutdown" size={20} />
            關機...
          </button>
        </li>
      </ul>
    </div>
  )
}
