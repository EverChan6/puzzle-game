'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { 
  AdvancedGameState, 
  PieceFilter,
  AdvancedGameSave
} from '@/lib/puzzle-types'
import { 
  ADVANCED_DIFFICULTY_OPTIONS, 
  PRESET_IMAGES 
} from '@/lib/puzzle-types'
import {
  initAdvancedGameState,
  drawNextPiece,
  skipCurrentPiece,
  rotatePiece,
  placePiece,
  removePlacedPiece,
  saveAdvancedGameProgress,
  getAdvancedGameSaves,
  loadAdvancedGameSave,
  deleteAdvancedGameSave,
  formatTime
} from '@/lib/puzzle-utils'
import { InfiniteCanvas } from './infinite-canvas'
import { PiecePool } from './piece-pool'
import { CurrentPiece } from './current-piece'
import { ProgressPanel } from './progress-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { 
  PlayIcon, 
  UploadIcon, 
  ImageIcon,
  ArrowLeftIcon,
  SparklesIcon,
  HistoryIcon,
  Trash2Icon,
  CheckCircle2Icon,
  TrophyIcon,
  Maximize2Icon,
  Minimize2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ZoomInIcon,
  XIcon
} from 'lucide-react'

type GamePhase = 'setup' | 'playing' | 'complete'

interface AdvancedPuzzleGameProps {
  onBackToMenu: () => void
}

