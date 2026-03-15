'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import type { PuzzlePiece, EdgeType } from '@/lib/puzzle-types'
import { cn } from '@/lib/utils'

interface PuzzleBoardProps {
  pieces: PuzzlePiece[]
  gridSize: number
  imageUrl: string
  onSwap: (index1: number, index2: number) => void
  isComplete: boolean
}

// 生成拼图块的 SVG 路径
// 凸凹的大小相对于拼图块尺寸的比例
const TAB_SIZE = 0.2 // 凸凹大小为块尺寸的 20%

function generatePiecePath(
  edges: { top: EdgeType; right: EdgeType; bottom: EdgeType; left: EdgeType },
  size: number
): string {
  const tabSize = size * TAB_SIZE
  const tabOffset = (size - tabSize) / 2
  
  let path = `M 0 0`
  
  // 顶边
  if (edges.top === 0) {
    path += ` L ${size} 0`
  } else {
    const dir = edges.top // 1=凸出（向外），-1=凹陷（向内）
    path += ` L ${tabOffset} 0`
    path += ` C ${tabOffset} ${-tabSize * 0.5 * dir}, ${tabOffset + tabSize * 0.3} ${-tabSize * dir}, ${size / 2} ${-tabSize * dir}`
    path += ` C ${tabOffset + tabSize * 0.7} ${-tabSize * dir}, ${tabOffset + tabSize} ${-tabSize * 0.5 * dir}, ${tabOffset + tabSize} 0`
    path += ` L ${size} 0`
  }
  
  // 右边
  if (edges.right === 0) {
    path += ` L ${size} ${size}`
  } else {
    const dir = edges.right
    path += ` L ${size} ${tabOffset}`
    path += ` C ${size + tabSize * 0.5 * dir} ${tabOffset}, ${size + tabSize * dir} ${tabOffset + tabSize * 0.3}, ${size + tabSize * dir} ${size / 2}`
    path += ` C ${size + tabSize * dir} ${tabOffset + tabSize * 0.7}, ${size + tabSize * 0.5 * dir} ${tabOffset + tabSize}, ${size} ${tabOffset + tabSize}`
    path += ` L ${size} ${size}`
  }
  
  // 底边（从右到左）
  if (edges.bottom === 0) {
    path += ` L 0 ${size}`
  } else {
    const dir = edges.bottom
    path += ` L ${tabOffset + tabSize} ${size}`
    path += ` C ${tabOffset + tabSize} ${size + tabSize * 0.5 * dir}, ${tabOffset + tabSize * 0.7} ${size + tabSize * dir}, ${size / 2} ${size + tabSize * dir}`
    path += ` C ${tabOffset + tabSize * 0.3} ${size + tabSize * dir}, ${tabOffset} ${size + tabSize * 0.5 * dir}, ${tabOffset} ${size}`
    path += ` L 0 ${size}`
  }
  
  // 左边（从下到上）
  if (edges.left === 0) {
    path += ` L 0 0`
  } else {
    const dir = edges.left
    path += ` L 0 ${tabOffset + tabSize}`
    path += ` C ${-tabSize * 0.5 * dir} ${tabOffset + tabSize}, ${-tabSize * dir} ${tabOffset + tabSize * 0.7}, ${-tabSize * dir} ${size / 2}`
    path += ` C ${-tabSize * dir} ${tabOffset + tabSize * 0.3}, ${-tabSize * 0.5 * dir} ${tabOffset}, 0 ${tabOffset}`
    path += ` L 0 0`
  }
  
  path += ' Z'
  return path
}

