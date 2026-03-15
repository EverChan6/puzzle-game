// 边缘形状类型: 0=平边（边界）, 1=凸出, -1=凹陷
export type EdgeType = 0 | 1 | -1

export interface PieceEdges {
  top: EdgeType
  right: EdgeType
  bottom: EdgeType
  left: EdgeType
}

export interface PuzzlePiece {
  id: number
  currentIndex: number
  correctIndex: number
  imageX: number
  imageY: number
  edges: PieceEdges
}

export interface GameState {
  pieces: PuzzlePiece[]
  gridSize: number
  moves: number
  startTime: number | null
  endTime: number | null
  isComplete: boolean
  imageUrl: string
}

export interface GameRecord {
  id: string
  imageUrl: string
  gridSize: number
  moves: number
  time: number
  date: string
}

export interface PresetImage {
  id: string
  url: string
  name: string
  thumbnail: string
}

export const PRESET_IMAGES: PresetImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
    name: '山峰日出',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
    name: '海边落日',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=800&fit=crop',
    name: '金门大桥',
    thumbnail: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200&h=200&fit=crop'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop',
    name: '海浪',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=200&fit=crop'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop',
    name: '森林小径',
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=800&fit=crop',
    name: '星空银河',
    thumbnail: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=200&h=200&fit=crop'
  }
]

export const DIFFICULTY_OPTIONS = [
  { value: 3, label: '简单 (3x3)', pieces: 9 },
  { value: 4, label: '普通 (4x4)', pieces: 16 },
  { value: 5, label: '中等 (5x5)', pieces: 25 },
  { value: 6, label: '困难 (6x6)', pieces: 36 },
  { value: 8, label: '专家 (8x8)', pieces: 64 },
  { value: 10, label: '大师 (10x10)', pieces: 100 }
]

// ============ 高级模式类型定义 ============

export type GameMode = 'classic' | 'advanced'

// 旋转角度: 0, 90, 180, 270
export type Rotation = 0 | 90 | 180 | 270

// 高级模式拼图块
export interface AdvancedPuzzlePiece {
  id: number
  correctRow: number
  correctCol: number
  imageX: number
  imageY: number
  edges: PieceEdges
  rotation: Rotation
  // 当前在画布上的位置（格子坐标），null 表示还在碎片池中
  placedPosition: { row: number; col: number } | null
  // 是否已正确放置
  isCorrect: boolean
  // 碎片类型：corner/edge/center
  pieceType: 'corner' | 'edge' | 'center'
  // 主色调（用于自动分组）
  dominantColor?: string
}

// 画布视口状态
export interface ViewportState {
  scale: number
  offsetX: number
  offsetY: number
}

// 高级模式游戏状态
export interface AdvancedGameState {
  pieces: AdvancedPuzzlePiece[]
  gridSize: number
  piecePool: number[] // 碎片池中的碎片ID
  placedPieces: number[] // 已放置的碎片ID
  currentPieceId: number | null // 当前抽取的碎片ID
  skippedPieces: number[] // 跳过的碎片ID（优先级较低）
  startTime: number | null
  endTime: number | null
  isComplete: boolean
  imageUrl: string
  moves: number
  viewport: ViewportState
  // 智能提示设置
  showEdgePiecesFirst: boolean
  autoGroupByColor: boolean
}

// 高级模式难度选项
export const ADVANCED_DIFFICULTY_OPTIONS = [
  { value: 10, label: '入门 (10x10)', pieces: 100 },
  { value: 16, label: '简单 (16x16)', pieces: 256 },
  { value: 20, label: '普通 (20x20)', pieces: 400 },
  { value: 25, label: '困难 (25x25)', pieces: 625 },
  { value: 32, label: '专家 (32x32)', pieces: 1024 },
]

// 高级模式游戏存档
export interface AdvancedGameSave {
  id: string
  state: AdvancedGameState
  savedAt: string
  thumbnailUrl: string
  progress: number // 完成百分比
}

// 碎片池过滤器
export type PieceFilter = 'all' | 'corner' | 'edge' | 'center'

// 颜色分组
export interface ColorGroup {
  color: string
  pieceIds: number[]
}
