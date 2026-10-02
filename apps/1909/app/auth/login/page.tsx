import { Corner, cornerLink } from "@workspace/ui/components/corners"
import { LanguageToggle } from "@workspace/ui/components/locale-provider"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Corner at="top-right">
        <LanguageToggle className={cornerLink} />
      </Corner>
      <LoginForm />
    </div>
  )
}
