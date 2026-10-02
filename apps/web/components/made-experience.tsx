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
import { PLUMP } from "@/lib/plump"

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
}: {
  product: Product
  first: boolean
  detail: boolean
}) {
  const [print, setPrint] = useState(false)
  const Heading = detail ? "h1" : "h2"
  const desktop = print ? "-print.webp" : "-hero.webp"
  const mobile = print ? "-print-portrait.webp" : "-portrait.webp"
  return (
    <section
      className={`made-campaign made-${product.id}`}
      id={product.id}
      data-made-ink="dark"
      aria-labelledby={`${product.id}-headline`}
    >
      <picture className="made-picture">
        <source media="(max-width: 900px)" srcSet={asset(product.id, mobile)} />
        <img
          src={asset(product.id, desktop)}
          alt={
            print
              ? `${product.imageAlt} Rendered in red and black halftone print.`
              : product.imageAlt
          }
          width={1920}
          height={1080}
          loading={first ? "eager" : "lazy"}
          fetchPriority={first ? "high" : "auto"}
        />
      </picture>
      <div className="made-wash" aria-hidden />
      <div className="made-label">
        <span>
          <Mark id={product.id} />
          {product.name}
        </span>
        <span className="made-category">{product.purpose}</span>
      </div>
      <div className="made-copy">
        <Heading id={`${product.id}-headline`}>
          <span className="sr-only">{product.name}: </span>
          {product.headline.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </Heading>
        <p>{product.tagline}</p>
        <a className="made-cta" href={product.href}>
          Open {product.name}
          <span aria-hidden>↗</span>
        </a>
      </div>
      <div className="made-campaign-bottom">
        {product.id === "time" ? (
          <LocalTime />
        ) : product.id === "link" ? (
          <div
            className="made-medium"
            role="group"
            aria-label="Link image style"
          >
            <button
              type="button"
              aria-pressed={!print}
              onClick={() => setPrint(false)}
            >
              Photo
            </button>
            <button
              type="button"
              aria-pressed={print}
              onClick={() => setPrint(true)}
            >
              Print
            </button>
          </div>
        ) : (
          <span>Draw it. Drop it. Plump it.</span>
        )}
        <a href={detail ? "#story" : "#shapes"}>
          {detail ? "Explore" : "The shapes"}{" "}
          <span aria-hidden>{detail ? "↓" : "↑"}</span>
        </a>
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
                  <span>Rotate the model ↗</span>
                </button>
                <div className="made-identity-name">
                  <h2>
                    <Mark id={product.id} />
                    {product.name}
                  </h2>
                  <span>{product.material}</span>
                </div>
                <div className="made-item-links">
                  <a href={`#${product.id}`}>Meet {product.name} ↓</a>
                  <Link href={`/made/${product.id}`}>The story ↗</Link>
                </div>
              </article>
            ))}
          </div>
          <p className="made-family-copy">
            Three shapes. Three personalities. A little more room to play.
          </p>
        </section>
      )}
      {products.map((product) => (
        <div key={product.id}>
          <Campaign
            product={product}
            first={Boolean(selected)}
            detail={Boolean(selected)}
          />
          <section
            className="made-note"
            id={selected ? "story" : undefined}
            data-made-ink="light"
            aria-labelledby={`${product.id}-note`}
          >
            <p className="made-note-label">
              {product.name} / 0{PRODUCTS.indexOf(product) + 1}
            </p>
            <h2 id={`${product.id}-note`}>{product.note}</h2>
            <div>
              <p>{product.body}</p>
              <div className="made-note-links">
                <button type="button" onClick={() => setModel(product.id)}>
                  Pick up the shape ↗
                </button>
                {!selected && (
                  <Link href={`/made/${product.id}`}>The product story ↗</Link>
                )}
              </div>
            </div>
          </section>
          {selected && (
            <section
              className="made-story"
              data-made-ink="light"
              aria-label={`How ${product.name} works`}
            >
              <p className="made-description">{product.description}</p>
              <ol className="made-steps">
                {product.steps.map((step, index) => (
                  <li key={step.title}>
                    <p className="made-eyebrow">0{index + 1}</p>
                    <h2>{step.title}</h2>
                    <p>{step.body}</p>
                  </li>
                ))}
              </ol>
              {product.id === "plump" && (
                <div className="made-details">
                  <dl>
                    {PLUMP.details.map(({ label, value }) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p>{PLUMP.storage}</p>
                  <a href="/made/plump/sample.svg" download="plump.svg">
                    Download the sample SVG ↓
                  </a>
                </div>
              )}
              <div className="made-story-actions">
                <a className="made-cta" href={product.href}>
                  Open {product.name} ↗
                </a>
                <Link href="/made">All Made products ↗</Link>
              </div>
            </section>
          )}
        </div>
      ))}
      <section className="made-end" data-made-ink="light">
        <p>Small ideas, out in the world.</p>
        <Link href="/works">Explore every project ↗</Link>
      </section>
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
