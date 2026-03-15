'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { PuzzleBoard } from './puzzle-board'
import { ImageSelector } from './image-selector'
import { GameControls } from './game-controls'
import { CompletionModal } from './completion-modal'
import { GameHistory } from './game-history'
import { ImagePreview } from './image-preview'
import { 
  createPuzzlePieces, 
  shufflePieces, 
  swapPieces, 
  checkComplete,
  saveGameRecord,
  generateId 
} from '@/lib/puzzle-utils'
import type { PuzzlePiece } from '@/lib/puzzle-types'
import { PRESET_IMAGES } from '@/lib/puzzle-types'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from 'lucide-react'

interface PuzzleGameProps {
  onBackToMenu?: () => void
}

export function PuzzleGame({ onBackToMenu }: PuzzleGameProps) {
  // 游戏状态
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [gridSize, setGridSize] = useState(3)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 计时器
  useEffect(() => {
    if (isPlaying && startTime && !isComplete) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, startTime, isComplete])

  // 当游戏完成时触发历史记录更新事件
  useEffect(() => {
    if (isComplete) {
      window.dispatchEvent(new Event('puzzle-record-added'))
    }
  }, [isComplete])

  // 选择图片
  const handleImageSelect = useCallback((url: string) => {
    setImageUrl(url)
    // 重置游戏状态
    setIsPlaying(false)
    setIsComplete(false)
    setMoves(0)
    setElapsedTime(0)
    setStartTime(null)
    setPieces([])
  }, [])

  // 开始游戏
  const handleStart = useCallback(() => {
    if (!imageUrl) return
    
    const newPieces = createPuzzlePieces(gridSize)
    const shuffledPieces = shufflePieces(newPieces)
    
    setPieces(shuffledPieces)
    setMoves(0)
    setElapsedTime(0)
    setStartTime(Date.now())
    setIsPlaying(true)
    setIsComplete(false)
    setShowModal(false)
  }, [imageUrl, gridSize])

  // 重置游戏
  const handleReset = useCallback(() => {
    handleStart()
  }, [handleStart])

  // 交换拼图块
  const handleSwap = useCallback((index1: number, index2: number) => {
    if (!isPlaying || isComplete) return

    setPieces(prevPieces => {
      const newPieces = swapPieces(prevPieces, index1, index2)
      
      // 检查是否完成
      if (checkComplete(newPieces)) {
        setIsComplete(true)
        setIsPlaying(false)
        
        // 停止计时
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        
        // 保存记录
        const finalTime = Math.floor((Date.now() - (startTime || 0)) / 1000)
        saveGameRecord({
          id: generateId(),
          imageUrl: imageUrl!,
          gridSize,
          moves: moves + 1,
          time: finalTime,
          date: new Date().toISOString()
        })
        
        // 延迟显示完成弹窗
        setTimeout(() => {
          setShowModal(true)
        }, 500)
      }
      
      return newPieces
    })
    
    setMoves(prev => prev + 1)
  }, [isPlaying, isComplete, startTime, imageUrl, gridSize, moves])

  // 修改难度
  const handleGridSizeChange = useCallback((size: number) => {
    setGridSize(size)
    // 重置游戏状态
    setIsPlaying(false)
    setIsComplete(false)
    setMoves(0)
    setElapsedTime(0)
    setStartTime(null)
    setPieces([])
  }, [])

  // 再玩一次
  const handlePlayAgain = useCallback(() => {
    setShowModal(false)
    handleStart()
  }, [handleStart])

  // 默认选择第一张预设图片
  useEffect(() => {
    if (!imageUrl && PRESET_IMAGES.length > 0) {
      setImageUrl(PRESET_IMAGES[0].url)
    }
  }, [imageUrl])

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBackToMenu && (
                <Button variant="ghost" size="sm" onClick={onBackToMenu}>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  返回
                </Button>
              )}
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">拼图大师</h1>
                <p className="text-xs text-muted-foreground">挑战你的观察力与耐心</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧栏 - 设置和图片选择 */}
          <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            <ImageSelector 
              onSelect={handleImageSelect} 
              selectedUrl={imageUrl}
            />
            <div className="hidden lg:block">
              <GameHistory />
            </div>
          </aside>

          {/* 中间 - 拼图区域 */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="flex flex-col items-center gap-6">
              {/* 游戏提示 */}
              {!isPlaying && !isComplete && imageUrl && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    已选择图片，点击下方"开始游戏"开始挑战
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    提示：拖拽或点击两个拼图块进行交换
                  </p>
                </div>
              )}

              {/* 拼图板 */}
              {imageUrl && (
                <PuzzleBoard
                  pieces={pieces.length > 0 ? pieces : createPuzzlePieces(gridSize)}
                  gridSize={gridSize}
                  imageUrl={imageUrl}
                  onSwap={handleSwap}
                  isComplete={isComplete}
                />
              )}

              {/* 移动端控制面板 */}
              <div className="w-full max-w-[500px] lg:hidden">
                <GameControls
                  gridSize={gridSize}
                  onGridSizeChange={handleGridSizeChange}
                  moves={moves}
                  elapsedTime={elapsedTime}
                  isPlaying={isPlaying}
                  onStart={handleStart}
                  onReset={handleReset}
                  disabled={!imageUrl}
                />
              </div>
            </div>
          </div>

          {/* 右侧栏 - 控制和预览 */}
          <aside className="lg:col-span-3 space-y-4 order-3">
            <div className="hidden lg:block">
              <GameControls
                gridSize={gridSize}
                onGridSizeChange={handleGridSizeChange}
                moves={moves}
                elapsedTime={elapsedTime}
                isPlaying={isPlaying}
                onStart={handleStart}
                onReset={handleReset}
                disabled={!imageUrl}
              />
            </div>
            <div className="hidden lg:block">
              <ImagePreview imageUrl={imageUrl} />
            </div>
          </aside>

          {/* 移动端历史记录 */}
          <div className="lg:hidden order-4 w-full">
            <GameHistory />
          </div>
        </div>
      </main>

      {/* 完成弹窗 */}
      <CompletionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPlayAgain={handlePlayAgain}
        moves={moves}
        time={elapsedTime}
        gridSize={gridSize}
        imageUrl={imageUrl || ''}
      />

      {/* 页脚 */}
      <footer className="border-t border-border/50 bg-card/30 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            拼图大师 - 在线拼图游戏 | 支持自定义图片上传
          </p>
        </div>
      </footer>
    </div>
  )
}
