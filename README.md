# Node.js Wrapper for Meerkat API

This is a Node.js implementation of a wrapper for communicating with the
[Meerkat API](http://developers.meerkatapp.co/api/).

## Installation Instructions

`npm install --save meerkat-api`

## Features

* There are two ways to use it:
	1. **Callbacks**: All methods take an optional callback function. The callback is called with
		two arguments: an error (or null if the operation succeeded) and an object containing the
		API data.
	2. **Promises**: If you don't supply a callback function, a Promise will be returned. If the
		operation completes successfully, the promise is resolved with the returned API data. If
		the operation fails, the promise is rejected with an error.
* Periodically queries Meerkat's Routing Map and modifies the API endpoints if they change.

## Usage

```javascript
var Meerkat = require('meerkat-api');

// Create an instance.
var meerkat = new Meerkat(API_TOKEN);
// You can get an API token here: http://developers.meerkatapp.co/api/

/**
 * General requests.
 */

// Callback style:
meerkat.getAllBroadcasts(function (err, broadcasts) {
    console.log(err || broadcasts);
});

// Promise style:
meerkat.getAllBroadcasts().
	then(function (broadcasts) {
		console.log(broadcasts);
	}, function (err) {
		console.log(err);
	});

// Callback style:
meerkat.getScheduledBroadcasts(function (err, broadcasts) {
    console.log(err || broadcasts);
});

// Promise style:
meerkat.getScheduledBroadcasts().
	then(function (broadcasts) {
		console.log(broadcasts);
	}, function (err) {
		console.log(err);
	});


/**
 * Broadcast-specific requests.
 */
var broadcastId = '6a4da7ba-20f5-4f0d-81de-e5cf37b3072b';

meerkat.getBroadcastSummary(broadcastId, function (err, summary) {
    console.log(err || summary);
});

meerkat.getBroadcastSummary(broadcastId).
	then(function (summary) {
		console.log(summary);
	}, function (err) {
		console.log(err);
	});

meerkat.getBroadcastActivities(broadcastId, function (err, activities) {
    console.log(err || activities);
});

meerkat.getBroadcastActivities(broadcastId).
	then(function (activities) {
		console.log(activities);
	}, function (err) {
		console.log(err);
	});

meerkat.getBroadcastRestreams(broadcastId, function (err, restreams) {
    console.log(err || restreams);
});

meerkat.getBroadcastRestreams(broadcastId).
	then(function (restreams) {
		console.log(restreams);
	}, function (err) {
		console.log(err);
	});

meerkat.getBroadcastComments(broadcastId, function (err, comments) {
    console.log(err || comments);
});

meerkat.getBroadcastComments(broadcastId).
	then(function (comments) {
		console.log(comments);
	}, function (err) {
		console.log(err);
	});

meerkat.getBroadcastLikes(broadcastId, function (err, likes) {
    console.log(err || likes);
});

meerkat.getBroadcastLikes(broadcastId).
	then(function (likes) {
		console.log(likes);
	}, function (err) {
		console.log(err);
	});

meerkat.getBroadcastWatchers(broadcastId, function (err, watchers) {
    console.log(err || watchers);
});

meerkat.getBroadcastWatchers(broadcastId).
	then(function (watchers) {
		console.log(watchers);
	}, function (err) {
		console.log(err);
	});


/**
 * User-specific requests.
 */
var userId = '54fb2e454d0000d23bb9c40f';

meerkat.getUserDetails(userId, function (err, userDetails) {
    console.log(err || userDetails);
});

meerkat.getUserDetails(userId).
	then(function (userDetails) {
		console.log(userDetails);
	}, function (err) {
		console.log(err);
	});


/**
 * Don't forget to clean up when exiting.
 */
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown () {

	// Don't accept any more requests. Finish handling the current requests.
	server.close(function () {
		meerkat.dispose();
	});
}
```
