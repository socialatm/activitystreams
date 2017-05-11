import FlatFeed from './flatFeed'

class Store {
  constructor(collections,opts){
    this.collections = collections
    this.opts = opts
  }
  feed(id){
    return new FlatFeed(id,this)
  }
}

function ensureCollection(db, name){
  return new Promise((resolve,reject)=>{
    db.collections((err, collections)=>{
      const collection = collections.find(c => c.collectionName === name)
      if (collection) {
        resolve(collection)
      } else {
        // todo: opts?
        db.createCollection(name, {}, (err,created)=>{
          if (err) {
            reject(err)
          } else {
            resolve(created)
          }
        })
      }
    })
  })
}

function getCollectionNames(name){
  return {
    meta: `as_ff_${name}_meta`,
    data: `as_ff_${name}_data`
  }
}

function ensureStoreCollections(db, name){
  const names = getCollectionNames(name)
  return Promise.all([
      ensureCollection(db, names.meta),
      ensureCollection(db, names.data)
    ])
    .then(collections => {
      return {
        meta: collections[0],
        data: collections[1]
      }
    })
}

function getStoreCollections(db, name){
  return new Promise((resolve,reject)=>{
    db.collections((err,collections)=>{
      if (err) {
        reject(err)
      } else {
        const names = getCollectionNames(name)
            , meta = collections.find(c => c.collectionName === names.meta)
            , data = collections.find(c => c.collectionName === names.data)
            , result = { meta, data }
        if (meta && data) {
          resolve(result)
        } else {
          const missing = [ !meta && names.meta, !data && names.data ].filter(v => v)
          reject(new Error(`missing store collection(s): ${missing}`))
        }
      }

      if (err) {
        reject(err)
      } else {
        const names = Object.values(getCollectionNames(name))
            , arr = collections.filter(c => names.includes(c.collectionName))
        if (arr.length !== names.length) {
          reject(new Error(`expected ${names.length} collections, but only found ${arr.length}`))
        } else {
          resolve({
            meta: arr.find(c => c.collectionName === names.meta),
            data: arr.find(c => c.collectionName === names.data)
          })
        }
      }
    })
  })
}

function init(collections){
  return new Promise((resolve,reject)=>{
    // todo: read meta first ...
    resolve(new Store(collections,{}))
  })
}

const DEFAULT_OPTS = {
  feed_size_limit: 1000
}

function createMeta(name,collections,opts){
  return new Promise((resolve,reject)=>{
    if (opts.update) {
      collections.meta.update({ name },
      Object.assign({ name }, DEFAULT_OPTS, opts),
      (err,result)=>{
        if (err) {
          reject(err)
        } else {
          resolve(new Store(collections,result))
        }
      })
    } else {
      collections.meta.insert(
        Object.assign({ name }, DEFAULT_OPTS, opts),
        (err,result)=>{
          if (err) {
            reject(err)
          } else {
            resolve(new Store(collections,result))
          }
        }
      )
    }
  })
}

function newCache() {
  const __stores = {}
  return {
    put: (name,store) => {
      __stores[name] = store
    },
    get: (name) => {
      return __stores[name]
    }
  }
}

let cache = newCache()

class FlatFeedStore {
  static clearCache(){
    cache = newCache()
  }
  static create(db, name, opts){
    return new Promise((resolve,reject)=>{
      if (cache[name] && !opts.update){
        reject(new Error('store exists and you did not specify `update:true` in opts'))
      } else {
        const ensured = ensureStoreCollections(db, name)
          .then(collections => createMeta(name,collections,opts))
          .then(store => { cache.put(name,store); resolve(store) })
          .catch(reject)
      }
    })
  }
  static get(db, name){
    return new Promise((resolve,reject)=>{
      const cached = cache.get(name)
      if (cached) {
        resolve(cached)
      } else {
        getStoreCollections(db,name)
          .then(init)
          .then(store => { cache.put(name,store); resolve(store) })
          .catch(reject)
      }
    })
  }
}

export default FlatFeedStore
