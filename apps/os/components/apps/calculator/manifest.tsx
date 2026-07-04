import type { OsAppManifest } from "@/lib/os/types"
import { CalculatorApp } from "@/components/apps/calculator/calculator"

export const calculatorManifest: OsAppManifest = {
  id: "calculator",
  name: "小算盤",
  description: "基本四則運算。",
  icon: "calculator",
  window: {
    width: 200,
    height: 184,
    resizable: false,
    controls: ["minimize", "close"],
  },
  multiInstance: true,
  Component: CalculatorApp,
}
