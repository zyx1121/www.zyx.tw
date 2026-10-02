import { cache } from "react"
import { cookies, headers } from "next/headers"
import type { Metadata } from "next"

import {
  COMMON_MESSAGES,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  localeUrl,
  mergeMessages,
  resolveLocale,
  translator,
  type Messages,
} from "./i18n"

export const getLocale = cache(async () => {
  const [requestHeaders, cookieStore] = await Promise.all([
    headers(),
    cookies(),
  ])
  return resolveLocale(
    requestHeaders.get(LOCALE_HEADER),
    cookieStore.get(LOCALE_COOKIE)?.value
  )
})

export async function getI18n(messages: Messages = {}) {
  const locale = await getLocale()
  return {
    locale,
    t: translator(locale, mergeMessages(COMMON_MESSAGES, messages)),
  }
}

/** Translate metadata text without changing product names, identifiers or assets. */
export async function localizedMetadata(
  source: Metadata,
  messages: Messages,
  path?: string
): Promise<Metadata> {
  const { locale, t } = await getI18n(messages)
  const titleText = (value: string) =>
    t(value) !== value
      ? t(value)
      : value
          .split(" | ")
          .map((part) => t(part))
          .join(" | ")
  const translateTitle = (value: Metadata["title"]) =>
    typeof value === "string"
      ? titleText(value)
      : value && "default" in value
        ? { ...value, default: titleText(value.default) }
        : value && "absolute" in value
          ? { ...value, absolute: titleText(value.absolute) }
          : value
  const title = translateTitle(source.title)
  const description = source.description
    ? t(source.description)
    : source.description
  const canonical = path
    ? locale === "en"
      ? localeUrl(path, locale)
      : path
    : undefined
  return {
    ...source,
    // Omitted page fields must keep inheriting their root layout values.
    ...("title" in source ? { title } : {}),
    ...("description" in source ? { description } : {}),
    ...(source.openGraph
      ? {
          openGraph: {
            ...source.openGraph,
            locale: locale === "en" ? "en_US" : "zh_TW",
            alternateLocale: locale === "en" ? "zh_TW" : "en_US",
            ...(source.openGraph.title
              ? {
                  title:
                    typeof source.openGraph.title === "string"
                      ? titleText(source.openGraph.title)
                      : source.openGraph.title,
                }
              : {}),
            ...(source.openGraph.description
              ? { description: t(source.openGraph.description) }
              : {}),
            ...(canonical ? { url: canonical } : {}),
          },
        }
      : {}),
    ...(source.twitter
      ? {
          twitter: {
            ...source.twitter,
            ...(source.twitter.title
              ? {
                  title:
                    typeof source.twitter.title === "string"
                      ? titleText(source.twitter.title)
                      : source.twitter.title,
                }
              : {}),
            ...(source.twitter.description
              ? { description: t(source.twitter.description) }
              : {}),
          },
        }
      : {}),
    ...(path
      ? {
          alternates: {
            ...source.alternates,
            canonical,
            languages: {
              "zh-Hant": path,
              en: localeUrl(path, "en"),
              "x-default": path,
            },
            ...(source.alternates?.types?.["text/markdown"] &&
            typeof source.alternates.types["text/markdown"] === "string"
              ? {
                  types: {
                    ...source.alternates.types,
                    "text/markdown": localeUrl(
                      source.alternates.types["text/markdown"],
                      locale
                    ),
                  },
                }
              : {}),
          },
        }
      : {}),
  }
}
