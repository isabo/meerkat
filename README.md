# Node.js Wrapper for Meerkat API

This is a Node.js implementation of a wrapper for communicating with the
[Meerkat API](http://developers.meerkatapp.co/api/).

## Installation Instructions

`npm install --save isabo/meerkat`

## Notes

* Periodically queries Meerkat's Routing Map and modifies the API endpoints accordingly.
* You can apply for an API token here: http://developers.meerkatapp.co/api/

## Usage

```javascript
var Meerkat = require('meerkat');

// Create an instance.
var meerkat = new Meerkat(API_TOKEN);


/**
 * Clean up when exiting.
 */
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown () {

	// Don't accept any more requests. Finish handling the current requests.
	server.close(function () {
		meerkat.dispose();
	});
}


/**
 * General requests.
 */
meerkat.getAllBroadcasts(function (err, broadcasts) {
    console.log(err || broadcasts);
});

meerkat.getScheduledBroadcasts(function (err, broadcasts) {
    console.log(err || broadcasts);
});


/**
 * Broadcast-specific requests.
 */
var broadcastId = '6a4da7ba-20f5-4f0d-81de-e5cf37b3072b';

meerkat.getBroadcastSummary(broadcastId, function (err, broadcasts) {
    console.log(err || broadcasts);
});

meerkat.getBroadcastActivities(broadcastId, function (err, activities) {
    console.log(err || activities);
});

meerkat.getBroadcastRestreams(broadcastId, function (err, restreams) {
    console.log(err || restreams);
});

meerkat.getBroadcastComments(broadcastId, function (err, comments) {
    console.log(err || comments);
});

meerkat.getBroadcastLikes(broadcastId, function (err, likes) {
    console.log(err || likes);
});

meerkat.getBroadcastWatchers(broadcastId, function (err, watchers) {
    console.log(err || watchers);
});


/**
 * User-specific requests.
 */
var userId = '54fb2e454d0000d23bb9c40f';

meerkat.getUserDetails(userId, function (err, userDetails) {
    console.log(err || userDetails);
});
```
