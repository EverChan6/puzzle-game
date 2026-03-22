'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import type { 
  AdvancedPuzzlePiece, 
  ViewportState, 
  PieceEdges, 
  Rotation 
} from '@/lib/puzzle-types'
import { getRotatedEdges, canPlacePiece } from '@/lib/puzzle-utils'

interface InfiniteCanvasProps {
  pieces: AdvancedPuzzlePiece[]
  gridSize: number
  imageUrl: string
  viewport: ViewportState
  onViewportChange: (viewport: ViewportState) => void
  currentPieceId: number | null
  onPiecePlaced: (pieceId: number, row: number, col: number) => void
  onPieceRemoved: (pieceId: number) => void
  showReferenceImage: boolean
  highlightConnectedRegions: boolean
}

const PIECE_SIZE = 60 // 基础碎片大小
const TAB_SIZE = 0.22 // 凸凹大小比例
const MIN_SCALE = 0.25
const MAX_SCALE = 4

export function InfiniteCanvas({
  pieces,
  gridSize,
  imageUrl,
  viewport,
  onViewportChange,
  currentPieceId,
  onPiecePlaced,
  onPieceRemoved,
  showReferenceImage,
  highlightConnectedRegions
}: InfiniteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null)
  const [canPlace, setCanPlace] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // 加载图片
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
    }
    img.src = imageUrl
  }, [imageUrl])

  // 获取已放置的碎片
  const placedPieces = useMemo(() => 
    pieces.filter(p => p.placedPosition !== null),
    [pieces]
  )

  // 当前碎片
  const currentPiece = useMemo(() => 
    currentPieceId !== null ? pieces.find(p => p.id === currentPieceId) : null,
    [pieces, currentPieceId]
  )

  // 生成拼图块的 SVG 路径
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
        // 凸出
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
        // 凹陷
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

  // 绘制单个拼图块
  const drawPiece = useCallback((
    ctx: CanvasRenderingContext2D,
    piece: AdvancedPuzzlePiece,
    x: number,
    y: number,
    size: number,
    img: HTMLImageElement
  ) => {
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
    ctx.strokeStyle = piece.isCorrect 
      ? 'rgba(34, 197, 94, 0.8)' 
      : 'rgba(0, 0, 0, 0.3)'
    ctx.lineWidth = piece.isCorrect ? 2 : 1
    ctx.stroke()
    ctx.restore()
  }, [generatePiecePath, gridSize])

  // 主绘制函数
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imageRef.current
    
    if (!canvas || !ctx || !img || !imageLoaded) return
    
    const { scale, offsetX, offsetY } = viewport
    const pieceSize = PIECE_SIZE * scale
    const totalSize = gridSize * pieceSize
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 绘制背景网格
    ctx.save()
    ctx.translate(offsetX, offsetY)
    
    // 绘制参考图（半透明）
    if (showReferenceImage) {
      ctx.globalAlpha = 0.15
      ctx.drawImage(img, 0, 0, totalSize, totalSize)
      ctx.globalAlpha = 1
    }
    
    // 绘制网格线
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath()
      ctx.moveTo(i * pieceSize, 0)
      ctx.lineTo(i * pieceSize, totalSize)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * pieceSize)
      ctx.lineTo(totalSize, i * pieceSize)
      ctx.stroke()
    }
    
    // 绘制已放置的碎片
    for (const piece of placedPieces) {
      if (piece.placedPosition) {
        const x = piece.placedPosition.col * pieceSize
        const y = piece.placedPosition.row * pieceSize
        drawPiece(ctx, piece, x, y, pieceSize, img)
      }
    }
    
    // 绘制悬停位置高亮
    if (hoverCell && currentPiece) {
      const { row, col } = hoverCell
      const x = col * pieceSize
      const y = row * pieceSize
      
      ctx.fillStyle = canPlace 
        ? 'rgba(34, 197, 94, 0.3)' 
        : 'rgba(239, 68, 68, 0.3)'
      ctx.fillRect(x, y, pieceSize, pieceSize)
      
      // 预览当前碎片
      if (canPlace) {
        ctx.globalAlpha = 0.7
        drawPiece(ctx, currentPiece, x, y, pieceSize, img)
        ctx.globalAlpha = 1
      }
    }
    
    ctx.restore()
  }, [
    viewport, 
    gridSize, 
    placedPieces, 
    drawPiece, 
    hoverCell, 
    currentPiece, 
    canPlace, 
    showReferenceImage,
    imageLoaded
  ])

  // 调整画布大小
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      draw()
    })
    
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [draw])

  // 重绘
  useEffect(() => {
    draw()
  }, [draw])

  // 鼠标/触摸事件处理
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    return { x, y }
  }, [])

  const getCellFromCoords = useCallback((canvasX: number, canvasY: number) => {
    const { scale, offsetX, offsetY } = viewport
    const pieceSize = PIECE_SIZE * scale
    
    const gridX = canvasX - offsetX
    const gridY = canvasY - offsetY
    
    const col = Math.floor(gridX / pieceSize)
    const row = Math.floor(gridY / pieceSize)
    
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      return { row, col }
    }
    return null
  }, [viewport, gridSize])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // 左键
      setIsDragging(true)
      setDragStart({ x: e.clientX - viewport.offsetX, y: e.clientY - viewport.offsetY })
    }
  }, [viewport.offsetX, viewport.offsetY])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY)
    if (!coords) return
    
    if (isDragging) {
      onViewportChange({
        ...viewport,
        offsetX: e.clientX - dragStart.x,
        offsetY: e.clientY - dragStart.y
      })
    } else {
      const cell = getCellFromCoords(coords.x, coords.y)
      setHoverCell(cell)
      
      if (cell && currentPiece) {
        const result = canPlacePiece(currentPiece, cell.row, cell.col, placedPieces, gridSize)
        setCanPlace(result.canPlace)
      } else {
        setCanPlace(false)
      }
    }
  }, [
    isDragging, 
    dragStart, 
    viewport, 
    onViewportChange, 
    getCanvasCoords, 
    getCellFromCoords, 
    currentPiece, 
    placedPieces, 
    gridSize
  ])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return
    
    const coords = getCanvasCoords(e.clientX, e.clientY)
    if (!coords) return
    
    const cell = getCellFromCoords(coords.x, coords.y)
    if (!cell) return
    
    // 检查是否点击了已放置的碎片
    const clickedPiece = placedPieces.find(
      p => p.placedPosition?.row === cell.row && p.placedPosition?.col === cell.col
    )
    
    if (clickedPiece) {
      // 移除已放置的碎片
      onPieceRemoved(clickedPiece.id)
    } else if (currentPiece && canPlace) {
      // 放置当前碎片
      onPiecePlaced(currentPiece.id, cell.row, cell.col)
    }
  }, [
    isDragging, 
    getCanvasCoords, 
    getCellFromCoords, 
    placedPieces, 
    currentPiece, 
    canPlace, 
    onPiecePlaced, 
    onPieceRemoved
  ])

  const viewportRef = useRef(viewport)
  viewportRef.current = viewport

  const onViewportChangeRef = useRef(onViewportChange)
  onViewportChangeRef.current = onViewportChange

  // React 的合成 wheel 为 passive，无法 preventDefault；原生监听需 { passive: false }
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handler = (e: WheelEvent) => {
      e.preventDefault()

      const coords = getCanvasCoords(e.clientX, e.clientY)
      if (!coords) return

      const v = viewportRef.current
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * delta))

      const scaleRatio = newScale / v.scale
      const newOffsetX = coords.x - (coords.x - v.offsetX) * scaleRatio
      const newOffsetY = coords.y - (coords.y - v.offsetY) * scaleRatio

      onViewportChangeRef.current({
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      })
    }

    canvas.addEventListener('wheel', handler, { passive: false })
    return () => canvas.removeEventListener('wheel', handler)
  }, [getCanvasCoords])

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-secondary/30 rounded-lg"
    >
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />
      
      {/* 缩放指示器 */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-muted-foreground">
        {Math.round(viewport.scale * 100)}%
      </div>
      
      {/* 快捷键提示 */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-muted-foreground">
        <p>滚轮缩放 | 拖拽平移</p>
        <p>点击空位放置 | 点击碎片取回</p>
      </div>
    </div>
  )
}
