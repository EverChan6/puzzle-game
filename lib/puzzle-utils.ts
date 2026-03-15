import type { 
  PuzzlePiece, 
  GameRecord, 
  EdgeType, 
  PieceEdges, 
  AdvancedPuzzlePiece, 
  AdvancedGameState,
  AdvancedGameSave,
  Rotation,
  ViewportState
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

// ============ 高级模式工具函数 ============

/**
 * 确定碎片类型：角落/边缘/中心
 */
function getPieceType(row: number, col: number, gridSize: number): 'corner' | 'edge' | 'center' {
  const isTopEdge = row === 0
  const isBottomEdge = row === gridSize - 1
  const isLeftEdge = col === 0
  const isRightEdge = col === gridSize - 1
  
  const edgeCount = [isTopEdge, isBottomEdge, isLeftEdge, isRightEdge].filter(Boolean).length
  
  if (edgeCount >= 2) return 'corner'
  if (edgeCount === 1) return 'edge'
  return 'center'
}

/**
 * 生成高级模式边缘（带种子支持，确保可重现）
 */
function generateAdvancedEdges(gridSize: number, seed?: number): PieceEdges[][] {
  // 简单的伪随机数生成器
  let currentSeed = seed || Date.now()
  const random = () => {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff
    return currentSeed / 0x7fffffff
  }
  
  const edges: PieceEdges[][] = []
  
  const horizontalEdges: EdgeType[][] = []
  for (let row = 0; row <= gridSize; row++) {
    horizontalEdges[row] = []
    for (let col = 0; col < gridSize; col++) {
      if (row === 0 || row === gridSize) {
        horizontalEdges[row][col] = 0
      } else {
        horizontalEdges[row][col] = random() > 0.5 ? 1 : -1
      }
    }
  }
  
  const verticalEdges: EdgeType[][] = []
  for (let row = 0; row < gridSize; row++) {
    verticalEdges[row] = []
    for (let col = 0; col <= gridSize; col++) {
      if (col === 0 || col === gridSize) {
        verticalEdges[row][col] = 0
      } else {
        verticalEdges[row][col] = random() > 0.5 ? 1 : -1
      }
    }
  }
  
  for (let row = 0; row < gridSize; row++) {
    edges[row] = []
    for (let col = 0; col < gridSize; col++) {
      edges[row][col] = {
        top: horizontalEdges[row][col],
        bottom: (horizontalEdges[row + 1][col] * -1) as EdgeType,
        left: verticalEdges[row][col],
        right: (verticalEdges[row][col + 1] * -1) as EdgeType
      }
    }
  }
  
  return edges
}

/**
 * 创建高级模式拼图块
 */
export function createAdvancedPuzzlePieces(gridSize: number, seed?: number): AdvancedPuzzlePiece[] {
  const pieces: AdvancedPuzzlePiece[] = []
  const edgesMap = generateAdvancedEdges(gridSize, seed)
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const id = row * gridSize + col
      pieces.push({
        id,
        correctRow: row,
        correctCol: col,
        imageX: col,
        imageY: row,
        edges: edgesMap[row][col],
        rotation: 0,
        placedPosition: null,
        isCorrect: false,
        pieceType: getPieceType(row, col, gridSize)
      })
    }
  }
  
  return pieces
}

/**
 * 初始化高级模式碎片池
 * 支持边缘优先模式
 */
export function initializePiecePool(
  pieces: AdvancedPuzzlePiece[], 
  edgePiecesFirst: boolean = false
): number[] {
  const pieceIds = pieces.map(p => p.id)
  
  if (edgePiecesFirst) {
    // 分离角落、边缘和中心碎片
    const corners = pieces.filter(p => p.pieceType === 'corner').map(p => p.id)
    const edges = pieces.filter(p => p.pieceType === 'edge').map(p => p.id)
    const centers = pieces.filter(p => p.pieceType === 'center').map(p => p.id)
    
    // 分别打乱
    shuffleArray(corners)
    shuffleArray(edges)
    shuffleArray(centers)
    
    // 角落优先，然后边缘，最后中心
    return [...corners, ...edges, ...centers]
  }
  
  // 完全随机打乱
  shuffleArray(pieceIds)
  return pieceIds
}

/**
 * Fisher-Yates 数组打乱（原地修改）
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

/**
 * 从碎片池抽取下一块碎片
 */
export function drawNextPiece(state: AdvancedGameState): AdvancedGameState {
  // 优先从普通池抽取，池空则从跳过队列抽取
  let nextPieceId: number | null = null
  let newPool = [...state.piecePool]
  let newSkipped = [...state.skippedPieces]
  
  if (newPool.length > 0) {
    nextPieceId = newPool.shift()!
  } else if (newSkipped.length > 0) {
    nextPieceId = newSkipped.shift()!
  }
  
  return {
    ...state,
    piecePool: newPool,
    skippedPieces: newSkipped,
    currentPieceId: nextPieceId
  }
}

