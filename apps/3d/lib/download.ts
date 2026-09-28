/** Saves a file the page made, such as an export, through the browser's downloads. */
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  // Safari cancels the download when the URL is revoked in the same task.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
