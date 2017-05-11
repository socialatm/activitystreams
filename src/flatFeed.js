class FlatFeed {
  constructor(id,store){
    this.id = id
    this.store = store
  }
  get opts() {
    return Object.assign({}, this.store.opts)
  }
}

export default FlatFeed