/**
 * 跳过当前碎片（放回队列末尾）
 */
export function skipCurrentPiece(state: AdvancedGameState): AdvancedGameState {
  if (state.currentPieceId === null) return state
  
  const newSkipped = [...state.skippedPieces, state.currentPieceId]
  
  return drawNextPiece({
    ...state,
    skippedPieces: newSkipped,
    currentPieceId: null
  })
}

/**
 * 旋转边缘（顺时针90度）
 */
function rotateEdges(edges: PieceEdges): PieceEdges {
  return {
    top: edges.left,
    right: edges.top,
    bottom: edges.right,
    left: edges.bottom
  }
}

/**
 * 获取旋转后的边缘
 */
export function getRotatedEdges(edges: PieceEdges, rotation: Rotation): PieceEdges {
  let rotated = { ...edges }
  const rotations = rotation / 90
  for (let i = 0; i < rotations; i++) {
    rotated = rotateEdges(rotated)
  }
  return rotated
}

/**
 * 旋转碎片（顺时针90度）
 */
export function rotatePiece(piece: AdvancedPuzzlePiece): AdvancedPuzzlePiece {
  const newRotation = ((piece.rotation + 90) % 360) as Rotation
  return {
    ...piece,
    rotation: newRotation
  }
}

/**
 * 检查碎片是否可以放置在指定位置
 * 验证边缘是否与相邻已放置的碎片匹配
 */
export function canPlacePiece(
  piece: AdvancedPuzzlePiece,
  targetRow: number,
  targetCol: number,
  placedPieces: AdvancedPuzzlePiece[],
  gridSize: number
): { canPlace: boolean; matchedEdges: number } {
  // 检查位置是否已被占用
  const isOccupied = placedPieces.some(
    p => p.placedPosition?.row === targetRow && p.placedPosition?.col === targetCol
  )
  if (isOccupied) return { canPlace: false, matchedEdges: 0 }
  
  // 检查位置是否在有效范围内
  if (targetRow < 0 || targetRow >= gridSize || targetCol < 0 || targetCol >= gridSize) {
    return { canPlace: false, matchedEdges: 0 }
  }
  
  const rotatedEdges = getRotatedEdges(piece.edges, piece.rotation)
  let matchedEdges = 0
  let hasConflict = false
  
  // 检查四个方向的相邻碎片
  const neighbors = [
    { dr: -1, dc: 0, myEdge: 'top' as const, theirEdge: 'bottom' as const },
    { dr: 1, dc: 0, myEdge: 'bottom' as const, theirEdge: 'top' as const },
    { dr: 0, dc: -1, myEdge: 'left' as const, theirEdge: 'right' as const },
    { dr: 0, dc: 1, myEdge: 'right' as const, theirEdge: 'left' as const },
  ]
  
  for (const { dr, dc, myEdge, theirEdge } of neighbors) {
    const neighborRow = targetRow + dr
    const neighborCol = targetCol + dc
    
    // 检查边界
    if (neighborRow < 0 || neighborRow >= gridSize || neighborCol < 0 || neighborCol >= gridSize) {
      // 边界位置，我的边缘必须是平边
      if (rotatedEdges[myEdge] !== 0) {
        // 对于非边界位置放到边界，不算冲突，只是不匹配
      }
      continue
    }
    
    // 查找相邻已放置的碎片
    const neighbor = placedPieces.find(
      p => p.placedPosition?.row === neighborRow && p.placedPosition?.col === neighborCol
    )
    
    if (neighbor) {
      const neighborRotatedEdges = getRotatedEdges(neighbor.edges, neighbor.rotation)
      const myEdgeValue = rotatedEdges[myEdge]
      const theirEdgeValue = neighborRotatedEdges[theirEdge]
      
      // 边缘必须互补：一个凸出(1)对应一个凹陷(-1)，或者都是平边(0)
      if (myEdgeValue + theirEdgeValue === 0) {
        matchedEdges++
      } else {
        hasConflict = true
      }
    }
  }
  
  return { canPlace: !hasConflict, matchedEdges }
}

/**
 * 放置碎片到画布
 */
