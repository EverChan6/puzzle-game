'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AdvancedGameState } from '@/lib/puzzle-types'
import { formatTime, getGameStats } from '@/lib/puzzle-utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { 
  ClockIcon, 
  TargetIcon,
  LayersIcon,
  SaveIcon,
  ImageIcon,
  Grid3X3Icon,
  CheckCircle2Icon
} from 'lucide-react'

interface ProgressPanelProps {
  state: AdvancedGameState
  onSave: () => void
  showReferenceImage: boolean
  onToggleReference: (show: boolean) => void
  highlightConnected: boolean
  onToggleHighlight: (show: boolean) => void
}

export function ProgressPanel({
  state,
  onSave,
  showReferenceImage,
  onToggleReference,
  highlightConnected,
  onToggleHighlight
}: ProgressPanelProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  
  const stats = getGameStats(state)

  // 计时器
  useEffect(() => {
    if (!state.startTime || state.isComplete) return
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - state.startTime!) / 1000))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [state.startTime, state.isComplete])

  // 计算最终时间
  const displayTime = state.endTime && state.startTime
    ? Math.floor((state.endTime - state.startTime) / 1000)
    : elapsedTime

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border space-y-4">
      <h3 className="font-semibold text-foreground">游戏进度</h3>
      
      {/* 主要统计 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ClockIcon className="h-4 w-4" />
            <span className="text-xs">用时</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {formatTime(displayTime)}
          </p>
        </div>
        
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TargetIcon className="h-4 w-4" />
            <span className="text-xs">步数</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {state.moves}
          </p>
        </div>
      </div>
      
      {/* 详细统计 */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-2">
            <LayersIcon className="h-4 w-4" />
            已放置
          </span>
          <span className="font-medium text-foreground">
            {stats.placedPieces} / {stats.totalPieces}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-2">
            <CheckCircle2Icon className="h-4 w-4" />
            正确放置
          </span>
          <span className="font-medium text-foreground">
            {stats.correctPieces} ({stats.accuracy}%)
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-2">
            <Grid3X3Icon className="h-4 w-4" />
            剩余碎片
          </span>
          <span className="font-medium text-foreground">
            {stats.remainingPieces}
          </span>
        </div>
      </div>
      
      {/* 进度条 */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>完成进度</span>
          <span>{stats.progress}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>
      
      {/* 辅助选项 */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            显示参考图
          </span>
          <Switch
            checked={showReferenceImage}
            onCheckedChange={onToggleReference}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle2Icon className="h-4 w-4" />
            高亮已连接
          </span>
          <Switch
            checked={highlightConnected}
            onCheckedChange={onToggleHighlight}
          />
        </div>
      </div>
      
      {/* 保存按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
        className="w-full"
        disabled={state.isComplete}
      >
        <SaveIcon className="h-4 w-4 mr-2" />
        保存进度
      </Button>
    </div>
  )
}
