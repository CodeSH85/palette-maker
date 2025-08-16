export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toLowerCase())
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert RGBA object to hex string.
 * @example
 * ```js
 * rgbToHex({ r: 0.5, g: 0.5, b: 0.5, a: 1 }) // "#7f7f7f"
 * rgbToHex({ r: 0.5, g: 0.5, b: 0.5, a: 0.5 }) // "#7f7f7f80"
 * ```
 */
export function rgbToHex({ r, g, b, a }: RGBA): `#${string}` {

  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  const hex = [toHex(r), toHex(g), toHex(b)].join('')

  const validAlpha = a !== undefined && a !== 1 && a !== null
  if (validAlpha) {
    return `#${hex}${toHex(a)}`
  } else {
    return `#${hex}`
  }
}

export function isValidHex(hex: string): hex is `#${string}` {
  return /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)
}

export function hexToRGBA(hex: `#${string}`): RGBA | null {
  const match = isValidHex(hex) ? hex.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i) : null
  if (!match) return null

  const r = parseInt(match[1].slice(0, 2), 16) / 255
  const g = parseInt(match[1].slice(2, 4), 16) / 255
  const b = parseInt(match[1].slice(4, 6), 16) / 255
  const a = match[2] ? parseInt(match[2], 16) / 255 : null

  if (a === null) {
    return { r, g, b, a: 1 }
  } else {
    return { r, g, b, a }
  }
}
