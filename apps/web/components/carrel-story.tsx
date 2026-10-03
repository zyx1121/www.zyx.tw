"use client"

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
  const [step, setStep] = useState(0)
  const current = CARREL.workflow[step]!
  return (
    <div className="carrel-demo">
      <div className="carrel-request">
        <p className="carrel-caption">Example request</p>
        <blockquote>{CARREL.request}</blockquote>
      </div>
      <div className="carrel-choices" aria-label="Deployment steps">
        {CARREL.workflow.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={step === index}
            aria-controls="carrel-workflow-panel"
            onClick={() => setStep(index)}
          >
            <span className="carrel-caption">0{index + 1}</span> {item.label}
          </button>
        ))}
      </div>
      <div
        id="carrel-workflow-panel"
        className="carrel-workflow-panel"
        aria-live="polite"
      >
        <div>
          <h3>{current.title}</h3>
          <p>{current.body}</p>
        </div>
        <ul>
          {current.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      <p className="carrel-caption">
        An illustrated workflow. Explore the steps above.
      </p>
    </div>
  )
}

function Connections() {
  const [selected, setSelected] = useState(1)
  return (
    <div className="carrel-demo">
      <div className="carrel-network" aria-label="Example service connections">
        {CARREL.network.map((node, index) => (
          <button
            type="button"
            key={node.id}
            aria-pressed={selected === index}
            aria-controls="carrel-network-detail"
            onClick={() => setSelected(index)}
          >
            <span>{node.label}</span>
            <span className="carrel-caption">{node.note}</span>
          </button>
        ))}
      </div>
      <p
        id="carrel-network-detail"
        className="carrel-network-detail"
        aria-live="polite"
      >
        {CARREL.network[selected]!.detail}
      </p>
      <p className="carrel-caption">HTTPS → App → Database · TCP 5432</p>
    </div>
  )
}

function Lifecycle() {
  const [selected, setSelected] = useState(0)
  const current = CARREL.lifecycle[selected]!
  return (
    <div className="carrel-demo">
      <div className="carrel-choices" aria-label="Environment management">
        {CARREL.lifecycle.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected === index}
            aria-controls="carrel-lifecycle-detail"
            onClick={() => setSelected(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        id="carrel-lifecycle-detail"
        className="carrel-lifecycle-detail"
        aria-live="polite"
      >
        <h3>{current.title}</h3>
        <p>{current.body}</p>
      </div>
    </div>
  )
}

function CopyCode({ label, value }: { label: string; value: string }) {
  const [status, setStatus] = useState("")
  useEffect(() => {
    if (!status) return
    const timer = setTimeout(() => setStatus(""), 4000)
    return () => clearTimeout(timer)
  }, [status])
  return (
    <div className="carrel-code">
      <div className="carrel-code-heading">
        <h3>{label}</h3>
        <button
          type="button"
          aria-label={`Copy ${label}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value)
              setStatus("Copied")
            } catch {
              setStatus("Select the text below to copy.")
            }
          }}
        >
          Copy ↗
        </button>
      </div>
      <pre>
        <code>{value}</code>
      </pre>
      <p className="carrel-copy-status carrel-caption" role="status">
        {status}
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
          alt={alt}
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
  return (
    <div id="story" className="carrel-story">
      <section className="carrel-content" aria-labelledby="carrel-intro-title">
        <div className={column}>
          <Reveal>
            <div className="carrel-introduction">
              <p className="carrel-caption">{CARREL.eyebrow}</p>
              <h2 id="carrel-intro-title">{CARREL.introduction.title}</h2>
              <p>{CARREL.introduction.body}</p>
            </div>
          </Reveal>
        </div>
      </section>
      {CARREL.chapters.map((chapter) => (
        <Fragment key={chapter.id}>
          <Photograph
            image={chapter.image}
            portrait={chapter.portrait}
            alt={chapter.alt}
          />
          <section
            className="carrel-content"
            aria-labelledby={`carrel-${chapter.id}-title`}
          >
            <div className={column}>
              <Reveal>
                <p className="carrel-caption">{chapter.caption}</p>
                <div className="carrel-chapter-copy">
                  <div>
                    <p className="carrel-caption">{chapter.number}</p>
                    <h2 id={`carrel-${chapter.id}-title`}>{chapter.title}</h2>
                  </div>
                  <p>{chapter.body}</p>
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
        alt={CARREL.start.alt}
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
              <p className="carrel-caption">Get started</p>
              <h2 id="carrel-start-title">{CARREL.start.title}</h2>
              <p className="carrel-start-intro">{CARREL.start.body}</p>
              <CopyCode label="MCP endpoint" value={CARREL.start.endpoint} />
              {CARREL.start.clients.map((client) => (
                <CopyCode
                  key={client.name}
                  label={client.name}
                  value={client.command}
                />
              ))}
              <div className="carrel-first-request">
                <h3>Your first request</h3>
                <blockquote>{CARREL.start.firstRequest}</blockquote>
                <p className="carrel-caption">
                  Your agent can use a saved public SSH key, or ask you for one.
                </p>
              </div>
              <Link href="/made" className="carrel-return">
                All products ↗
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
