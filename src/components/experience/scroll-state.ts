export const clampProgress = (value: number): number =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0

export function getChapter(value: number): number {
  const progress = clampProgress(value)
  if (progress < 0.17) return 0
  if (progress < 0.355) return 1
  if (progress < 0.535) return 2
  if (progress < 0.695) return 3
  return 4
}

export function getMenuIndex(value: number, itemCount: number): number {
  if (itemCount <= 1) return 0
  const progress = clampProgress((clampProgress(value) - 0.755) / 0.245)
  return Math.min(itemCount - 1, Math.floor(progress * itemCount))
}

export function scrollDestination(
  top: number,
  height: number,
  viewport: number,
  progress: number,
): number {
  return top + Math.max(0, height - viewport) * clampProgress(progress)
}
