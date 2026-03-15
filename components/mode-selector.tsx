'use client'

import type { GameMode } from '@/lib/puzzle-types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Grid3X3Icon, 
  LayoutGridIcon, 
  ArrowRightIcon,
  ClockIcon,
  TargetIcon,
  SparklesIcon
} from 'lucide-react'

interface ModeSelectorProps {
  onSelectMode: (mode: GameMode) => void
}

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            拼图大师
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            选择你喜欢的游戏模式，开始一段轻松愉快的拼图之旅
          </p>
        </div>

        {/* 模式选择卡片 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 经典模式 */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer"
                onClick={() => onSelectMode('classic')}>
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Grid3X3Icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                  推荐新手
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-3">
                经典模式
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                传统的拼图交换玩法，通过交换碎片位置来还原图片。
                适合快速游戏和休闲放松。
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <TargetIcon className="h-4 w-4" />
                  <span>3x3 到 10x10 网格</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <ClockIcon className="h-4 w-4" />
                  <span>5-30 分钟游戏时长</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <SparklesIcon className="h-4 w-4" />
                  <span>点击或拖拽交换碎片</span>
                </div>
              </div>

              <Button className="w-full group-hover:bg-primary">
                开始经典模式
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* 高级模式 */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:border-accent/50 cursor-pointer"
                onClick={() => onSelectMode('advanced')}>
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <LayoutGridIcon className="h-7 w-7 text-accent" />
                </div>
                <span className="text-xs font-medium bg-accent/20 text-accent px-3 py-1 rounded-full">
                  挑战模式
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-3">
                高级模式
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                全新的抽取放置玩法，从碎片池随机抽取碎片并放置到正确位置。
                支持旋转和跳过功能。
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <TargetIcon className="h-4 w-4" />
                  <span>最高支持 1024 块碎片</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <ClockIcon className="h-4 w-4" />
                  <span>无限画布，自由缩放</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <SparklesIcon className="h-4 w-4" />
                  <span>支持进度保存与恢复</span>
                </div>
              </div>

              <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent">
                开始高级模式
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 底部说明 */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          上传自己的图片或选择预设图库，开始你的拼图挑战
        </p>
      </div>
    </div>
  )
}