export function PuzzleBoard({ pieces, gridSize, imageUrl, onSwap, isComplete }: PuzzleBoardProps) {
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [containerSize, setContainerSize] = useState(500)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const pieceSize = containerSize / gridSize
  const tabSize = pieceSize * TAB_SIZE

  // 预加载图片
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImageLoaded(true)
    img.src = imageUrl
  }, [imageUrl])

  // 监听容器大小
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setContainerSize(width)
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // 生成所有拼图块的路径
  const piecePaths = useMemo(() => {
    const paths: Record<number, string> = {}
    pieces.forEach(piece => {
      paths[piece.id] = generatePiecePath(piece.edges, pieceSize)
    })
    return paths
  }, [pieces, pieceSize])

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

  // 拖拽释放 - 自动吸附
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
        "relative w-full aspect-square rounded-xl overflow-visible transition-all duration-300",
        isComplete && "ring-4 ring-[var(--success)]"
      )}
      style={{
        maxWidth: '500px'
      }}
    >
      {/* 背景参考图（模糊） */}
      <div 
        className="absolute rounded-xl overflow-hidden"
        style={{
          top: tabSize,
          left: tabSize,
          right: tabSize,
          bottom: tabSize,
          opacity: 0.1,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px)'
        }}
      />

      {/* SVG 定义区域 */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {/* 为每个拼图块创建 clipPath */}
          {pieces.map(piece => (
            <clipPath key={`clip-${piece.id}`} id={`puzzle-clip-${piece.id}`}>
              <path 
                d={piecePaths[piece.id]} 
                transform={`translate(${tabSize}, ${tabSize})`}
              />
            </clipPath>
          ))}
        </defs>
      </svg>

      {/* 拼图块 */}
      {sortedPieces.map((piece) => {
        const isCorrect = piece.currentIndex === piece.correctIndex
        const isDragging = draggedPiece === piece.currentIndex
        const isDragOver = dragOverIndex === piece.currentIndex
        const isSelected = selectedPiece === piece.currentIndex
        
        // 计算位置
        const row = Math.floor(piece.currentIndex / gridSize)
        const col = piece.currentIndex % gridSize

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
              "absolute cursor-grab active:cursor-grabbing transition-all duration-200",
              isDragging && "opacity-50 scale-95 z-20",
              isDragOver && "scale-105 z-10",
              isSelected && "scale-105 z-10",
              !isComplete && "hover:z-10"
            )}
            style={{
              width: pieceSize + tabSize * 2,
              height: pieceSize + tabSize * 2,
              left: col * pieceSize - tabSize,
              top: row * pieceSize - tabSize,
            }}
          >
            {/* 拼图块主体 */}
            <div
              className={cn(
                "w-full h-full relative",
                isDragOver && "brightness-110",
                isSelected && "brightness-110"
              )}
              style={{
                clipPath: `url(#puzzle-clip-${piece.id})`,
              }}
            >
              {/* 背景图片 */}
              <div
                className="absolute"
                style={{
                  width: containerSize,
                  height: containerSize,
                  left: -(piece.imageX * pieceSize),
                  top: -(piece.imageY * pieceSize),
                  backgroundImage: imageLoaded ? `url(${imageUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'top left',
                }}
              />
            </div>
            
            {/* 选中/拖拽效果边框 */}
            <svg
              className={cn(
                "absolute inset-0 pointer-events-none transition-opacity duration-200",
                (isSelected || isDragOver) ? "opacity-100" : "opacity-0"
              )}
              width={pieceSize + tabSize * 2}
              height={pieceSize + tabSize * 2}
            >
              <path
                d={piecePaths[piece.id]}
                transform={`translate(${tabSize}, ${tabSize})`}
                fill="none"
                stroke={isSelected ? "var(--accent)" : "var(--primary)"}
                strokeWidth="3"
              />
            </svg>

            {/* 完成效果 */}
            {isComplete && isCorrect && (
              <svg
                className="absolute inset-0 pointer-events-none"
                width={pieceSize + tabSize * 2}
                height={pieceSize + tabSize * 2}
              >
                <path
                  d={piecePaths[piece.id]}
                  transform={`translate(${tabSize}, ${tabSize})`}
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="2"
                  strokeOpacity="0.5"
                />
              </svg>
            )}
          </div>
        )
      })}

      {/* 完成动画覆盖层 */}
      {isComplete && (
        <div 
          className="absolute bg-[var(--success)]/20 flex items-center justify-center animate-in fade-in duration-500 rounded-xl"
          style={{
            top: tabSize,
            left: tabSize,
            right: tabSize,
            bottom: tabSize,
          }}
        >
          <div className="bg-card/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <span className="text-lg font-bold text-[var(--success)]">完成!</span>
          </div>
        </div>
      )}
    </div>
  )
}
