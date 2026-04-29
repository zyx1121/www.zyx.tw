import Link from "next/link"
import { FaEnvelope } from "react-icons/fa"
import { SiDiscord, SiGithub, SiInstagram } from "react-icons/si"

const CONTACTS = [
  {
    href: "https://www.instagram.com/__zyx1121__",
    icon: SiInstagram,
    label: "Instagram",
  },
  { href: "https://discord.gg/2xcxmWjY", icon: SiDiscord, label: "Discord" },
  { href: "https://github.com/zyx1121", icon: SiGithub, label: "GitHub" },
  {
    href: "mailto:yongxiang.zhan@outlook.com",
    icon: FaEnvelope,
    label: "Email",
  },
] as const

export function Contact() {
  return (
    <section className="flex min-h-dvh w-dvw flex-col items-center justify-center px-8 py-32">
      <div className="mx-auto w-full max-w-4xl space-y-8 font-mono">
        <h2 className="text-3xl font-bold md:text-4xl">Find me here 🔗</h2>
        <div className="flex flex-wrap gap-8 md:gap-10">
          {CONTACTS.map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="duration-base inline-flex flex-col items-center gap-2 text-muted-foreground transition-transform ease-glide hover:scale-125 hover:rotate-6 hover:text-brand"
            >
              <Icon className="h-8 w-8 md:h-10 md:w-10" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
