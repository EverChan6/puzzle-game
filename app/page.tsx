'use client'

import { useState } from 'react'
import type { GameMode } from '@/lib/puzzle-types'
import { ModeSelector } from '@/components/mode-selector'
import { PuzzleGame } from '@/components/puzzle-game'
import { AdvancedPuzzleGame } from '@/components/advanced/advanced-puzzle-game'

export default function Home() {
  const [currentMode, setCurrentMode] = useState<GameMode | null>(null)

  // 返回模式选择
  const handleBackToMenu = () => {
    setCurrentMode(null)
  }

  // 未选择模式时显示选择器
  if (!currentMode) {
    return <ModeSelector onSelectMode={setCurrentMode} />
  }

  // 经典模式
  if (currentMode === 'classic') {
    return <PuzzleGame onBackToMenu={handleBackToMenu} />
  }

  // 高级模式
  return <AdvancedPuzzleGame onBackToMenu={handleBackToMenu} />
}
