export const DEFAULT_LOCALE = "zh-TW" as const
export const LOCALE_COOKIE = "zyx_locale"
export const LOCALE_HEADER = "x-zyx-locale"
export type Locale = "zh-TW" | "en"
export type Messages = Partial<Record<Locale, Record<string, string>>>

export function isLocale(value: unknown): value is Locale {
  return value === "zh-TW" || value === "en"
}

export function resolveLocale(
  explicit?: string | null,
  saved?: string | null
): Locale {
  return isLocale(explicit)
    ? explicit
    : isLocale(saved)
      ? saved
      : DEFAULT_LOCALE
}

export function cookieDomain(hostname: string) {
  return hostname === "zyx.tw" || hostname.endsWith(".zyx.tw")
    ? ".zyx.tw"
    : undefined
}

export function localeCookie(
  locale: Locale,
  hostname: string,
  secure: boolean
) {
  const domain = cookieDomain(hostname)
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${domain ? `; Domain=${domain}` : ""}${secure ? "; Secure" : ""}`
}

export function localeUrl(href: string, locale: Locale) {
  const url = new URL(href, "https://www.zyx.tw")
  url.searchParams.set("lang", locale)
  return href.startsWith("/")
    ? `${url.pathname}${url.search}${url.hash}`
    : url.href
}

export function translator(locale: Locale, messages: Messages = {}) {
  return (source: string, values: Record<string, string | number> = {}) => {
    const translated = messages[locale]?.[source] ?? source
    return translated.replace(/\{(\w+)\}/g, (match, key: string) =>
      Object.hasOwn(values, key) ? String(values[key]) : match
    )
  }
}

export function mergeMessages(...sources: Messages[]): Messages {
  return {
    "zh-TW": Object.assign({}, ...sources.map((source) => source["zh-TW"])),
    en: Object.assign({}, ...sources.map((source) => source.en)),
  }
}

export const COMMON_MESSAGES: Messages = {
  "zh-TW": {
    Home: "首頁",
    Main: "主要導覽",
    Privacy: "隱私權",
    Terms: "條款",
    "What every zyx.tw site stores and logs": "zyx.tw 各站儲存與記錄的資料",
    "The rules for every zyx.tw site": "zyx.tw 各站的使用規則",
    "zyx, home": "zyx 首頁",
    "About this product": "關於這個產品",
    "Toggle theme": "切換外觀",
    "Switch to English": "切換為英文",
    "Switch to Traditional Chinese": "切換為繁體中文",
    Copy: "複製",
    Copied: "已複製",
    Close: "關閉",
    Cancel: "取消",
    Save: "儲存",
    Delete: "刪除",
    "Loading…": "載入中…",
    "Not found": "找不到頁面",
    "Not found.": "找不到頁面。",
    "This page does not exist.": "這個頁面不存在。",
    "Go home": "回到首頁",
    "Back to home": "回到首頁",
    Components: "元件",
    Apps: "應用",
    Made: "產品",
    Works: "作品",
    About: "關於",
  },
}
