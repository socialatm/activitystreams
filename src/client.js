import FlatFeedStore from './flatStore'

class Client {
  constructor(db) {
    if (db && db.collection){
      this.db = db
    } else {
      throw new Error('Invalid connection')
    }
    this.feeds = {}
  }
  createFlatFeedStore(name, opts) {
    return FlatFeedStore.create(this.db, name, opts)
  }
  createAggregateFeedStore(name, opts) {
    return AggregateFeedStore.create(this.db, name, opts)
  }
}

export default Client
