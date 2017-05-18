import FlatFeedStore from '../lib/flatStore'

function mockCollection(name,content){
  return {
    collectionName: name,
    insert: (doc,cb) => {
      cb(null,doc)
    },
    find: (query,cb) => {
      const result = content[JSON.stringify(query)]
      if (typeof result === 'Error') {
        cb(result)
      } else {
        cb(null,result)
      }
    },
    update: (query,doc,cb) => {
      cb(null,doc)
    }
  }
}

function mockDB(colls=[]) {
  const collections = jest.fn(cb => cb(null,colls.map(mockCollection)))
      , createCollection = jest.fn((name,opts,cb) => cb(null,mockCollection(name)))
  return {
    collections,
    createCollection
  }
}

beforeEach(()=>{ FlatFeedStore.clearCache() })

test('`create` checks for meta and data collections, uses existing if available', async () => {
  expect.assertions(1)
  const store = await FlatFeedStore.create(mockDB(['as_ff_test_meta','as_ff_test_data']), 'test', {})
  expect(store).toBeDefined()
})

test('`create` creates meta and data collections if not present', async () => {
  expect.assertions(1)
  const store = await FlatFeedStore.create(mockDB(), 'test', {})
  expect(store).toBeDefined()
})

test('`get` initialises using existing collections', async () => {
  expect.assertions(1)
  const store = await FlatFeedStore.get(mockDB(['as_ff_test_meta','as_ff_test_data']), 'test', {})
  expect(store).toBeDefined()
})

test('`get` fails if data collection missing', async () => {
  expect.assertions(1)
  try {
    const store = await FlatFeedStore.get(mockDB(['as_ff_test_meta']), 'test', {})
  } catch (e) {
    expect(e.message).toBe('missing store collection(s): as_ff_test_data')
  }
})

test('`get` fails if meta collection missing', async () => {
  expect.assertions(1)
  try {
    const store = await FlatFeedStore.get(mockDB(['as_ff_test_data']), 'test', {})
  } catch (e) {
    expect(e.message).toBe('missing store collection(s): as_ff_test_meta')
  }
})

test('`get` fails if both collections missing', async () => {
  expect.assertions(1)
  try {
    const store = await FlatFeedStore.get(mockDB(), 'test', {})
  } catch (e) {
    expect(e.message).toBe('missing store collection(s): as_ff_test_meta,as_ff_test_data')
  }
})

test('created store provides access to a specific feed', async () => {
  expect.assertions(1)
  const store = await FlatFeedStore.create(mockDB(), 'test', {})
      , feed = store.feed('a-feed-id')
  expect(feed).toBeDefined()
})

test('default feed_size_limit is 1000', async () => {
  expect.assertions(1)
  const store = await FlatFeedStore.create(mockDB(), 'test', {})
      , feed = store.feed('a-feed-id')
  expect(feed.opts.feed_size_limit).toBe(1000)
})

test('default feed_size_limit can be overridden', async () => {
  expect.assertions(1)
  const store = await FlatFeedStore.create(mockDB(), 'test', { feed_size_limit: 300 })
      , feed = store.feed('a-feed-id')
  expect(feed.opts.feed_size_limit).toBe(300)
})

test('accidental updates prevented by requiring `update:true` opt', async () => {
  expect.assertions(1)
  try {
    const db = mockDB()
        , store = await FlatFeedStore.create(db, 'test', { feed_size_limit: 300 })
        , again = await FlatFeedStore.create(db, 'test', { feed_size_limit: 20 })
  } catch (err) {
    expect(err.message).toBe('store exists and you did not specify `update:true` in opts')
  }
})

test('can update store opts by specifying `update:true`', async () => {
  expect.assertions(1)
  const db = mockDB()
      , store = await FlatFeedStore.create(db, 'test', { feed_size_limit: 300 })
      , again = await FlatFeedStore.create(db, 'test', { feed_size_limit: 20, update:true })
  expect(again).toBeDefined()
})