export function AdvancedPuzzleGame({ onBackToMenu }: AdvancedPuzzleGameProps) {
  // 游戏设置
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [customImage, setCustomImage] = useState<string>('')
  const [gridSize, setGridSize] = useState(10)
  const [edgePiecesFirst, setEdgePiecesFirst] = useState(true)
  
  // 游戏状态
  const [gameState, setGameState] = useState<AdvancedGameState | null>(null)
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup')
  
  // UI 状态
  const [pieceFilter, setPieceFilter] = useState<PieceFilter>('all')
  const [showReferenceImage, setShowReferenceImage] = useState(false)
  const [highlightConnected, setHighlightConnected] = useState(true)
  const [showSaves, setShowSaves] = useState(false)
  const [saves, setSaves] = useState<AdvancedGameSave[]>([])

  const playAreaRef = useRef<HTMLDivElement>(null)
  const [playAreaFullscreen, setPlayAreaFullscreen] = useState(false)
  const [referenceFloatDismissed, setReferenceFloatDismissed] = useState(false)
  const [referenceFloatExpanded, setReferenceFloatExpanded] = useState(true)
  const [referenceDialogOpen, setReferenceDialogOpen] = useState(false)
  const [referenceImageFullBleed, setReferenceImageFullBleed] = useState(false)

  // 加载存档列表
  useEffect(() => {
    setSaves(getAdvancedGameSaves())
  }, [])

  useEffect(() => {
    const onFsChange = () => {
      setPlayAreaFullscreen(document.fullscreenElement === playAreaRef.current)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    if (playAreaFullscreen) {
      setReferenceFloatDismissed(false)
      setReferenceFloatExpanded(true)
    }
  }, [playAreaFullscreen])

  useEffect(() => {
    if (!referenceImageFullBleed) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setReferenceImageFullBleed(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [referenceImageFullBleed])

  const togglePlayAreaFullscreen = useCallback(async () => {
    const el = playAreaRef.current
    if (!el) return
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen()
      } else {
        await el.requestFullscreen()
      }
    } catch {
      // 部分浏览器/权限下可能失败，静默忽略
    }
  }, [])

  // 自动保存（每放置10块碎片或每2分钟）
  useEffect(() => {
    if (!gameState || gamePhase !== 'playing' || gameState.isComplete) return
    
    // 每放置10块碎片自动保存
    if (gameState.placedPieces.length > 0 && gameState.placedPieces.length % 10 === 0) {
      saveAdvancedGameProgress(gameState)
      setSaves(getAdvancedGameSaves())
    }
  }, [gameState?.placedPieces.length, gamePhase])

  // 定时自动保存（每2分钟）
  useEffect(() => {
    if (!gameState || gamePhase !== 'playing' || gameState.isComplete) return
    
    const interval = setInterval(() => {
      if (gameState.placedPieces.length > 0) {
        saveAdvancedGameProgress(gameState)
        setSaves(getAdvancedGameSaves())
      }
    }, 2 * 60 * 1000) // 2分钟
    
    return () => clearInterval(interval)
  }, [gameState, gamePhase])

  // 获取当前图片 URL
  const currentImageUrl = customImage || selectedImage

  // 开始游戏
  const startGame = useCallback(() => {
    if (!currentImageUrl) return
    
    const state = initAdvancedGameState(currentImageUrl, gridSize, edgePiecesFirst)
    setGameState(state)
    setGamePhase('playing')
  }, [currentImageUrl, gridSize, edgePiecesFirst])

  // 抽取下一块碎片
  const handleDrawPiece = useCallback(() => {
    if (!gameState) return
    
    let newState = gameState
    
    // 如果是第一次抽取，记录开始时间
    if (!newState.startTime) {
      newState = { ...newState, startTime: Date.now() }
    }
    
    newState = drawNextPiece(newState)
    setGameState(newState)
  }, [gameState])

  // 跳过当前碎片
  const handleSkip = useCallback(() => {
    if (!gameState) return
    setGameState(skipCurrentPiece(gameState))
  }, [gameState])

  // 旋转当前碎片
  const handleRotate = useCallback(() => {
    if (!gameState || gameState.currentPieceId === null) return
    
    const pieceIndex = gameState.pieces.findIndex(p => p.id === gameState.currentPieceId)
    if (pieceIndex === -1) return
    
    const newPieces = [...gameState.pieces]
    newPieces[pieceIndex] = rotatePiece(newPieces[pieceIndex])
    
    setGameState({ ...gameState, pieces: newPieces })
  }, [gameState])

  // 放置碎片
  const handlePiecePlaced = useCallback((pieceId: number, row: number, col: number) => {
    if (!gameState) return
    
    const newState = placePiece(gameState, pieceId, row, col)
    setGameState(newState)
    
    // 自动抽取下一块
    if (!newState.isComplete) {
      setTimeout(() => {
        setGameState(prev => prev ? drawNextPiece(prev) : null)
      }, 300)
    } else {
      setGamePhase('complete')
    }
  }, [gameState])

  // 移除已放置的碎片
  const handlePieceRemoved = useCallback((pieceId: number) => {
    if (!gameState) return
    setGameState(removePlacedPiece(gameState, pieceId))
  }, [gameState])

  // 视口变化
  const handleViewportChange = useCallback((viewport: AdvancedGameState['viewport']) => {
    if (!gameState) return
    setGameState({ ...gameState, viewport })
  }, [gameState])

  // 保存游戏
  const handleSave = useCallback(() => {
    if (!gameState) return
    saveAdvancedGameProgress(gameState)
    setSaves(getAdvancedGameSaves())
    alert('游戏进度已保存！')
  }, [gameState])

  // 加载存档
  const handleLoadSave = useCallback((saveId: string) => {
    const state = loadAdvancedGameSave(saveId)
    if (state) {
      setGameState(state)
      setGamePhase('playing')
      setShowSaves(false)
    }
  }, [])

  // 删除存档
  const handleDeleteSave = useCallback((saveId: string) => {
    deleteAdvancedGameSave(saveId)
    setSaves(getAdvancedGameSaves())
  }, [])

  // 处理图片上传
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string)
        setSelectedImage('')
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // 再来一局
  const handlePlayAgain = useCallback(() => {
    setGameState(null)
    setGamePhase('setup')
  }, [])

  // 设置界面
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={onBackToMenu}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              返回主页
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSaves(!showSaves)}
            >
              <HistoryIcon className="h-4 w-4 mr-2" />
              存档 ({saves.length})
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
            高级拼图模式
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            挑战高达 1024 块碎片的超大拼图
          </p>

          {/* 存档列表 */}
          {showSaves && saves.length > 0 && (
            <Card className="mb-8">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">游戏存档</h3>
                <div className="space-y-3">
                  {saves.map(save => (
                    <div 
                      key={save.id}
                      className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg"
                    >
                      <img 
                        src={save.thumbnailUrl} 
                        alt="存档缩略图"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {save.state.gridSize}x{save.state.gridSize} 拼图
                        </p>
                        <p className="text-sm text-muted-foreground">
                          进度: {save.progress}% | 
                          保存于: {new Date(save.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleLoadSave(save.id)}
                        >
                          继续
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteSave(save.id)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 图片选择 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                选择图片
              </h3>
              
              {/* 预设图片 */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                {PRESET_IMAGES.map(img => (
                  <button
                    key={img.id}
                    onClick={() => {
                      setSelectedImage(img.url)
                      setCustomImage('')
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img.url 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img 
                      src={img.thumbnail} 
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedImage === img.url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <CheckCircle2Icon className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* 上传按钮 */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full">
                  <UploadIcon className="h-4 w-4 mr-2" />
                  上传自定义图片
                </Button>
              </div>

              {customImage && (
                <div className="mt-4 flex items-center gap-4">
                  <img 
                    src={customImage} 
                    alt="自定义图片"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <span className="text-sm text-muted-foreground">已选择自定义图片</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 难度设置 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5" />
                游戏设置
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">难度级别</span>
                  <Select 
                    value={String(gridSize)} 
                    onValueChange={(v) => setGridSize(Number(v))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADVANCED_DIFFICULTY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-foreground">边缘优先</span>
                    <p className="text-xs text-muted-foreground">
                      优先抽取角落和边缘碎片
                    </p>
                  </div>
                  <Switch
                    checked={edgePiecesFirst}
                    onCheckedChange={setEdgePiecesFirst}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 开始按钮 */}
          <Button
            size="lg"
            onClick={startGame}
            disabled={!currentImageUrl}
            className="w-full"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            开始游戏
          </Button>
        </div>
      </div>
    )
  }

  // 完成界面
  if (gamePhase === 'complete' && gameState) {
    const totalTime = gameState.endTime && gameState.startTime
      ? Math.floor((gameState.endTime - gameState.startTime) / 1000)
      : 0

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                恭喜完成！
              </h2>
              <p className="text-muted-foreground">
                你成功完成了 {gameState.gridSize}x{gameState.gridSize} 的拼图
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">总用时</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatTime(totalTime)}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">总步数</p>
                <p className="text-2xl font-bold text-foreground">
                  {gameState.moves}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onBackToMenu} className="flex-1">
                返回主页
              </Button>
              <Button onClick={handlePlayAgain} className="flex-1">
                再来一局
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 游戏界面
  if (!gameState) return null

  const currentPiece = gameState.currentPieceId !== null
    ? gameState.pieces.find(p => p.id === gameState.currentPieceId) || null
    : null

  const canDrawPiece =
    !currentPiece &&
    (gameState.piecePool.length > 0 || gameState.skippedPieces.length > 0)

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 顶部工具栏 */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="sm" onClick={onBackToMenu}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          退出
        </Button>
        <h1 className="font-semibold text-foreground">
          {gameState.gridSize}x{gameState.gridSize} 高级拼图
        </h1>
        <Button variant="outline" size="sm" onClick={handleSave}>
          保存进度
        </Button>
      </header>

      {/* 主游戏区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧边栏 */}
        <aside className="w-64 border-r border-border p-4 space-y-4 overflow-y-auto bg-card/50">
          {canDrawPiece && (
            <Button onClick={handleDrawPiece} className="w-full">
              <SparklesIcon className="h-4 w-4 mr-2" />
              抽取碎片
            </Button>
          )}

          <CurrentPiece
            piece={currentPiece}
            imageUrl={gameState.imageUrl}
            gridSize={gameState.gridSize}
            onRotate={handleRotate}
            onSkip={handleSkip}
            disabled={!currentPiece}
          />
          
          <PiecePool
            pieces={gameState.pieces}
            poolIds={gameState.piecePool}
            skippedIds={gameState.skippedPieces}
            filter={pieceFilter}
            onFilterChange={setPieceFilter}
          />
        </aside>

        {/* 画布区域（可全屏） */}
        <main
          ref={playAreaRef}
          className="relative flex flex-1 flex-col min-h-0 min-w-0 bg-background p-4"
        >
          <div className="mb-2 flex shrink-0 items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={togglePlayAreaFullscreen}
              title={playAreaFullscreen ? '退出全屏' : '全屏画布'}
            >
              {playAreaFullscreen ? (
                <Minimize2Icon className="h-4 w-4 mr-1" />
              ) : (
                <Maximize2Icon className="h-4 w-4 mr-1" />
              )}
              {playAreaFullscreen ? '退出全屏' : '全屏画布'}
            </Button>
          </div>

          <div className="relative min-h-0 flex-1">
            <InfiniteCanvas
              pieces={gameState.pieces}
              gridSize={gameState.gridSize}
              imageUrl={gameState.imageUrl}
              viewport={gameState.viewport}
              onViewportChange={handleViewportChange}
              currentPieceId={gameState.currentPieceId}
              onPiecePlaced={handlePiecePlaced}
              onPieceRemoved={handlePieceRemoved}
              showReferenceImage={showReferenceImage}
              highlightConnectedRegions={highlightConnected}
            />

            {playAreaFullscreen && !referenceFloatDismissed && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-end p-4">
                <Collapsible
                  open={referenceFloatExpanded}
                  onOpenChange={setReferenceFloatExpanded}
                  className="pointer-events-auto w-[min(18rem,calc(100vw-3rem))] max-w-[min(18rem,40vw)]"
                >
                  <Card className="overflow-hidden border-border/80 bg-card/95 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        参考图
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setReferenceDialogOpen(true)}
                        title="放大查看"
                      >
                        <ZoomInIcon className="h-4 w-4" />
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          title={referenceFloatExpanded ? '收起' : '展开'}
                        >
                          {referenceFloatExpanded ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronUpIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setReferenceFloatDismissed(true)}
                        title="关闭悬浮窗"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <CollapsibleContent>
                      <button
                        type="button"
                        className="block w-full cursor-zoom-in p-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => setReferenceDialogOpen(true)}
                      >
                        <img
                          src={gameState.imageUrl}
                          alt="参考图"
                          className="max-h-48 w-full rounded-md object-contain"
                        />
                      </button>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            )}

            {playAreaFullscreen && referenceFloatDismissed && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-end p-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="pointer-events-auto shadow-md"
                  onClick={() => setReferenceFloatDismissed(false)}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  显示参考图
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* 右侧边栏 */}
        <aside className="w-64 border-l border-border p-4 overflow-y-auto bg-card/50">
          <ProgressPanel
            state={gameState}
            onSave={handleSave}
            showReferenceImage={showReferenceImage}
            onToggleReference={setShowReferenceImage}
            highlightConnected={highlightConnected}
            onToggleHighlight={setHighlightConnected}
          />

          {/* 参考图预览 */}
          <div className="mt-4">
            <h3 className="font-semibold text-foreground mb-2 text-sm">参考图</h3>
            <img 
              src={gameState.imageUrl}
              alt="参考图"
              className="w-full rounded-lg border border-border"
            />
          </div>
        </aside>
      </div>

      <Dialog open={referenceDialogOpen} onOpenChange={setReferenceDialogOpen}>
        <DialogContent
          className="max-h-[90vh] max-w-[min(96vw,56rem)] overflow-y-auto"
          showCloseButton
          container={
            playAreaFullscreen && playAreaRef.current
              ? playAreaRef.current
              : undefined
          }
        >
          <DialogHeader>
            <DialogTitle>参考图</DialogTitle>
            <DialogDescription className="sr-only">
              查看完整参考图，可全屏查看细节。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex justify-center rounded-md bg-muted/30 p-2">
              <img
                src={gameState.imageUrl}
                alt="参考图"
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setReferenceDialogOpen(false)
                  setReferenceImageFullBleed(true)
                }}
              >
                <Maximize2Icon className="mr-2 h-4 w-4" />
                全屏查看
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {referenceImageFullBleed &&
        createPortal(
          <div
            className={cn(
              'z-[100] flex flex-col bg-black',
              playAreaFullscreen ? 'absolute inset-0' : 'fixed inset-0'
            )}
            role="presentation"
          >
            <div className="flex shrink-0 items-center justify-end gap-2 border-b border-white/10 p-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={() => setReferenceImageFullBleed(false)}
              >
                <XIcon className="mr-2 h-4 w-4" />
                关闭
              </Button>
            </div>
            <button
              type="button"
              className="flex min-h-0 flex-1 cursor-default items-center justify-center overflow-auto p-4"
              onClick={() => setReferenceImageFullBleed(false)}
            >
              <img
                src={gameState.imageUrl}
                alt="参考图全屏"
                className="max-h-full max-w-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </button>
          </div>,
          playAreaFullscreen && playAreaRef.current
            ? playAreaRef.current
            : document.body
        )}
    </div>
  )
}
