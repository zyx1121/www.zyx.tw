"use client"
import { T, useT } from "@workspace/ui/components/locale-provider"

/* Full-viewport photographs use separately composed portrait sources. */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react"

import { CARREL } from "@/lib/carrel"
import { column } from "@/lib/layout"
import { asset } from "@/lib/made"

function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element || !window.IntersectionObserver) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        element.dataset.visible = "true"
        observer.disconnect()
      },
      { threshold: 0.08 }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className="carrel-reveal">
      {children}
    </div>
  )
}

function Workflow() {
  const t = useT()

  const [step, setStep] = useState(0)
  const current = CARREL.workflow[step]!
  return (
    <div className="carrel-demo">
      <div className="carrel-request">
        <p className="carrel-caption">
          <T>{"Example request"}</T>
        </p>
        <blockquote>
          <T>{CARREL.request}</T>
        </blockquote>
      </div>
      <div className="carrel-choices" aria-label={t("Deployment steps")}>
        {CARREL.workflow.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={step === index}
            aria-controls="carrel-workflow-panel"
            onClick={() => setStep(index)}
          >
            <span className="carrel-caption">
              0<T>{index + 1}</T>
            </span>{" "}
            <T>{item.label}</T>
          </button>
        ))}
      </div>
      <div
        id="carrel-workflow-panel"
        className="carrel-workflow-panel"
        aria-live="polite"
      >
        <div>
          <h3>
            <T>{current.title}</T>
          </h3>
          <p>
            <T>{current.body}</T>
          </p>
        </div>
        <ul>
          {current.lines.map((line) => (
            <li key={line}>
              <T>{line}</T>
            </li>
          ))}
        </ul>
      </div>
      <p className="carrel-caption">
        <T>{"An illustrated workflow. Explore the steps above."}</T>
      </p>
    </div>
  )
}

function Connections() {
  const t = useT()

  const [selected, setSelected] = useState(1)
  return (
    <div className="carrel-demo">
      <div
        className="carrel-network"
        aria-label={t("Example service connections")}
      >
        {CARREL.network.map((node, index) => (
          <button
            type="button"
            key={node.id}
            aria-pressed={selected === index}
            aria-controls="carrel-network-detail"
            onClick={() => setSelected(index)}
          >
            <span>
              <T>{node.label}</T>
            </span>
            <span className="carrel-caption">
              <T>{node.note}</T>
            </span>
          </button>
        ))}
      </div>
      <p
        id="carrel-network-detail"
        className="carrel-network-detail"
        aria-live="polite"
      >
        <T>{CARREL.network[selected]!.detail}</T>
      </p>
      <p className="carrel-caption">
        <T>{"HTTPS → App → Database · TCP 5432"}</T>
      </p>
    </div>
  )
}

function Lifecycle() {
  const t = useT()

  const [selected, setSelected] = useState(0)
  const current = CARREL.lifecycle[selected]!
  return (
    <div className="carrel-demo">
      <div className="carrel-choices" aria-label={t("Environment management")}>
        {CARREL.lifecycle.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected === index}
            aria-controls="carrel-lifecycle-detail"
            onClick={() => setSelected(index)}
          >
            <T>{item.label}</T>
          </button>
        ))}
      </div>
      <div
        id="carrel-lifecycle-detail"
        className="carrel-lifecycle-detail"
        aria-live="polite"
      >
        <h3>
          <T>{current.title}</T>
        </h3>
        <p>
          <T>{current.body}</T>
        </p>
      </div>
    </div>
  )
}

