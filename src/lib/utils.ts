import { twMerge } from "tailwind-merge"

/**
 * Join class names, letting the last class win when two of them set the same
 * Tailwind utility (e.g. a component's `bg-secondary` base versus a caller's
 * `bg-amber-500` override). Without tailwind-merge both classes ship and the
 * stylesheet's declaration order decides — custom `@theme` colours come last,
 * so call-site overrides silently lost to the component's own base classes.
 */
export function cn(...classes: (string | undefined)[]) {
  return twMerge(classes.filter(Boolean).join(" "))
}
