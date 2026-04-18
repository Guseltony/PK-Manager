const clamp = (value: number) => Math.max(0, Math.min(255, value));

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "").trim();
  if (![3, 6].includes(normalized.length)) return null;

  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  const num = Number.parseInt(expanded, 16);
  if (Number.isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function getTagColorStyle(color?: string | null) {
  if (!color) return undefined;
  const rgb = hexToRgb(color);

  if (!rgb) {
    return {
      borderColor: color,
      color,
      backgroundColor: "rgba(255,255,255,0.06)",
    };
  }

  return {
    color,
    borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`,
    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`,
    boxShadow: `inset 0 0 0 1px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
  };
}

export function getTagTextStyle(color?: string | null) {
  if (!color) return undefined;
  return { color };
}

export function getTagIconStyle(color?: string | null) {
  if (!color) return undefined;
  const rgb = hexToRgb(color);
  if (!rgb) {
    return {
      color,
      backgroundColor: "rgba(255,255,255,0.06)",
    };
  }

  return {
    color,
    backgroundColor: `rgba(${clamp(rgb.r)}, ${clamp(rgb.g)}, ${clamp(rgb.b)}, 0.16)`,
  };
}