function CopyCode({ label, value }: { label: string; value: string }) {
  const t = useT()

  const [status, setStatus] = useState("")
  useEffect(() => {
    if (!status) return
    const timer = setTimeout(() => setStatus(""), 4000)
    return () => clearTimeout(timer)
  }, [status])
  return (
    <div className="carrel-code">
      <div className="carrel-code-heading">
        <h3>
          <T>{label}</T>
        </h3>
        <button
          type="button"
          aria-label={t("Copy {label}", { label })}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value)
              setStatus("Copied")
            } catch {
              setStatus("Select the text below to copy.")
            }
          }}
        >
          <T>{"Copy ↗"}</T>
        </button>
      </div>
      <pre>
        <code>{value}</code>
      </pre>
      <p className="carrel-copy-status carrel-caption" role="status">
        <T>{status}</T>
      </p>
    </div>
  )
}

function Photograph({
  image,
  portrait,
  alt,
  align = "center",
}: {
  image: string
  portrait: string
  alt: string
  align?: "center" | "right"
}) {
  const t = useT()

  return (
    <figure
      className="carrel-photograph"
      data-made-ink="dark"
      data-align={align}
    >
      <picture>
        <source media="(max-width: 900px)" srcSet={asset("carrel", portrait)} />
        <img
          src={asset("carrel", image)}
          alt={t(alt)}
          width={1920}
          height={1080}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </figure>
  )
}

export function CarrelStory() {
  const t = useT()

  return (
    <div id="story" className="carrel-story">
      <section className="carrel-content" aria-labelledby="carrel-intro-title">
        <div className={column}>
          <Reveal>
            <div className="carrel-introduction">
              <p className="carrel-caption">
                <T>{CARREL.eyebrow}</T>
              </p>
              <h2 id="carrel-intro-title">
                <T>{CARREL.introduction.title}</T>
              </h2>
              <p>
                <T>{CARREL.introduction.body}</T>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
      {CARREL.chapters.map((chapter) => (
        <Fragment key={chapter.id}>
          <Photograph
            image={chapter.image}
            portrait={chapter.portrait}
            alt={t(chapter.alt)}
          />
          <section
            className="carrel-content"
            aria-labelledby={`carrel-${chapter.id}-title`}
          >
            <div className={column}>
              <Reveal>
                <p className="carrel-caption">
                  <T>{chapter.caption}</T>
                </p>
                <div className="carrel-chapter-copy">
                  <div>
                    <p className="carrel-caption">
                      <T>{chapter.number}</T>
                    </p>
                    <h2 id={`carrel-${chapter.id}-title`}>
                      <T>{chapter.title}</T>
                    </h2>
                  </div>
                  <p>
                    <T>{chapter.body}</T>
                  </p>
                </div>
                {chapter.id === "workspace" && <Workflow />}
                {chapter.id === "connections" && <Connections />}
                {chapter.id === "snapshots" && <Lifecycle />}
              </Reveal>
            </div>
          </section>
        </Fragment>
      ))}
      <Photograph
        image={CARREL.start.image}
        portrait={CARREL.start.portrait}
        alt={t(CARREL.start.alt)}
        align="right"
      />
      <section
        id="get-started"
        className="carrel-content"
        aria-labelledby="carrel-start-title"
      >
        <div className={column}>
          <Reveal>
            <div className="carrel-start">
              <p className="carrel-caption">
                <T>{"Get started"}</T>
              </p>
              <h2 id="carrel-start-title">
                <T>{CARREL.start.title}</T>
              </h2>
              <p className="carrel-start-intro">
                <T>{CARREL.start.body}</T>
              </p>
              <CopyCode
                label={t("MCP endpoint")}
                value={CARREL.start.endpoint}
              />
              {CARREL.start.clients.map((client) => (
                <CopyCode
                  key={client.name}
                  label={t(client.name)}
                  value={client.command}
                />
              ))}
              <div className="carrel-first-request">
                <h3>
                  <T>{"Your first request"}</T>
                </h3>
                <blockquote>
                  <T>{CARREL.start.firstRequest}</T>
                </blockquote>
                <p className="carrel-caption">
                  <T>
                    {
                      "Your agent can use a saved public SSH key, or ask you for one."
                    }
                  </T>
                </p>
              </div>
              <Link href="/made" className="carrel-return">
                <T>{"All products ↗"}</T>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
