import "./globals.css"

export const metadata = {
  title: "os",
  description: "一個活在瀏覽器裡的 Win98 風格桌面 POC。",
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
