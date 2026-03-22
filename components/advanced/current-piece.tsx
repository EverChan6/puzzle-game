'use client'

import { useEffect, useState } from 'react'
import type { AdvancedPuzzlePiece } from '@/lib/puzzle-types'
import { PiecePreviewCanvas } from './piece-preview-canvas'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  RotateCwIcon,
  SkipForwardIcon,
  SparklesIcon,
  ZoomInIcon
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
const DETAIL_SIZE = 360

export function CurrentPiece({
  piece,
  imageUrl,
  gridSize,
  onRotate,
  onSkip,
  disabled = false
}: CurrentPieceProps) {
  const [detailOpen, setDetailOpen] = useState(false)

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
      case 'corner':
        return '角落'
      case 'edge':
        return '边缘'
      case 'center':
        return '中心'
      default:
        return type
    }
  }

  return (
    <>
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">当前碎片</h3>
          <div className="flex items-center gap-2">
            {piece && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setDetailOpen(true)}
                  title="放大查看"
                >
                  <ZoomInIcon className="h-4 w-4" />
                </Button>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {getPieceTypeLabel(piece.pieceType)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 碎片预览 */}
        <div className="flex justify-center mb-4">
          <div className="relative bg-secondary/30 rounded-lg p-2">
            <PiecePreviewCanvas
              piece={piece}
              imageUrl={imageUrl}
              gridSize={gridSize}
              displaySize={PREVIEW_SIZE}
            />
            {!piece && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-secondary/30">
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

        {piece && (
          <div className="mt-3 text-center text-xs text-muted-foreground">
            旋转角度: {piece.rotation}°
          </div>
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg sm:max-w-lg" showCloseButton>
          <DialogHeader>
            <DialogTitle>当前碎片细节</DialogTitle>
            <DialogDescription className="sr-only">
              放大查看当前拼图碎片的形状与图案细节。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-2">
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <PiecePreviewCanvas
                piece={piece}
                imageUrl={imageUrl}
                gridSize={gridSize}
                displaySize={DETAIL_SIZE}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
