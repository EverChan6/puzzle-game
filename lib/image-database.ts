/**
 * IndexedDB 图片存储工具
 * 用于存储自定义上传的图片数据（DataURL），避免 localStorage 溢出
 */

const DB_NAME = 'puzzle-game-db'
const STORE_NAME = 'custom-images'
const DB_VERSION = 1

let db: IDBDatabase | null = null

/**
 * 初始化 IndexedDB
 */
export async function initImageDB(): Promise<void> {
  if (db) return

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('[v0] IndexedDB initialization failed:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      resolve()
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }
  })
}

/**
 * 保存自定义图片到 IndexedDB
 * @param id 图片唯一 ID
 * @param dataUrl 图片 DataURL
 */
export async function saveCustomImage(id: string, dataUrl: string): Promise<void> {
  if (!db) await initImageDB()

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(dataUrl, id)

    request.onerror = () => {
      console.error('[v0] Failed to save custom image:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve()
    }
  })
}

/**
 * 从 IndexedDB 读取自定义图片
 * @param id 图片唯一 ID
 * @returns 图片 DataURL 或 null
 */
export async function getCustomImage(id: string): Promise<string | null> {
  if (!db) await initImageDB()

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onerror = () => {
      console.error('[v0] Failed to get custom image:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result || null)
    }
  })
}

/**
 * 删除指定的自定义图片
 * @param id 图片唯一 ID
 */
export async function deleteCustomImage(id: string): Promise<void> {
  if (!db) await initImageDB()

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onerror = () => {
      console.error('[v0] Failed to delete custom image:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve()
    }
  })
}

/**
 * 清空所有自定义图片
 */
export async function clearAllCustomImages(): Promise<void> {
  if (!db) await initImageDB()

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onerror = () => {
      console.error('[v0] Failed to clear custom images:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve()
    }
  })
}
