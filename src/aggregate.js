class Impl {
  constructor(db, name, opts){
    this.db = db
    this.name = name
    // todo: opts
  }
}

class AggregateFeedStore {
  static create(db, name, opts){
    return new Impl(db, name, opts)
  }
}

export default AggregateFeedStore
