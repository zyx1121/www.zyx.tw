"use client"

/* Native picture sources preserve the separately composed mobile images. */
/* eslint-disable @next/next/no-img-element */
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  Component,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type CSSProperties,
} from "react"

import { MaskReveal } from "@workspace/ui/components/ui/mask-reveal"
import { cn } from "@workspace/ui/lib/utils"

import { Hero } from "@/components/hero"
import { column, enter, enterRow, ENTER, page } from "@/lib/layout"
import { asset, MADE, PRODUCTS, type Product, type ProductId } from "@/lib/made"
import { useReducedMotion } from "@/lib/use-reduced-motion"

const PORTRAIT_QUERY = "(max-width: 900px)"

function subscribePortrait(onChange: () => void) {
  const query = window.matchMedia(PORTRAIT_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function CampaignVideo({ id, portrait }: { id: ProductId; portrait: boolean }) {
  const video = useRef<HTMLVideoElement>(null)
  const userPaused = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const element = video.current
    if (!element || failed) return
    const sync = () => {
      if (document.hidden) element.pause()
      else if (!userPaused.current) void element.play().catch(() => {})
    }
    element.muted = true
    sync()
    document.addEventListener("visibilitychange", sync)
    return () => {
      document.removeEventListener("visibilitychange", sync)
      element.pause()
    }
  }, [failed])

  if (failed) return null

  return (
    <>
      <video
        ref={video}
        className="made-motion-video"
        src={asset(id, portrait ? "-portrait-motion.mp4" : "-hero-motion.mp4")}
        poster={asset(id, portrait ? "-portrait.webp" : "-hero.webp")}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      />
      <button
        type="button"
        className="made-cta made-motion-toggle"
        aria-label={`${playing ? "Pause" : "Play"} background animation`}
        onClick={() => {
          const element = video.current
          if (!element) return
          userPaused.current = !element.paused
          if (userPaused.current) element.pause()
          else void element.play().catch(() => {})
        }}
      >
        {playing ? "Pause" : "Play"}
      </button>
    </>
  )
}

function CampaignMotion({ id }: { id: ProductId }) {
  const reducedMotion = useReducedMotion()
  const portrait = useSyncExternalStore(
    subscribePortrait,
    () => window.matchMedia(PORTRAIT_QUERY).matches,
    () => null
  )
  if (reducedMotion || portrait === null) return null
  return <CampaignVideo key={`${id}-${portrait}`} id={id} portrait={portrait} />
}

const Model = dynamic(() => import("@/components/made-scene"), {
  ssr: false,
  loading: () => <p role="status">Loading model…</p>,
})

class ModelBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <p role="status">
        3D is unavailable in this browser. You can download the scene and open
        it in Plump.
      </p>
    ) : (
      this.props.children
    )
  }
}

function Mark({ id }: { id: ProductId }) {
  return (
    <span
      className="made-mark"
      aria-hidden
      style={{ "--made-mark": `url(${asset(id, ".svg")})` } as CSSProperties}
    />
  )
}

function LocalTime() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    const tick = () => {
      if (!document.hidden) setNow(new Date())
    }
    tick()
    const timer = setInterval(tick, 1000)
    document.addEventListener("visibilitychange", tick)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", tick)
    }
  }, [])
  return (
    <time
      className="made-clock"
      dateTime={now?.toISOString()}
      aria-label="Your local time"
    >
      {now?.toLocaleTimeString("en-GB", { hour12: false }) ?? "--:--:--"}
    </time>
  )
}

function Campaign({
  product,
  onModel,
}: {
  product: Product
  onModel: (id: ProductId) => void
}) {
  return (
    <section
      className={`made-campaign made-${product.id}`}
      id={product.id}
      data-made-ink="dark"
      aria-labelledby={`${product.id}-headline`}
    >
      <picture className="made-picture">
        <source
          media="(max-width: 900px)"
          srcSet={asset(product.id, "-portrait.webp")}
        />
        <img
          src={asset(product.id, "-hero.webp")}
          alt={product.imageAlt}
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
        />
      </picture>
      <CampaignMotion id={product.id} />
      <div className="made-wash" aria-hidden />
      <div className="made-label" aria-hidden>
        <Mark id={product.id} />
      </div>
      <div className="made-copy">
        <h1 id={`${product.id}-headline`}>{product.name}</h1>
        <p>{product.purpose}</p>
        <a className="made-cta" href={product.href}>
          Open {product.name}
          <span aria-hidden>↗</span>
        </a>
      </div>
      <div className="made-campaign-bottom">
        <div className="made-campaign-tools">
          {product.id === "time" && <LocalTime />}
          <button type="button" onClick={() => onModel(product.id)}>
            View 3D ↗
          </button>
        </div>
        <Link href="/made">All products ↗</Link>
      </div>
    </section>
  )
}

