import { cornerLink } from "@workspace/ui/components/corners"

import { signOut } from "@/app/actions"

/** The signed-in name and a sign-out link, for the top right corner. */
export function UserNav({ name }: { name: string }) {
  return (
    <>
      <span className="text-muted-foreground">{name}</span>
      <form action={signOut} className="flex">
        <button type="submit" className={cornerLink}>
          登出
        </button>
      </form>
    </>
  )
}
