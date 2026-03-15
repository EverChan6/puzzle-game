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
