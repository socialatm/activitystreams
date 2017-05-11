import Client from './client'

const MongoClient = require('mongodb').MongoClient

const ActivityStreams = {}

ActivityStreams.connect = function(uris, opts){
  return new Promise((resolve,reject) => {
    MongoClient.connect(uris, opts, (err, conn) => {
      if (err) {
        reject(err)
      } else {
        resolve(this.init(conn))
      }
    });
  })
}

ActivityStreams.init = function(conn){
  return new Promise((resolve,reject) => {
    if (conn && conn.collection) {
      conn.on('error', (err) => {
        this.emit('error', err);
      });
      resolve(new Client(conn))
    } else {
      reject(new Error('Invalid connection'))
    }
  })
}

export default ActivityStreams
