var https = require('https');
var url = require('url');


/**
 * A client wrapper for the Meerkat API.
 *
 * @param {string} apiToken Meerkat API token.
 * @param {boolean=} opt_writeToLog Whether to log various events. Default: true.
 * @constructor
 */
var Meerkat = module.exports = function (apiToken, opt_writeToLog) {

    /**
     * Meerkat API token.
     *
     * @type {string}
     * @private
     */
    this.apiToken_ = apiToken;

    /**
     * Whether to log various events.
     *
     * @type {boolean}
     * @private
     */
    this.writeToLog_ = (opt_writeToLog === undefined ? true : !!opt_writeToLog);

    /**
     * The number of retries so far when attempting to get the routing map.
     *
     * @type {number}
     * @private
     */
    this.routingMapRetries_ = 0;

    /**
     * The setTimeout handle returned when scheduling the next attempt to get the routing map.
     *
     * @private
     */
    this.timeoutHandle_;

    // Get the routing map for the first time.
    this.refreshRoutingMap_();
};


/**
 * Clean up and release memory when shutting down.
 *
 */
Meerkat.prototype.dispose = function () {

    clearTimeout(this.timeoutHandle_);

    /**
     * @type {boolean}
     * @private
     */
    this.isDisposed_ = true;
};


/**
 * Request the list of broadcasts.
 *
 * @param {!function(Error, Object)} callback A function that will be called when the operation
 *      completes.
 */
Meerkat.prototype.getAllBroadcasts = function (callback) {

    var targetUrl = Meerkat.RoutingMap.liveNow;

    this.issueGetRequest_('ALL_BROADCASTS', targetUrl, function (err, response, data) {
        callback.call(null, err, data);
    });
};


/**
 * Request the list of scheduled broadcasts.
 *
 * @param {!function(Error, Object)} callback A function that will be called when the operation
 *      completes.
 */
Meerkat.prototype.getScheduledBroadcasts = function (callback) {

    var targetUrl = Meerkat.RoutingMap.scheduledStreams;

    this.issueGetRequest_('SCHEDULED_BROADCASTS', targetUrl, function (err, response, data) {
        callback.call(null, err, data);
    });
};


/**
 * Request the summary for a specific broadcast.
 *
 * @param {string} broadcastId
 * @param {!function(Error, Object)} callback A function that will be called when the operation
 *      completes.
 */
Meerkat.prototype.getBroadcastSummary = function (broadcastId, callback) {

    var urlTemplate = Meerkat.RoutingMap.streamSummaryTemplate;
    var targetUrl = urlTemplate.replace('{broadcastId}', broadcastId);

    this.issueGetRequest_('BROADCAST_SUMMARY', targetUrl, function (err, response, data) {
        callback.call(null, err, data);
    });
};


/**
 * Request the activities for a specific broadcast.
 *
 * @param {string} broadcastId
 * @param {!function(Error, Object)} callback A function that will be called when the operation
 *      completes.
 */
Meerkat.prototype.getBroadcastActivities = function (broadcastId, callback) {

    var urlTemplate = Meerkat.RoutingMap.broadcastActivities;
    var targetUrl = urlTemplate.replace('{broadcastId}', broadcastId);

    this.issueGetRequest_('BROADCAST_ACTIVITIES', targetUrl, function (err, response, data) {
        callback.call(null, err, data);
    });
};


/**
 * Request the restreams for a specific broadcast.
 *
 * @param {string} broadcastId
 * @param {!function(Error, Object)} callback A function that will be called when the operation
 *      completes.
 */
Meerkat.prototype.getBroadcastRestreams = function (broadcastId, callback) {

    var urlTemplate = Meerkat.RoutingMap.broadcastRestreams;
    var targetUrl = urlTemplate.replace('{broadcastId}', broadcastId);

    this.issueGetRequest_('BROADCAST_RESTREAMS', targetUrl, function (err, response, data) {
        callback.call(null, err, data);
    });
};


