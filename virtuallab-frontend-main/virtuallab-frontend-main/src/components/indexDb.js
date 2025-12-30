// IndexDB 工具类
export class IndexDBManager {
  constructor(dbName = 'three-editor-db', version = 1) {
    this.dbName = dbName
    this.version = version
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('models')) {
          const store = db.createObjectStore('models', { keyPath: 'name' })
          store.createIndex('name', 'name', { unique: true })
        }
      }
    })
  }

  async getRequest(name, url) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['models'], 'readwrite')
      const store = transaction.objectStore('models')
      
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const request = store.put({ name, blob, url })
          request.onsuccess = () => resolve({ name, blob, url })
          request.onerror = () => reject(request.error)
        })
        .catch(reject)
    })
  }

  async getAllRequest() {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['models'], 'readonly')
      const store = transaction.objectStore('models')
      const request = store.getAll()
      
      request.onsuccess = () => resolve({ data: request.result })
      request.onerror = () => reject(request.error)
    })
  }

  async deleteRequest(name) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['models'], 'readwrite')
      const store = transaction.objectStore('models')
      const request = store.delete(name)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear() {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['models'], 'readwrite')
      const store = transaction.objectStore('models')
      const request = store.clear()
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// 创建并返回 IndexDB 实例
export async function setIndexDB() {
  const indexDB = new IndexDBManager()
  await indexDB.init()
  return indexDB
} 