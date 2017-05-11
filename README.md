ActivityStrea.ms in Node.js on MongoDB.

Connect to the database.

```javascript
ActivityStreams.connect('mongodb://localhost:27017/my_db')
  .then(client => { /* do stuff */ })
  .catch(err => { /* ... */ })
```

Or initialise with a connection you already hold.

```javascript
ActivityStreams.init(conn)
  .then(client => { /* do stuff */ })
  .catch(err => { /* ... */ })
```

Create some flat feed stores. Flat feeds can be "followed". Each feed in the store is size-limited. Once the size is exceeded older activities drop out as newer activities are added. The default size limit for flat feeds is 1000.

```javascript
client.createFlatFeedStore('user', {feed_size_limit:20000})
  .then(store => { /* add activities and so on */ })
  .catch(err => { /* handle appropriately */ })

client.createFlatFeedStore('timeline', {feed_size_limit:500})
  .then(store => { /* ... */ })
  .catch(err => { /* ... */ })
```

Prepare to add activities to a particular feed in the 'user' store:

```javascript
const stevesStream = client.feed('user', 'steves-user-id')
```

Add activities to the feed. A basic activity contains at least `actor`, `verb`, and `object`.

```javascript
stevesStream.add({
  actor: 'steves-user-id',
  verb: 'like',
  object: 'a-photo-id'
})
```

Get newest 5 activities from the feed.

```javascript
stevesStream.get({limit:5}) // default limit is 20
  .then(activities => { /* do stuff */ })
  .catch(err => { /* handle nicely */ })
```

Get the next 5 activities from the feed.

```javascript
stevesStream.get({limit:5, id_lt:'abc123'})
  .then(activities -> { /* do more stuff */ })
  .catch(err => { /* handle sweetly */ })
```

Follow a feed, copying the 10 most recent activities into the follower's feed.

```javascript
const joesTimeline = client.feed('timeline', 'joes-user-id')
joesTimeline.follow('user', 'steves-user-id', {limit:10}) // default limit is 20
```

Create an aggregate feed store. Aggregate feeds are used to group activities, for example to enable a news-feed containing "Joe and 6 others like your comment", or "Steve followed you and 3 others". Aggregate feeds are size limited, the default being 200. When activities are grouped, the newest N (group_size) activities are stored in the group.

```javascript
client.createAggregateFeedStore('newsfeed', {
  feed_size_limit: 500,
  group_size: 3, // default 5
  // todo: grouping function
})
  .then(store => { /* ... */ })
  .catch(err => { /* ... */ })
```