/**
 * Request the comments for a specific broadcast.
 *
 * @param {string} broadcastId
 * @param {!function(Error, Object)} callback A function that will be called when the operation
 *      completes.
 */
Meerkat.prototype.getBroadcastComments = function (broadcastId, callback) {

    var urlTemplate = Meerkat.RoutingMap.broadcastComments;
    var targetUrl = urlTemplate.replace('{broadcastId}', broadcastId);

    this.issueGetRequest_('BROADCAST_COMMENTS', targetUrl, function (err, response, data) {
        callback.call(null, err, data);
    });
};


/**
 * Request the likes for a specific broadcast.
 *
 * @param {string} broadcastId
 * @param {!function(Error, Object)} callback A function that will be called when the operation
 *      completes.
 */
Meerkat.prototype.getBroadcastLikes = function (broadcastId, callback) {

    var urlTemplate = Meerkat.RoutingMap.broadcastLikes;
    var targetUrl = urlTemplate.replace('{broadcastId}', broadcastId);

    this.issueGetRequest_('BROADCAST_LIKES', targetUrl, function (err, response, data) {
        callback.call(null, err, data);
    });
};


/**
 * Request the watchers for a specific broadcast.
 *
 * @param {string} broadcastId
 * @param {!function(Error, Object)} callback A function that will be called when the operation
 *      completes.
 */
Meerkat.prototype.getBroadcastWatchers = function (broadcastId, callback) {

    var urlTemplate = Meerkat.RoutingMap.broadcastWatchers;
    var targetUrl = urlTemplate.replace('{broadcastId}', broadcastId);

    this.issueGetRequest_('BROADCAST_WATCHERS', targetUrl, function (err, response, data) {
        callback.call(null, err, data);
    });
};


/**
 * Request the activities for a specific broadcast.
 *
 * @param {string} userId
 * @param {!function(Error, Object)} callback A function that will be called when the operation
 *      completes.
 */
Meerkat.prototype.getUserDetails = function (userId, callback) {

    var urlTemplate = Meerkat.RoutingMap.profile;
    var targetUrl = urlTemplate.replace('{userId}', broadcastId);

    this.issueGetRequest_('USER_DETAILS', targetUrl, function (err, response, data) {
        callback.call(null, err, data);
    });
};


/**
 * Update the endpoint templates we should be using for the various services. This is called
 * periodically when specified by Meerkat.
 *
 * @private
 */
Meerkat.prototype.refreshRoutingMap_ = function () {

    var routesUrl = Meerkat.RoutingMap.routes;

    this.issueGetRequest_('ROUTES', routesUrl, function (err, response, data) {

        if (!err) {
            if (typeof data === 'object') {
                // Replace only routes we support.
                for (var p in Meerkat.RoutingMap) {
                    if (data[p]) {
                        Meerkat.RoutingMap[p] = data[p];
                    }
                }
            }
            this.logInfo_('ROUTES updated:', Meerkat.RoutingMap, '\n');

            // The routing map has been successfully updated. Determine when we need to refresh
            // the info and schedule it (unless the client was disposed while waiting for the
            // response.)
            if (!this.isDisposed_) {
                var interval = this.getCacheControlMaxAge_(response);
                this.scheduleRefreshRoutingMap_(interval);
            }

        } else {

            if (!this.isDisposed_) {
                this.scheduleRefreshRoutingMap_();
            }
        }
    });
};


/**
 * Issue an HTTPS GET request to a Meerkat API endpoint.
 *
 * @param {string} endpointName The name of the endpoint. Used in log messages.
 * @param {string} targetUrl The url of the endpoint, with any variables already baked in.
 * @param {!function (this:Meerkat, Error, http.IncomingMessage, string)}
 * @private
 */
