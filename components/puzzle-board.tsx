'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { PuzzlePiece } from '@/lib/puzzle-types'
import { cn } from '@/lib/utils'

interface PuzzleBoardProps {
  pieces: PuzzlePiece[]
  gridSize: number
  imageUrl: string
  onSwap: (index1: number, index2: number) => void
  isComplete: boolean
}

export function PuzzleBoard({ pieces, gridSize, imageUrl, onSwap, isComplete }: PuzzleBoardProps) {
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const pieceSize = 100 / gridSize

  // 预加载图片
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImageLoaded(true)
    img.src = imageUrl
  }, [imageUrl])

  // 拖拽开始
  const handleDragStart = useCallback((e: React.DragEvent, currentIndex: number) => {
    if (isComplete) return
    setDraggedPiece(currentIndex)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', currentIndex.toString())
  }, [isComplete])

  // 拖拽经过
  const handleDragOver = useCallback((e: React.DragEvent, currentIndex: number) => {
    e.preventDefault()
    if (draggedPiece !== null && draggedPiece !== currentIndex) {
      setDragOverIndex(currentIndex)
    }
  }, [draggedPiece])

  // 拖拽离开
  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  // 拖拽释放 - 自动吸附判断
  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedPiece !== null && draggedPiece !== targetIndex) {
      onSwap(draggedPiece, targetIndex)
    }
    setDraggedPiece(null)
    setDragOverIndex(null)
  }, [draggedPiece, onSwap])

  // 拖拽结束
  const handleDragEnd = useCallback(() => {
    setDraggedPiece(null)
    setDragOverIndex(null)
  }, [])

  // 点击选择（移动端支持）
  const handleClick = useCallback((currentIndex: number) => {
    if (isComplete) return
    
    if (selectedPiece === null) {
      setSelectedPiece(currentIndex)
    } else if (selectedPiece === currentIndex) {
      setSelectedPiece(null)
    } else {
      onSwap(selectedPiece, currentIndex)
      setSelectedPiece(null)
    }
  }, [selectedPiece, onSwap, isComplete])

  // 按 currentIndex 排序显示
  const sortedPieces = [...pieces].sort((a, b) => a.currentIndex - b.currentIndex)

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl transition-all duration-300",
        isComplete && "ring-4 ring-[var(--success)]"
      )}
      style={{
        maxWidth: '500px'
      }}
    >
      {/* 背景参考图（模糊） */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px)'
        }}
      />

      {/* 拼图网格 */}
      <div 
        className="relative w-full h-full grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          gap: '2px'
        }}
      >
        {sortedPieces.map((piece) => {
          const isCorrect = piece.currentIndex === piece.correctIndex
          const isDragging = draggedPiece === piece.currentIndex
          const isDragOver = dragOverIndex === piece.currentIndex
          const isSelected = selectedPiece === piece.currentIndex

          return (
            <div
              key={piece.id}
              draggable={!isComplete && imageLoaded}
              onDragStart={(e) => handleDragStart(e, piece.currentIndex)}
              onDragOver={(e) => handleDragOver(e, piece.currentIndex)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, piece.currentIndex)}
              onDragEnd={handleDragEnd}
              onClick={() => handleClick(piece.currentIndex)}
              className={cn(
                "relative cursor-grab active:cursor-grabbing transition-all duration-200",
                "bg-card border border-border/50",
                isDragging && "opacity-50 scale-95",
                isDragOver && "ring-2 ring-primary scale-105",
                isSelected && "ring-2 ring-accent scale-105 z-10",
                isComplete && isCorrect && "ring-1 ring-[var(--success)]/50",
                !isComplete && "hover:brightness-110"
              )}
              style={{
                backgroundImage: imageLoaded ? `url(${imageUrl})` : undefined,
                backgroundSize: `${gridSize * 100}%`,
                backgroundPosition: `${piece.imageX * pieceSize}% ${piece.imageY * pieceSize}%`,
                backgroundPositionX: `${(piece.imageX / (gridSize - 1)) * 100}%`,
                backgroundPositionY: `${(piece.imageY / (gridSize - 1)) * 100}%`,
              }}
            >
              {/* 拼图块编号（调试用，可选） */}
              {/* <span className="absolute top-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                {piece.correctIndex + 1}
              </span> */}
            </div>
          )
        })}
      </div>

      {/* 完成动画覆盖层 */}
      {isComplete && (
        <div className="absolute inset-0 bg-[var(--success)]/20 flex items-center justify-center animate-in fade-in duration-500">
          <div className="bg-card/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <span className="text-lg font-bold text-[var(--success)]">完成!</span>
          </div>
        </div>
      )}
    </div>
  )
}