export function placePiece(
  state: AdvancedGameState,
  pieceId: number,
  row: number,
  col: number
): AdvancedGameState {
  const pieceIndex = state.pieces.findIndex(p => p.id === pieceId)
  if (pieceIndex === -1) return state
  
  const piece = state.pieces[pieceIndex]
  
  // 检查是否放置正确
  const isCorrectPosition = piece.correctRow === row && piece.correctCol === col
  const isCorrectRotation = piece.rotation === 0
  const isCorrect = isCorrectPosition && isCorrectRotation
  
  const newPieces = [...state.pieces]
  newPieces[pieceIndex] = {
    ...piece,
    placedPosition: { row, col },
    isCorrect
  }
  
  const newPlacedPieces = [...state.placedPieces, pieceId]
  
  // 检查是否完成
  const isComplete = newPlacedPieces.length === state.pieces.length &&
    newPieces.every(p => p.isCorrect)
  
  return {
    ...state,
    pieces: newPieces,
    placedPieces: newPlacedPieces,
    currentPieceId: null,
    moves: state.moves + 1,
    isComplete,
    endTime: isComplete ? Date.now() : state.endTime
  }
}

/**
 * 移除已放置的碎片（重新放回当前手牌）
 */
export function removePlacedPiece(
  state: AdvancedGameState,
  pieceId: number
): AdvancedGameState {
  const pieceIndex = state.pieces.findIndex(p => p.id === pieceId)
  if (pieceIndex === -1) return state
  
  const piece = state.pieces[pieceIndex]
  if (!piece.placedPosition) return state
  
  const newPieces = [...state.pieces]
  newPieces[pieceIndex] = {
    ...piece,
    placedPosition: null,
    isCorrect: false
  }
  
  const newPlacedPieces = state.placedPieces.filter(id => id !== pieceId)
  
  return {
    ...state,
    pieces: newPieces,
    placedPieces: newPlacedPieces,
    currentPieceId: pieceId // 设为当前手牌
  }
}

/**
 * 初始化高级模式游戏状态
 */
export function initAdvancedGameState(
  imageUrl: string,
  gridSize: number,
  edgePiecesFirst: boolean = false
): AdvancedGameState {
  const seed = Date.now()
  const pieces = createAdvancedPuzzlePieces(gridSize, seed)
  const piecePool = initializePiecePool(pieces, edgePiecesFirst)
  
  return {
    pieces,
    gridSize,
    piecePool,
    placedPieces: [],
    currentPieceId: null,
    skippedPieces: [],
    startTime: null,
    endTime: null,
    isComplete: false,
    imageUrl,
    moves: 0,
    viewport: {
      scale: 1,
      offsetX: 0,
      offsetY: 0
    },
    showEdgePiecesFirst: edgePiecesFirst,
    autoGroupByColor: false
  }
}

/**
 * 保存高级模式游戏进度
 */
export function saveAdvancedGameProgress(state: AdvancedGameState): string {
  const save: AdvancedGameSave = {
    id: generateId(),
    state,
    savedAt: new Date().toISOString(),
    thumbnailUrl: state.imageUrl,
    progress: Math.round((state.placedPieces.length / state.pieces.length) * 100)
  }
  
  const saves = getAdvancedGameSaves()
  saves.unshift(save)
  // 最多保存 5 个存档
  const trimmed = saves.slice(0, 5)
  localStorage.setItem('advanced_puzzle_saves', JSON.stringify(trimmed))
  
  return save.id
}

/**
 * 获取所有高级模式存档
 */
export function getAdvancedGameSaves(): AdvancedGameSave[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('advanced_puzzle_saves')
  return data ? JSON.parse(data) : []
}

/**
 * 加载高级模式存档
 */
export function loadAdvancedGameSave(saveId: string): AdvancedGameState | null {
  const saves = getAdvancedGameSaves()
  const save = saves.find(s => s.id === saveId)
  return save ? save.state : null
}

/**
 * 删除高级模式存档
 */
export function deleteAdvancedGameSave(saveId: string): void {
  const saves = getAdvancedGameSaves()
  const filtered = saves.filter(s => s.id !== saveId)
  localStorage.setItem('advanced_puzzle_saves', JSON.stringify(filtered))
}

/**
 * 计算游戏统计信息
 */
export function getGameStats(state: AdvancedGameState): {
  totalPieces: number
  placedPieces: number
  correctPieces: number
  remainingPieces: number
  progress: number
  accuracy: number
} {
  const totalPieces = state.pieces.length
  const placedPieces = state.placedPieces.length
  const correctPieces = state.pieces.filter(p => p.isCorrect).length
  const remainingPieces = state.piecePool.length + state.skippedPieces.length
  const progress = Math.round((placedPieces / totalPieces) * 100)
  const accuracy = placedPieces > 0 ? Math.round((correctPieces / placedPieces) * 100) : 0
  
  return {
    totalPieces,
    placedPieces,
    correctPieces,
    remainingPieces,
    progress,
    accuracy
  }
}
