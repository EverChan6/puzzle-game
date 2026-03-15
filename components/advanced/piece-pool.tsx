'use client'

import { useMemo } from 'react'
import type { AdvancedPuzzlePiece, PieceFilter } from '@/lib/puzzle-types'
import { Button } from '@/components/ui/button'
import { 
  SquareIcon, 
  CornerUpLeftIcon, 
  MinusIcon,
  CircleIcon
} from 'lucide-react'

interface PiecePoolProps {
  pieces: AdvancedPuzzlePiece[]
  poolIds: number[]
  skippedIds: number[]
  filter: PieceFilter
  onFilterChange: (filter: PieceFilter) => void
}

export function PiecePool({
  pieces,
  poolIds,
  skippedIds,
  filter,
  onFilterChange
}: PiecePoolProps) {
  // 统计各类型碎片数量
  const stats = useMemo(() => {
    const allPoolIds = [...poolIds, ...skippedIds]
    const poolPieces = pieces.filter(p => allPoolIds.includes(p.id))
    
    return {
      total: poolPieces.length,
      corner: poolPieces.filter(p => p.pieceType === 'corner').length,
      edge: poolPieces.filter(p => p.pieceType === 'edge').length,
      center: poolPieces.filter(p => p.pieceType === 'center').length,
      skipped: skippedIds.length
    }
  }, [pieces, poolIds, skippedIds])

  const filterOptions: { value: PieceFilter; label: string; icon: React.ReactNode; count: number }[] = [
    { value: 'all', label: '全部', icon: <SquareIcon className="h-4 w-4" />, count: stats.total },
    { value: 'corner', label: '角落', icon: <CornerUpLeftIcon className="h-4 w-4" />, count: stats.corner },
    { value: 'edge', label: '边缘', icon: <MinusIcon className="h-4 w-4" />, count: stats.edge },
    { value: 'center', label: '中心', icon: <CircleIcon className="h-4 w-4" />, count: stats.center },
  ]

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">碎片池</h3>
        <span className="text-sm text-muted-foreground">
          剩余 {stats.total} 块
        </span>
      </div>
      
      {/* 筛选按钮 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filterOptions.map(option => (
          <Button
            key={option.value}
            variant={filter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(option.value)}
            className="text-xs"
          >
            {option.icon}
            <span className="ml-1">{option.label}</span>
            <span className="ml-1 text-xs opacity-70">({option.count})</span>
          </Button>
        ))}
      </div>
      
      {/* 统计信息 */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-secondary/50 rounded-md p-2">
          <span className="text-muted-foreground">待抽取</span>
          <p className="font-medium text-foreground">{poolIds.length}</p>
        </div>
        <div className="bg-accent/20 rounded-md p-2">
          <span className="text-muted-foreground">已跳过</span>
          <p className="font-medium text-accent-foreground">{stats.skipped}</p>
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>已放置</span>
          <span>{pieces.length - stats.total} / {pieces.length}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((pieces.length - stats.total) / pieces.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
