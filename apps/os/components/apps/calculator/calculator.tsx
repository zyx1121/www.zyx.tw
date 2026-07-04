"use client"

import * as React from "react"

import { useDialogs } from "@/lib/os/sdk/use-dialogs"
import { cn } from "@/lib/utils"

type Operator = "+" | "-" | "×" | "÷"

const MAX_DIGITS = 16

function compute(a: number, b: number, op: Operator): number {
  switch (op) {
    case "+":
      return a + b
    case "-":
      return a - b
    case "×":
      return a * b
    case "÷":
      return a / b
  }
}

/** Trims binary floating-point noise (0.1 + 0.2 → "0.3", not
 * "0.30000000000000004") the way a real calculator's fixed display does. */
function formatValue(n: number): string {
  if (!Number.isFinite(n)) return "0"
  return Number(n.toPrecision(12)).toString()
}

function CalcButton({
  label,
  onClick,
  ariaLabel,
}: {
  label: string
  onClick: () => void
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="bevel-raised win98-focusable active:bevel-pressed flex h-8 items-center justify-center bg-surface text-win98-text select-none active:translate-x-px active:translate-y-px"
    >
      {label}
    </button>
  )
}

/** Win98 小算盤 — APP-SPEC.md 的規範示範:基本四則運算,元件內部自己管
 * 狀態,只在「除以零」這種需要打斷使用者的地方碰 SDK(useDialogs)。 */
export function CalculatorApp() {
  const { msgBox } = useDialogs()

  const [display, setDisplay] = React.useState("0")
  const [previousValue, setPreviousValue] = React.useState<number | null>(null)
  const [pendingOp, setPendingOp] = React.useState<Operator | null>(null)
  const [overwrite, setOverwrite] = React.useState(true)

  const inputDigit = (digit: string) => {
    setDisplay((current) => {
      if (overwrite || current === "0") return digit
      if (current.replace("-", "").length >= MAX_DIGITS) return current
      return current + digit
    })
    setOverwrite(false)
  }

  const inputDecimal = () => {
    setDisplay((current) => {
      if (overwrite) return "0."
      return current.includes(".") ? current : `${current}.`
    })
    setOverwrite(false)
  }

  const clearAll = () => {
    setDisplay("0")
    setPreviousValue(null)
    setPendingOp(null)
    setOverwrite(true)
  }

  const clearEntry = () => {
    setDisplay("0")
    setOverwrite(true)
  }

  const backspace = () => {
    if (overwrite) return
    setDisplay((current) => {
      const next = current.slice(0, -1)
      return next === "" || next === "-" ? "0" : next
    })
  }

  const toggleSign = () => {
    setDisplay((current) => {
      if (current === "0") return current
      return current.startsWith("-") ? current.slice(1) : `-${current}`
    })
  }

  const chooseOperator = (op: Operator) => {
    const current = Number.parseFloat(display)
    if (previousValue !== null && pendingOp && !overwrite) {
      const result = compute(previousValue, current, pendingOp)
      setDisplay(formatValue(result))
      setPreviousValue(result)
    } else {
      setPreviousValue(current)
    }
    setPendingOp(op)
    setOverwrite(true)
  }

  const equals = async () => {
    if (pendingOp === null || previousValue === null) return
    const current = Number.parseFloat(display)
    if (pendingOp === "÷" && current === 0) {
      await msgBox({
        title: "小算盤",
        message: "不能除以零。",
        icon: "error",
      })
      setPendingOp(null)
      setPreviousValue(null)
      setOverwrite(true)
      return
    }
    const result = compute(previousValue, current, pendingOp)
    setDisplay(formatValue(result))
    setPendingOp(null)
    setPreviousValue(null)
    setOverwrite(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div
        className={cn(
          "bevel-sunken flex h-8 items-center justify-end bg-white px-2",
          "font-bold text-win98-text"
        )}
      >
        <span data-testid="calc-display" className="truncate">
          {display}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        <CalcButton label="C" onClick={clearAll} />
        <CalcButton label="CE" onClick={clearEntry} />
        <CalcButton label="⌫" ariaLabel="退格" onClick={backspace} />
        <CalcButton label="÷" onClick={() => chooseOperator("÷")} />

        <CalcButton label="7" onClick={() => inputDigit("7")} />
        <CalcButton label="8" onClick={() => inputDigit("8")} />
        <CalcButton label="9" onClick={() => inputDigit("9")} />
        <CalcButton label="×" onClick={() => chooseOperator("×")} />

        <CalcButton label="4" onClick={() => inputDigit("4")} />
        <CalcButton label="5" onClick={() => inputDigit("5")} />
        <CalcButton label="6" onClick={() => inputDigit("6")} />
        <CalcButton label="-" onClick={() => chooseOperator("-")} />

        <CalcButton label="1" onClick={() => inputDigit("1")} />
        <CalcButton label="2" onClick={() => inputDigit("2")} />
        <CalcButton label="3" onClick={() => inputDigit("3")} />
        <CalcButton label="+" onClick={() => chooseOperator("+")} />

        <CalcButton label="+/-" onClick={toggleSign} />
        <CalcButton label="0" onClick={() => inputDigit("0")} />
        <CalcButton label="." onClick={inputDecimal} />
        <CalcButton label="=" onClick={() => void equals()} />
      </div>
    </div>
  )
}
