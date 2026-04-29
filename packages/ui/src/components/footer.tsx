import { DaysAlive } from "./days-alive"

type FooterProps = {
  birthday: string
}

export function Footer({ birthday }: FooterProps) {
  return (
    <>
      <DaysAlive birthday={birthday} />
      <span className="fixed right-4 bottom-4 z-50 font-mono text-sm text-muted-foreground">
        © 2026
      </span>
    </>
  )
}
