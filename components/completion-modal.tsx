'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/puzzle-utils'
import { Trophy, Clock, Move, Share2, RotateCcw, Sparkles } from 'lucide-react'

interface CompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onPlayAgain: () => void
  moves: number
  time: number
  gridSize: number
  imageUrl: string
}

export function CompletionModal({
  isOpen,
  onClose,
  onPlayAgain,
  moves,
  time,
  gridSize,
  imageUrl
}: CompletionModalProps) {
  const handleShare = async () => {
    const text = `我在拼图大师完成了一个 ${gridSize}x${gridSize} 的拼图！用时 ${formatTime(time)}，步数 ${moves}。来挑战我吧！`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '拼图大师 - 游戏成绩',
          text: text,
          url: window.location.href
        })
      } catch {
        // 用户取消分享
      }
    } else {
      // 复制到剪贴板
      await navigator.clipboard.writeText(text)
      alert('成绩已复制到剪贴板！')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-[var(--success)]/20 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-[var(--success)]" />
          </div>
          <DialogTitle className="text-2xl flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            恭喜完成！
            <Sparkles className="w-5 h-5 text-accent" />
          </DialogTitle>
          <DialogDescription>
            你成功完成了 {gridSize}x{gridSize} 拼图挑战
          </DialogDescription>
        </DialogHeader>

        {/* 完成的图片预览 */}
        <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden shadow-lg ring-2 ring-[var(--success)]/30">
          <img
            src={imageUrl}
            alt="完成的拼图"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>

        {/* 成绩统计 */}
        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-sm text-muted-foreground">用时</div>
            <div className="text-xl font-mono font-bold text-foreground">
              {formatTime(time)}
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <Move className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-sm text-muted-foreground">步数</div>
            <div className="text-xl font-mono font-bold text-foreground">
              {moves}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-2">
          <Button onClick={onPlayAgain} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            再玩一次
          </Button>
          <Button onClick={handleShare} variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            分享成绩
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
