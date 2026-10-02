/**
 * How long ago `iso` was, in the short form the site's lists use: "42s ago",
 * "5m ago", "3h ago", "6d ago", "2w ago".
 */
export function timeAgo(
  iso: string,
  now = Date.now(),
  locale: "zh-TW" | "en" = "en"
) {
  const diff = Math.max(0, (now - new Date(iso).getTime()) / 1000)
  if (locale === "zh-TW") {
    if (diff < 60) return `${Math.floor(diff)} 秒前`
    if (diff < 3600) return `${Math.floor(diff / 60)} 分鐘前`
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小時前`
    if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`
    return `${Math.floor(diff / 604800)} 週前`
  }
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 604800)}w ago`
}
