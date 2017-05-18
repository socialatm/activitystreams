class FlatFeed {
  constructor(id,store,pubsub){
    this.id = id
    this.store = store
    this.pubsub = pubsub
  }
  get opts() {
    return Object.assign({}, this.store.opts)
  }
  add(activity){
    return new Promise((resolve,reject)=>{
      if (!(activity.actor && activity.verb && activity.object)) {
        reject(new Error('invalid activity: minimal activity must specify actor, verb and object'))
      } else {
        const {collections:{data},opts} = this.store
        data.insert(
          Object.assign({
            time: new Date()
          }, activity),
          (err, result)=>{
            if (err) {
              reject(err)
            } else {
              try {
                resolve(result)
              } finally {
                this.pubsub.publish('activity-added', {
                  activity: result,
                  opts: opts
                })
              }
            }
          }
        )
      }
    })
  }
}

export default FlatFeed
