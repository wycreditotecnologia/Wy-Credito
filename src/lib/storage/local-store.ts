export type LocalFileMeta = {
  applicationId?: string | number | null
  kind: string
  filename: string
  createdAt: number
}

type StoredRecord = {
  key: string
  meta: LocalFileMeta
  blob: Blob
}

const DB_NAME = 'wy-local-files'
const STORE = 'files'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function ensurePersistence(): Promise<boolean> {
  if (!('storage' in navigator) || !('persist' in navigator.storage)) return false
  try {
    // Request persistent storage to reduce eviction risk
    const persisted = await navigator.storage.persist()
    return persisted
  } catch {
    return false
  }
}

export async function estimateUsage(): Promise<{ usage?: number; quota?: number }> {
  if (!('storage' in navigator) || !('estimate' in navigator.storage)) return {}
  try {
    const { usage, quota } = await navigator.storage.estimate()
    return { usage, quota }
  } catch {
    return {}
  }
}

export async function saveLocalFile(key: string, blob: Blob, meta: Omit<LocalFileMeta, 'createdAt'>): Promise<string> {
  const db = await openDB()
  const tx = db.transaction(STORE, 'readwrite')
  const store = tx.objectStore(STORE)
  const record: StoredRecord = { key, meta: { ...meta, createdAt: Date.now() }, blob }
  await new Promise<void>((resolve, reject) => {
    const req = store.put(record, key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
  tx.commit?.()
  db.close()
  return key
}

export async function getLocalFile(key: string): Promise<StoredRecord | null> {
  const db = await openDB()
  const tx = db.transaction(STORE, 'readonly')
  const store = tx.objectStore(STORE)
  const value = await new Promise<StoredRecord | null>((resolve, reject) => {
    const req = store.get(key)
    req.onsuccess = () => resolve((req.result as StoredRecord) || null)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return value
}

export async function listLocalFiles(prefix?: string): Promise<StoredRecord[]> {
  const db = await openDB()
  const tx = db.transaction(STORE, 'readonly')
  const store = tx.objectStore(STORE)
  const out: StoredRecord[] = []
  await new Promise<void>((resolve, reject) => {
    const req = store.openCursor()
    req.onsuccess = () => {
      const cursor = req.result as IDBCursorWithValue | null
      if (!cursor) return resolve()
      const key = String(cursor.key)
      const val = cursor.value as StoredRecord
      if (!prefix || key.startsWith(prefix)) out.push(val)
      cursor.continue()
    }
    req.onerror = () => reject(req.error)
  })
  db.close()
  return out
}

export async function deleteLocalFile(key: string): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE, 'readwrite')
  const store = tx.objectStore(STORE)
  await new Promise<void>((resolve, reject) => {
    const req = store.delete(key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
  tx.commit?.()
  db.close()
}

