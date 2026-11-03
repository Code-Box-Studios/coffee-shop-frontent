'use client'

import { useEffect, useRef } from 'react'
import type { MenuProduct } from '@/lib/types'

interface Props {
  product: MenuProduct | null
  currency: string
  onDismiss: () => void
  trigger: HTMLButtonElement | null
}

export function MenuDialog({ product, currency, onDismiss, trigger }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (product && !dialog.open) dialog.showModal()
    else if (!product && dialog.open) dialog.close()
  }, [product])

  return (
    <dialog
      ref={ref}
      className="drink-dialog"
      aria-labelledby="drink-title"
      onClose={() => {
        onDismiss()
        requestAnimationFrame(() => trigger?.focus({ preventScroll: true }))
      }}
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          event.currentTarget.close()
      }}
    >
      <form method="dialog">
        <button className="dialog-close" aria-label="Close details">
          ×
        </button>
      </form>
      <span className="eyebrow">MEET YOUR NEXT FAVORITE</span>
      <h2 id="drink-title">
        {product?.title} <em>{product?.emphasis}</em>
      </h2>
      <p>{product?.details}</p>
      <div id="drink-detail">
        {product &&
          new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency,
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
          }).format(product.price)}
        {product && product.flavorNotes.length > 0 && ` · ${product.flavorNotes.join(' · ')}`}
      </div>
      <form method="dialog" className="mt-6">
        <button className="dialog-done">
          Sounds lovely <span aria-hidden="true">↗</span>
        </button>
      </form>
    </dialog>
  )
}