export function MadeExperience({ product: selected }: { product?: ProductId }) {
  const selectedProduct = PRODUCTS.find((product) => product.id === selected)
  const [model, setModel] = useState<ProductId | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const main = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!selected) return
    let frame = 0
    const update = () => {
      const sections =
        main.current?.querySelectorAll<HTMLElement>("[data-made-ink]")
      const root = document.documentElement
      for (const [edge, y] of [
        ["top", 32],
        ["bottom", window.innerHeight - 32],
      ] as const) {
        const section = Array.from(sections ?? []).find((element) => {
          const rect = element.getBoundingClientRect()
          return rect.top <= y && rect.bottom > y
        })
        if (edge === "top") {
          root.style.setProperty(
            "--made-logo-ink",
            section?.dataset.madeInk === "dark"
              ? "var(--color-black)"
              : "var(--color-white)"
          )
        }
        root.style.setProperty(
          `--made-${edge}-ink`,
          section?.dataset.madeInk === "dark"
            ? "var(--color-black)"
            : "var(--color-white)"
        )
      }
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      document.documentElement.style.removeProperty("--made-top-ink")
      document.documentElement.style.removeProperty("--made-bottom-ink")
      document.documentElement.style.removeProperty("--made-logo-ink")
    }
  }, [selected])

  useEffect(() => {
    const element = dialog.current
    if (!model || !element) return
    element.showModal()
    const hide = () => {
      if (document.hidden) element.close()
    }
    document.addEventListener("visibilitychange", hide)
    return () => {
      element.close()
      document.removeEventListener("visibilitychange", hide)
    }
  }, [model])

  return (
    <main
      ref={main}
      className={cn("made-page", selected ? "dark" : [column, page, "flex-1"])}
      data-made-detail={Boolean(selected)}
    >
      {!selected && (
        <section id="shapes" aria-labelledby="made-title">
          <Hero
            title={
              <h1
                id="made-title"
                className="text-2xl/8 font-medium text-pretty"
              >
                {MADE.title}
              </h1>
            }
            subtitle="Products by zyx"
          />
          <div className="made-grid">
            {PRODUCTS.map((product, index) => (
              <article
                key={product.id}
                className={enter}
                style={enterRow(index + 3)}
              >
                <Link
                  className="made-card"
                  href={`/made/${product.id}`}
                  aria-label={`View ${product.name}`}
                >
                  <div className="made-object">
                    <MaskReveal
                      delay={(index + 3) * ENTER.row}
                      duration={600}
                      className="h-full w-full"
                    >
                      <img
                        src={asset(product.id, "-material.webp")}
                        alt={`${product.name}, ${product.material}`}
                        width={1024}
                        height={1024}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </MaskReveal>
                  </div>
                  <div className="made-identity-name">
                    <h2>
                      <Mark id={product.id} />
                      {product.name}
                    </h2>
                    <span>{product.purpose}</span>
                  </div>
                  <span className="made-item-link">View ↗</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
      {selectedProduct && (
        <Campaign product={selectedProduct} onModel={setModel} />
      )}
      <dialog
        ref={dialog}
        className="made-dialog"
        aria-labelledby="made-model-title"
        onClose={() => setModel(null)}
        onClick={(event) => {
          if (event.target !== dialog.current) return
          const rect = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            event.currentTarget.close()
        }}
      >
        <div className="made-model-head">
          <h2 id="made-model-title">
            {PRODUCTS.find((p) => p.id === model)?.name}
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            autoFocus
          >
            Close ×
          </button>
        </div>
        <div className="made-model-stage">
          {model && (
            <ModelBoundary key={model}>
              <Model product={model} />
            </ModelBoundary>
          )}
        </div>
        <div className="made-model-footer">
          <p>Drag to rotate. Scroll to zoom.</p>
          {model && (
            <div>
              <a href={asset(model, ".svg")} download>
                SVG ↓
              </a>
              <a href={asset(model, ".scene.json")} download>
                Scene ↓
              </a>
              <a href={asset(model, ".glb")} download>
                GLB ↓
              </a>
            </div>
          )}
        </div>
      </dialog>
    </main>
  )
}