Meerkat.prototype.issueGetRequest_ = function (endpointName, targetUrl, callback) {

    var options = this.prepareRequestOptions_(targetUrl);

    // Prepare the request, and define how to handle it.
    this.logInfo_(endpointName, 'Issuing request ...');
    var self = this;
    var req = https.request(options, function (response) {

        self.logInfo_(endpointName, 'Response received. Status:', response.statusCode,
            response.statusMessage);

        // Accumulate the data as it comes in.
        var data = '';
        response.on('data', function (chunk) {
            data += chunk;
        });

        // When the data has all arrived, issue the callback.
        response.on('end', function () {
            if (response.statusCode >= 200 && response.statusCode < 300) {

                // Try to parse the JSON data.
                var error = null;
                try {
                    data = JSON.parse(data);
                    self.logInfo_(endpointName, 'Received:\n', data, '\n');
                } catch (e) {
                    error = e;
                    self.logError_(endpointName, 'JSON parse error:', e, '\n', data, '\n');
                }

                callback.call(self, error, response, data);

            } else {

                self.logError_(endpointName, 'Error:', err, '\n', data, '\n');
                var err = new Error('' + response.statusCode + ' ' + response.statusMessage);
                callback.call(self, err, response, data);
            }
        });
    });

    // If an error occurs, issue the callback.
    req.on('error', function (err) {
        self.logError_(endpointName, 'Error:', err, '\n');
        callback.call(self, err, null, null);
    });

    // Issue the request.
    req.end();
};


/**
 * Prepare the request object needed for issuing an HTTP request.
 *
 * @param {string} targetUrl The url of the endpoint, with any variables already baked in.
 * @return {!Object}
 * @private
 */
Meerkat.prototype.prepareRequestOptions_ = function (targetUrl) {

    // Add the version query params.
    var versionSuffix = Meerkat.API_VERSION_QUERY_NAME + '=' + Meerkat.API_VERSION;
    targetUrl += (targetUrl.indexOf('?') === -1 ? '?' : '&') + versionSuffix;

    // Parse the url.
    var options = url.parse(targetUrl, false, true);


    options.method = 'GET';
    options.headers = {'Authorization': this.apiToken_};

    return options;
};


/**
 * Read the max-age value from the Cache-Control header, and schedule a refresh of the endpoint
 * information after the specified interval.
 *
 * @param {!http.IncomingMessage} response The HTTP response object.
 * @return {number} The interval after which we should request a refresh.
 * @private
 */
Meerkat.prototype.getCacheControlMaxAge_ = function (response) {

    try {

        var headerValue = response.headers['cache-control'];
        var cacheControl = this.parseCacheControlHeaderValue_(headerValue);
        var maxAge = cacheControl['max-age'];

        if (maxAge) {
            // Keep the value inside our limits.
            return Math.min(Math.max(parseInt(maxAge), Meerkat.MIN_REFRESH_INTERVAL),
                Meerkat.MAX_REFRESH_INTERVAL);
        }

    } catch (e) {
        this.logError_('ROUTES Cache-control header parsing error:', e, '\n');
    }

    return Meerkat.DEFAULT_REFRESH_INTERVAL;
};


/**
 * Parse HTTP Cache-Control header into an object containing property/value pairs.
 *
 * @param {string} headerValue
 * @return {!Object}
 * @private
 */
Meerkat.prototype.parseCacheControlHeaderValue_ = function (headerValue) {

    var parsedValues = {};

    if (headerValue) {
        var segments = headerValue.split(',');
        for (var i = 0; i < segments.length; i++) {
            if (segments[i].indexOf('=') !== -1) {
                var subSegments = segments[i].split('=');
                parsedValues[subSegments[0].trim()] = subSegments[1].trim();
            } else {
                parsedValues[segments[i].trim()] = null;
            }
        }
    }

    return parsedValues;
};


/**
 * In order to keep the list of endpoints up to date, we have to check periodically with Meerkat.
 * Schedules a call for a specified number of milliseconds in the future.
 *
 * @param {number=} opt_interval In milliseconds. If omitted, this is assumed to be a retry, which
 *      uses an automatically doubling interval.
 * @private
 */
