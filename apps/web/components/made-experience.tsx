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
  type ReactNode,
  type CSSProperties,
} from "react"

import { asset, MADE, PRODUCTS, type Product, type ProductId } from "@/lib/made"

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
  first,
  detail,
  onModel,
}: {
  product: Product
  first: boolean
  detail: boolean
  onModel: (id: ProductId) => void
}) {
  const Heading = detail ? "h1" : "h2"
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
          loading={first ? "eager" : "lazy"}
          fetchPriority={first ? "high" : "auto"}
        />
      </picture>
      <div className="made-wash" aria-hidden />
      <div className="made-label" aria-hidden>
        <Mark id={product.id} />
      </div>
      <div className="made-copy">
        <Heading id={`${product.id}-headline`}>{product.name}</Heading>
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
        <Link href={detail ? "/made" : `/made/${product.id}`}>
          {detail ? "All products" : "View product"} ↗
        </Link>
      </div>
    </section>
  )
}

export function MadeExperience({ product: selected }: { product?: ProductId }) {
  const products = selected
    ? PRODUCTS.filter((p) => p.id === selected)
    : PRODUCTS
  const [silhouette, setSilhouette] = useState(false)
  const [model, setModel] = useState<ProductId | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const main = useRef<HTMLElement>(null)

  useEffect(() => {
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
            section?.id === "time" && window.innerWidth > 900
              ? "var(--color-white)"
              : section?.dataset.madeInk === "dark"
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
      className="made-page dark"
      data-made-detail={Boolean(selected)}
    >
      {!selected && (
        <section
          className="made-identities"
          id="shapes"
          data-made-ink="light"
          aria-labelledby="made-title"
        >
          <div className="made-identity-head">
            <div>
              <p className="made-eyebrow">Products by zyx</p>
              <h1 id="made-title">{MADE.title}</h1>
            </div>
            <div
              className="made-switch"
              role="group"
              aria-label="Product icon view"
            >
              <button
                type="button"
                aria-pressed={!silhouette}
                onClick={() => setSilhouette(false)}
              >
                Material
              </button>
              <button
                type="button"
                aria-pressed={silhouette}
                onClick={() => setSilhouette(true)}
              >
                Shape
              </button>
            </div>
          </div>
          <div className="made-grid">
            {PRODUCTS.map((product, index) => (
              <article key={product.id}>
                <button
                  className="made-object"
                  type="button"
                  aria-label={`Rotate the ${product.name} 3D model`}
                  onClick={() => setModel(product.id)}
                >
                  <img
                    className={silhouette ? "made-silhouette" : ""}
                    src={asset(
                      product.id,
                      silhouette ? ".svg" : "-material.webp"
                    )}
                    alt={`${product.name}, ${silhouette ? "geometric silhouette" : product.material}`}
                    width={1024}
                    height={1024}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  <span>View 3D ↗</span>
                </button>
                <div className="made-identity-name">
                  <h2>
                    <Mark id={product.id} />
                    {product.name}
                  </h2>
                  <span>{product.purpose}</span>
                </div>
                <div className="made-item-links">
                  <a href={`#${product.id}`}>View ↓</a>
                  <a href={product.href}>Open ↗</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {products.map((product) => (
        <Campaign
          key={product.id}
          product={product}
          first={Boolean(selected)}
          detail={Boolean(selected)}
          onModel={setModel}
        />
      ))}
      {!selected && (
        <section className="made-end" data-made-ink="light">
          <Link href="/works">All projects ↗</Link>
        </section>
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
