"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useTransition,
} from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  COMMON_MESSAGES,
  DEFAULT_LOCALE,
  localeCookie,
  resolveLocale,
  localeUrl,
  mergeMessages,
  translator,
  type Locale,
  type Messages,
} from "@workspace/ui/lib/i18n"

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE as Locale,
  messages: COMMON_MESSAGES,
})

export function LocaleProvider({
  locale: serverLocale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const locale = resolveLocale(searchParams.get("lang"), serverLocale)
  useEffect(() => {
    document.documentElement.lang = locale
    // Search-only navigations retain layouts. Refresh their server metadata
    // and translations without remounting the application's client state.
    if (locale !== serverLocale) router.refresh()
  }, [locale, serverLocale, router])
  const value = useMemo(
    () => ({ locale, messages: mergeMessages(COMMON_MESSAGES, messages) }),
    [locale, messages]
  )
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext).locale
}

export function useT() {
  const { locale, messages } = useContext(LocaleContext)
  return useMemo(() => translator(locale, messages), [locale, messages])
}

/** A text leaf usable from a Server Component with the same SSR locale. */
export function T({
  children,
  values,
}: {
  children: React.ReactNode
  values?: Record<string, string | number>
}) {
  const t = useT()
  return <>{typeof children === "string" ? t(children, values) : children}</>
}

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocale()
  const t = useT()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const next = locale === "zh-TW" ? "en" : "zh-TW"
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      aria-label={t(
        next === "en" ? "Switch to English" : "Switch to Traditional Chinese"
      )}
      lang={next}
      onClick={() => {
        document.cookie = localeCookie(
          next,
          location.hostname,
          location.protocol === "https:"
        )
        startTransition(() =>
          router.replace(
            localeUrl(
              location.pathname + location.search + location.hash,
              next
            ),
            { scroll: false }
          )
        )
      }}
    >
      {next === "en" ? "EN" : "繁中"}
    </button>
  )
}