Meerkat.prototype.scheduleRefreshRoutingMap_ = function (opt_interval) {

    if (!opt_interval) {

        // No specified interval -- the call being scheduled is a retry.
        opt_interval = 1000 *
            Math.min(Math.pow(2, this.routingMapRetries_), Meerkat.MAX_REFRESH_INTERVAL);
        this.routingMapRetries_++;

        this.logInfo_('ROUTES Will schedule a retry in ' + opt_interval + ' milliseconds.');

    } else {

        // An interval was specified, i.e. this is not a retry, so reset the count.
        this.routingMapRetries_ = 0;

        this.logInfo_('ROUTES Will schedule next refresh in ' + opt_interval + ' milliseconds.');
    }

    this.timeoutHandle_ = setTimeout(this.refreshRoutingMap_.bind(this), opt_interval);
};


/**
 * Write to the log if so configured.
 *
 * @param {...*} var_args
 * @private
 */
Meerkat.prototype.logInfo_ = function (var_args) {

    this.log_('log', arguments);
};


/**
 * Write to the error log if so configured.
 *
 * @param {...*} var_args
 * @private
 */
Meerkat.prototype.logError_ = function (var_args) {

    this.log_('error', arguments);
};


/**
 * Write to the error log if so configured. This should not be called directly - use logInfo_ or
 * logError_.
 *
 * @param {string} verb The name of a console method to use.
 * @param {!ArrayLike} args The array-like value of 'arguments' of the calling function.
 * @private
 */
Meerkat.prototype.log_ = function (verb, args) {

    if (this.writeToLog_) {

        // Convert the array-like args into a real array.
        args = Array.prototype.slice.apply(args);

        // Prefix the entry with our standard prefix.
        args.unshift(Meerkat.LOG_PREFIX);

        // Use console.log if the verb is not supported.
        var consoleMethod = console[verb];
        if (typeof consoleMethod !== 'function') {
            consoleMethod = console.log;
        }

        consoleMethod.apply(console, args);
    }
};


/**
 * Default route mapping.
 *
 * @enum {string}
 */
Meerkat.RoutingMap = {
    routes: 'https://api.meerkatapp.co/routes',
    liveNow: 'https://resources.meerkatapp.co/broadcasts',
    scheduledStreams: 'https://resources.meerkatapp.co/schedules',
    streamSummaryTemplate: 'https://resources.meerkatapp.co/broadcasts/{broadcastId}/summary',
    broadcastActivities: 'https://resources.meerkatapp.co/broadcasts/{broadcastId}/activities',
    broadcastRestreams: 'https://channels.meerkatapp.co/broadcasts/{broadcastId}/restreams',
    broadcastWatchers: 'https://resources.meerkatapp.co/broadcasts/{broadcastId}/watchers',
    broadcastLikes: 'https://channels.meerkatapp.co/broadcasts/{broadcastId}/likes',
    broadcastComments: 'https://channels.meerkatapp.co/broadcasts/{broadcastId}/comments',
    profile: 'https://resources.meerkatapp.co/users/{userId}/profile'
};


/**
 * The Meerkat API version we support.
 *
 * @const {string}
 */
Meerkat.API_VERSION = '1.0';


/**
 * The name of the version parameter that needs to be appended to Meerkat API requests.
 *
 * @const {string}
 */
Meerkat.API_VERSION_QUERY_NAME = 'v';


/**
 * The minimum time in milliseconds to wait before attempting to refresh the endpoints information.
 * Anything less than an hour is almost certainly a mistake.
 *
 * @const {number}
 */
Meerkat.MIN_REFRESH_INTERVAL = 3600000; // 1 hour.


/**
 * The maximum time in milliseconds to wait before attempting to refresh the endpoints information.
 *
 * @const {number}
 */
Meerkat.MAX_REFRESH_INTERVAL = 86400000; // 1 day.


/**
 * The default time in milliseconds to wait before attempting to refresh the endpoints information.
 *
 * @const {number}
 */
Meerkat.DEFAULT_REFRESH_INTERVAL = Meerkat.MAX_REFRESH_INTERVAL;


/**
 * All log entries are prefixed with this.
 *
 * @const {string}
 */
Meerkat.LOG_PREFIX = 'Meerkat:';
