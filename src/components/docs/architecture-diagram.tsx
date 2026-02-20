'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ZoomIn } from 'lucide-react'

interface ArchitectureDiagramProps {
  /** Path to SVG or image in public/docs/diagrams/ */
  src: string
  /** Accessible alt text — required */
  alt: string
  /** Optional caption */
  caption?: string
  width?: number
  height?: number
}

/**
 * ArchitectureDiagram — SVG/image viewer with click-to-zoom modal.
 * Place assets in public/docs/diagrams/ and reference as src="/docs/diagrams/name.svg"
 * Usage in MDX: <ArchitectureDiagram src="/docs/diagrams/rbac.svg" alt="RBAC three-layer diagram" />
 */
export function ArchitectureDiagram({
  src,
  alt,
  caption,
  width = 800,
  height = 500,
}: ArchitectureDiagramProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <figure className="my-6">
        <button
          onClick={() => setOpen(true)}
          className="group relative w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] p-2 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-turmeric)]"
          aria-label={`View full size: ${alt}`}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
            <ZoomIn
              className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 drop-shadow transition-opacity"
              aria-hidden="true"
            />
          </div>
        </button>
        {caption && (
          <figcaption className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
            {caption}
          </figcaption>
        )}
      </figure>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-full p-2" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
