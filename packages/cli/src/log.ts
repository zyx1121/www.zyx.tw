const enabled =
  !process.env.NO_COLOR && !process.env.CI && process.stdout.isTTY === true

const wrap = (code: string) => (text: string) =>
  enabled ? `\x1b[${code}m${text}\x1b[0m` : text

export const dim = wrap("2")
export const bold = wrap("1")
export const green = wrap("32")
export const red = wrap("31")
export const yellow = wrap("33")

export const log = {
  info(message: string) {
    console.log(message)
  },
  step(message: string) {
    console.log(`${dim("-")} ${message}`)
  },
  done(message: string) {
    console.log(`${green("+")} ${message}`)
  },
  skip(message: string) {
    console.log(`${dim("=")} ${dim(message)}`)
  },
  warn(message: string) {
    console.warn(`${yellow("!")} ${message}`)
  },
  error(message: string) {
    console.error(`${red("x")} ${message}`)
  },
  blank() {
    console.log("")
  },
}

export function fail(message: string, hint?: string): never {
  log.error(message)
  if (hint) log.info(`  ${dim(hint)}`)
  process.exit(1)
}
