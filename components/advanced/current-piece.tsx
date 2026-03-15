'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { AdvancedPuzzlePiece, PieceEdges, Rotation } from '@/lib/puzzle-types'
import { getRotatedEdges } from '@/lib/puzzle-utils'
import { Button } from '@/components/ui/button'
import { 
  RotateCwIcon, 
  SkipForwardIcon,
  SparklesIcon
} from 'lucide-react'

interface CurrentPieceProps {
  piece: AdvancedPuzzlePiece | null
  imageUrl: string
  gridSize: number
  onRotate: () => void
  onSkip: () => void
  disabled?: boolean
}

const PREVIEW_SIZE = 120
const TAB_SIZE = 0.22

export function CurrentPiece({
  piece,
  imageUrl,
  gridSize,
  onRotate,
  onSkip,
  disabled = false
}: CurrentPieceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // 生成拼图块路径
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
    
    // 上边
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
    
    // 右边
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
    
    // 下边
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
    
    // 左边
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

  // 绘制预览
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imageRef.current
    
    if (!canvas || !ctx) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (!piece || !img) return
    
    const size = PREVIEW_SIZE * 0.7
    const x = (PREVIEW_SIZE - size) / 2
    const y = (PREVIEW_SIZE - size) / 2
    
    ctx.save()
    
    // 生成路径并裁剪
    generatePiecePath(ctx, x, y, size, piece.edges, piece.rotation)
    ctx.clip()
    
    // 计算图片源区域
    const srcSize = img.width / gridSize
    const srcX = piece.imageX * srcSize
    const srcY = piece.imageY * srcSize
    
    // 处理旋转
    const centerX = x + size / 2
    const centerY = y + size / 2
    
    ctx.translate(centerX, centerY)
    ctx.rotate((piece.rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)
    
    // 绘制图片
    const tabExtra = size * TAB_SIZE
    ctx.drawImage(
      img,
      srcX, srcY, srcSize, srcSize,
      x - tabExtra, y - tabExtra, size + tabExtra * 2, size + tabExtra * 2
    )
    
    ctx.restore()
    
    // 绘制边框
    ctx.save()
    generatePiecePath(ctx, x, y, size, piece.edges, piece.rotation)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }, [piece, gridSize, generatePiecePath])

  // 加载图片
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      draw()
    }
    img.src = imageUrl
  }, [imageUrl, draw])

  // 重绘
  useEffect(() => {
    draw()
  }, [draw])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || !piece) return
      
      if (e.key === 'r' || e.key === 'R') {
        onRotate()
      } else if (e.key === 's' || e.key === 'S') {
        onSkip()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, piece, onRotate, onSkip])

  const getPieceTypeLabel = (type: string) => {
    switch (type) {
      case 'corner': return '角落'
      case 'edge': return '边缘'
      case 'center': return '中心'
      default: return type
    }
  }

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">当前碎片</h3>
        {piece && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {getPieceTypeLabel(piece.pieceType)}
          </span>
        )}
      </div>
      
      {/* 碎片预览 */}
      <div className="flex justify-center mb-4">
        <div className="relative bg-secondary/30 rounded-lg p-2">
          <canvas
            ref={canvasRef}
            width={PREVIEW_SIZE}
            height={PREVIEW_SIZE}
            className="rounded"
          />
          {!piece && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <SparklesIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">点击抽取开始</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 控制按钮 */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRotate}
          disabled={disabled || !piece}
          className="flex-1"
        >
          <RotateCwIcon className="h-4 w-4 mr-1" />
          旋转 (R)
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSkip}
          disabled={disabled || !piece}
          className="flex-1"
        >
          <SkipForwardIcon className="h-4 w-4 mr-1" />
          跳过 (S)
        </Button>
      </div>
      
      {/* 当前旋转角度 */}
      {piece && (
        <div className="mt-3 text-center text-xs text-muted-foreground">
          旋转角度: {piece.rotation}°
        </div>
      )}
    </div>
  )
}
