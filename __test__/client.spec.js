import Client from '../lib/client'

test('construction fails if passed an invalid connection', () => {
  let err
  try {
    new Client()
  } catch (e) {
    err = e
  }
  expect(err).toBeDefined()
})

test('construction succeeds if passed a valid connection', () => {
  new Client({ collection: 'foo' }) // mimicking valid connection
})
