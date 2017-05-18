import FlatFeed from '../lib/flatFeed'

const store = {
        collections: {
          data: {
            insert: (doc,cb) => {
              cb(null,doc)
            }
          }
        }
      }
    , pubsub = {
        publish: () => {}
      }

test('safety checks activity being added', async () => {
  expect.assertions(1)
  try {
    const feed = new FlatFeed('test',store,pubsub)
        , activity = await feed.add({
          actor: 'steve',
          verb: 'omitted'
          //object: 'the object :)'
        })
  } catch (err) {
    expect(err.message).toBe('invalid activity: minimal activity must specify actor, verb and object')
  }
})

test('inserts the activity to the db', async () => {
  expect.assertions(2)
  const feed = new FlatFeed('test',store,pubsub)
      , activity = await feed.add({
          actor: 'steve',
          verb: 'added',
          object: 'something'
        })
  expect(activity).toBeDefined()
  expect(activity.time).toBeDefined()
})
