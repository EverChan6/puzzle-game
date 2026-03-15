import type { 
  PuzzlePiece, 
  GameRecord, 
  EdgeType, 
  PieceEdges,
} from './puzzle-types'

/**
 * 生成拼图块的边缘形状
 * 确保相邻拼图块的边缘互补（一个凸出，一个凹陷）
 */
function generateEdges(gridSize: number): PieceEdges[][] {
  const edges: PieceEdges[][] = []
  
  // 先生成水平边缘（影响上下相邻块）
  const horizontalEdges: EdgeType[][] = []
  for (let row = 0; row <= gridSize; row++) {
    horizontalEdges[row] = []
    for (let col = 0; col < gridSize; col++) {
      if (row === 0 || row === gridSize) {
        horizontalEdges[row][col] = 0 // 边界为平边
      } else {
        horizontalEdges[row][col] = Math.random() > 0.5 ? 1 : -1
      }
    }
  }
  
  // 生成垂直边缘（影响左右相邻块）
  const verticalEdges: EdgeType[][] = []
  for (let row = 0; row < gridSize; row++) {
    verticalEdges[row] = []
    for (let col = 0; col <= gridSize; col++) {
      if (col === 0 || col === gridSize) {
        verticalEdges[row][col] = 0 // 边界为平边
      } else {
        verticalEdges[row][col] = Math.random() > 0.5 ? 1 : -1
      }
    }
  }
  
  // 组合成每个拼图块的边缘
  for (let row = 0; row < gridSize; row++) {
    edges[row] = []
    for (let col = 0; col < gridSize; col++) {
      edges[row][col] = {
        top: horizontalEdges[row][col],
        bottom: (horizontalEdges[row + 1][col] * -1) as EdgeType, // 相邻块边缘互补
        left: verticalEdges[row][col],
        right: (verticalEdges[row][col + 1] * -1) as EdgeType // 相邻块边缘互补
      }
    }
  }
  
  return edges
}

/**
 * 图片切割算法
 * 将图片按照网格大小切割成多个拼图块，并生成凸凹边缘
 */
export function createPuzzlePieces(gridSize: number): PuzzlePiece[] {
  const pieces: PuzzlePiece[] = []
  const totalPieces = gridSize * gridSize
  const edgesMap = generateEdges(gridSize)
  
  for (let i = 0; i < totalPieces; i++) {
    const row = Math.floor(i / gridSize)
    const col = i % gridSize
    pieces.push({
      id: i,
      currentIndex: i,
      correctIndex: i,
      imageX: col,
      imageY: row,
      edges: edgesMap[row][col]
    })
  }
  
  return pieces
}

/**
 * Fisher-Yates 洗牌算法
 * 确保生成的拼图是可解的
 */
export function shufflePieces(pieces: PuzzlePiece[]): PuzzlePiece[] {
  const shuffled = [...pieces]
  
  // Fisher-Yates 洗牌
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // 交换 currentIndex
    const tempIndex = shuffled[i].currentIndex
    shuffled[i] = { ...shuffled[i], currentIndex: shuffled[j].currentIndex }
    shuffled[j] = { ...shuffled[j], currentIndex: tempIndex }
  }
  
  // 确保拼图是可解的（逆序数为偶数）
  if (!isSolvable(shuffled)) {
    // 交换前两个非空块
    const tempIndex = shuffled[0].currentIndex
    shuffled[0] = { ...shuffled[0], currentIndex: shuffled[1].currentIndex }
    shuffled[1] = { ...shuffled[1], currentIndex: tempIndex }
  }
  
  return shuffled
}

/**
 * 检查拼图是否可解
 * 通过计算逆序数判断
 */
function isSolvable(pieces: PuzzlePiece[]): boolean {
  const arr = pieces.map(p => p.currentIndex)
  let inversions = 0
  
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) {
        inversions++
      }
    }
  }
  
  return inversions % 2 === 0
}

/**
 * 交换两个拼图块的位置
 */
export function swapPieces(
  pieces: PuzzlePiece[],
  index1: number,
  index2: number
): PuzzlePiece[] {
  const newPieces = [...pieces]
  const piece1 = newPieces.find(p => p.currentIndex === index1)
  const piece2 = newPieces.find(p => p.currentIndex === index2)
  
  if (piece1 && piece2) {
    const piece1Index = newPieces.indexOf(piece1)
    const piece2Index = newPieces.indexOf(piece2)
    newPieces[piece1Index] = { ...piece1, currentIndex: index2 }
    newPieces[piece2Index] = { ...piece2, currentIndex: index1 }
  }
  
  return newPieces
}

/**
 * 检查拼图是否完成
 */
export function checkComplete(pieces: PuzzlePiece[]): boolean {
  return pieces.every(piece => piece.currentIndex === piece.correctIndex)
}

/**
 * 格式化时间显示
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 保存游戏记录到 localStorage
 */
export function saveGameRecord(record: GameRecord): void {
  const records = getGameRecords()
  records.unshift(record)
  // 只保留最近 20 条记录
  const trimmed = records.slice(0, 20)
  localStorage.setItem('puzzle_records', JSON.stringify(trimmed))
}

/**
 * 获取游戏记录
 */
export function getGameRecords(): GameRecord[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('puzzle_records')
  return data ? JSON.parse(data) : []
}

/**
 * 清除所有游戏记录
 */
export function clearGameRecords(): void {
  localStorage.removeItem('puzzle_records')
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
