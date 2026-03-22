'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { AdvancedPuzzlePiece, PieceEdges, Rotation } from '@/lib/puzzle-types'
import { getRotatedEdges } from '@/lib/puzzle-utils'
import { cn } from '@/lib/utils'

const TAB_SIZE = 0.22

interface PiecePreviewCanvasProps {
  piece: AdvancedPuzzlePiece | null
  imageUrl: string
  gridSize: number
  /** Canvas width/height in CSS pixels */
  displaySize: number
  className?: string
}

export function PiecePreviewCanvas({
  piece,
  imageUrl,
  gridSize,
  displaySize,
  className
}: PiecePreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const generatePiecePath = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    edges: PieceEdges,
    rotation: Rotation
  ) => {
    const rotatedEdges = getRotatedEdges(edges, rotation)
    const tabSize = size * TAB_SIZE
    const tabOffset = size * 0.35

    ctx.beginPath()
    ctx.moveTo(x, y)

    if (rotatedEdges.top === 0) {
      ctx.lineTo(x + size, y)
    } else {
      ctx.lineTo(x + tabOffset, y)
      if (rotatedEdges.top === 1) {
        ctx.bezierCurveTo(
          x + tabOffset, y - tabSize * 0.5,
          x + tabOffset + tabSize * 0.3, y - tabSize,
          x + size / 2, y - tabSize
        )
        ctx.bezierCurveTo(
          x + size - tabOffset - tabSize * 0.3, y - tabSize,
          x + size - tabOffset, y - tabSize * 0.5,
          x + size - tabOffset, y
        )
      } else {
        ctx.bezierCurveTo(
          x + tabOffset, y + tabSize * 0.5,
          x + tabOffset + tabSize * 0.3, y + tabSize,
          x + size / 2, y + tabSize
        )
        ctx.bezierCurveTo(
          x + size - tabOffset - tabSize * 0.3, y + tabSize,
          x + size - tabOffset, y + tabSize * 0.5,
          x + size - tabOffset, y
        )
      }
      ctx.lineTo(x + size, y)
    }

    if (rotatedEdges.right === 0) {
      ctx.lineTo(x + size, y + size)
    } else {
      ctx.lineTo(x + size, y + tabOffset)
      if (rotatedEdges.right === 1) {
        ctx.bezierCurveTo(
          x + size + tabSize * 0.5, y + tabOffset,
          x + size + tabSize, y + tabOffset + tabSize * 0.3,
          x + size + tabSize, y + size / 2
        )
        ctx.bezierCurveTo(
          x + size + tabSize, y + size - tabOffset - tabSize * 0.3,
          x + size + tabSize * 0.5, y + size - tabOffset,
          x + size, y + size - tabOffset
        )
      } else {
        ctx.bezierCurveTo(
          x + size - tabSize * 0.5, y + tabOffset,
          x + size - tabSize, y + tabOffset + tabSize * 0.3,
          x + size - tabSize, y + size / 2
        )
        ctx.bezierCurveTo(
          x + size - tabSize, y + size - tabOffset - tabSize * 0.3,
          x + size - tabSize * 0.5, y + size - tabOffset,
          x + size, y + size - tabOffset
        )
      }
      ctx.lineTo(x + size, y + size)
    }

    if (rotatedEdges.bottom === 0) {
      ctx.lineTo(x, y + size)
    } else {
      ctx.lineTo(x + size - tabOffset, y + size)
      if (rotatedEdges.bottom === 1) {
        ctx.bezierCurveTo(
          x + size - tabOffset, y + size + tabSize * 0.5,
          x + size - tabOffset - tabSize * 0.3, y + size + tabSize,
          x + size / 2, y + size + tabSize
        )
        ctx.bezierCurveTo(
          x + tabOffset + tabSize * 0.3, y + size + tabSize,
          x + tabOffset, y + size + tabSize * 0.5,
          x + tabOffset, y + size
        )
      } else {
        ctx.bezierCurveTo(
          x + size - tabOffset, y + size - tabSize * 0.5,
          x + size - tabOffset - tabSize * 0.3, y + size - tabSize,
          x + size / 2, y + size - tabSize
        )
        ctx.bezierCurveTo(
          x + tabOffset + tabSize * 0.3, y + size - tabSize,
          x + tabOffset, y + size - tabSize * 0.5,
          x + tabOffset, y + size
        )
      }
      ctx.lineTo(x, y + size)
    }

    if (rotatedEdges.left === 0) {
      ctx.lineTo(x, y)
    } else {
      ctx.lineTo(x, y + size - tabOffset)
      if (rotatedEdges.left === 1) {
        ctx.bezierCurveTo(
          x - tabSize * 0.5, y + size - tabOffset,
          x - tabSize, y + size - tabOffset - tabSize * 0.3,
          x - tabSize, y + size / 2
        )
        ctx.bezierCurveTo(
          x - tabSize, y + tabOffset + tabSize * 0.3,
          x - tabSize * 0.5, y + tabOffset,
          x, y + tabOffset
        )
      } else {
        ctx.bezierCurveTo(
          x + tabSize * 0.5, y + size - tabOffset,
          x + tabSize, y + size - tabOffset - tabSize * 0.3,
          x + tabSize, y + size / 2
        )
        ctx.bezierCurveTo(
          x + tabSize, y + tabOffset + tabSize * 0.3,
          x + tabSize * 0.5, y + tabOffset,
          x, y + tabOffset
        )
      }
      ctx.lineTo(x, y)
    }

    ctx.closePath()
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imageRef.current

    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!piece || !img) return

    const size = displaySize * 0.7
    const x = (displaySize - size) / 2
    const y = (displaySize - size) / 2

    ctx.save()

    generatePiecePath(ctx, x, y, size, piece.edges, piece.rotation)
    ctx.clip()

    const srcSize = img.width / gridSize
    const srcX = piece.imageX * srcSize
    const srcY = piece.imageY * srcSize

    const centerX = x + size / 2
    const centerY = y + size / 2

    ctx.translate(centerX, centerY)
    ctx.rotate((piece.rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)

    const tabExtra = size * TAB_SIZE
    ctx.drawImage(
      img,
      srcX, srcY, srcSize, srcSize,
      x - tabExtra, y - tabExtra, size + tabExtra * 2, size + tabExtra * 2
    )

    ctx.restore()

    ctx.save()
    generatePiecePath(ctx, x, y, size, piece.edges, piece.rotation)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.lineWidth = Math.max(1, displaySize / 80)
    ctx.stroke()
    ctx.restore()
  }, [piece, gridSize, displaySize, generatePiecePath])

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      draw()
    }
    img.src = imageUrl
  }, [imageUrl, draw])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      width={displaySize}
      height={displaySize}
      className={cn('rounded', className)}
    />
  )
}
