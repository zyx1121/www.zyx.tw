import "./globals.css"

export const metadata = {
  title: "OS 98",
  description: "os.zyx.tw —— 一個活在瀏覽器裡的 Win98 風格桌面作業系統。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  )
}
