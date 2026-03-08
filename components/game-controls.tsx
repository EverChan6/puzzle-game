'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DIFFICULTY_OPTIONS } from '@/lib/puzzle-types'
import { formatTime } from '@/lib/puzzle-utils'
import { Play, RotateCcw, Pause, Timer, Move, Grid3X3 } from 'lucide-react'

interface GameControlsProps {
  gridSize: number
  onGridSizeChange: (size: number) => void
  moves: number
  elapsedTime: number
  isPlaying: boolean
  onStart: () => void
  onReset: () => void
  disabled?: boolean
}

export function GameControls({
  gridSize,
  onGridSizeChange,
  moves,
  elapsedTime,
  isPlaying,
  onStart,
  onReset,
  disabled = false
}: GameControlsProps) {
  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-4 space-y-4">
        {/* 难度选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <Grid3X3 className="w-4 h-4 text-primary" />
            难度选择
          </label>
          <Select
            value={gridSize.toString()}
            onValueChange={(value) => onGridSizeChange(parseInt(value))}
            disabled={isPlaying}
          >
            <SelectTrigger className="w-full bg-background/50">
              <SelectValue placeholder="选择难度" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label} - {option.pieces} 块
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 游戏统计 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Timer className="w-4 h-4" />
              <span className="text-xs">用时</span>
            </div>
            <span className="text-xl font-mono font-bold text-foreground">
              {formatTime(elapsedTime)}
            </span>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Move className="w-4 h-4" />
              <span className="text-xs">步数</span>
            </div>
            <span className="text-xl font-mono font-bold text-foreground">
              {moves}
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {!isPlaying ? (
            <Button 
              onClick={onStart} 
              className="flex-1"
              disabled={disabled}
            >
              <Play className="w-4 h-4 mr-2" />
              开始游戏
            </Button>
          ) : (
            <Button 
              onClick={onReset} 
              variant="outline" 
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重新开始
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
