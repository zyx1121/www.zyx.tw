import { signOut } from "@/app/actions"
import { Button } from "@/components/ui/button"

export function UserNav({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{name}</span>
      <form action={signOut}>
        <Button variant="ghost" size="sm" type="submit">
          登出
        </Button>
      </form>
    </div>
  )
}
