'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getGameRecords, clearGameRecords, formatTime } from '@/lib/puzzle-utils'
import type { GameRecord } from '@/lib/puzzle-types'
import { History, Trash2, Clock, Move, Grid3X3 } from 'lucide-react'

export function GameHistory() {
  const [records, setRecords] = useState<GameRecord[]>([])

  useEffect(() => {
    setRecords(getGameRecords())
  }, [])

  const handleClear = () => {
    if (confirm('确定要清除所有历史记录吗？')) {
      clearGameRecords()
      setRecords([])
    }
  }

  const refreshRecords = () => {
    setRecords(getGameRecords())
  }

  // 暴露刷新方法给父组件
  useEffect(() => {
    window.addEventListener('puzzle-record-added', refreshRecords)
    return () => window.removeEventListener('puzzle-record-added', refreshRecords)
  }, [])

  if (records.length === 0) {
    return (
      <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            游戏记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            暂无游戏记录，完成一局游戏后将在此显示
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          游戏记录
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[200px]">
          <div className="px-4 pb-4 space-y-2">
            {records.map((record, index) => (
              <div
                key={record.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* 排名 */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                </div>

                {/* 缩略图 */}
                <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden">
                  <img
                    src={record.imageUrl}
                    alt="拼图"
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Grid3X3 className="w-3 h-3" />
                    <span>{record.gridSize}x{record.gridSize}</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{new Date(record.date).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      {formatTime(record.time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Move className="w-3 h-3 text-accent" />
                      {record.moves} 步
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
