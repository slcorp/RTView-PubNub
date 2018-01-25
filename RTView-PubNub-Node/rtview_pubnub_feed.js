// *********************************************************
// RTView - PubNub Sample Program

const PubNub = require("pubnub");
const util = require("util");
const request = require("request");

var rtview_utils = require('./rtview_utils.js');
rtview_utils.set_targeturl('http://localhost:3275');            // this is the default
//rtview_utils.set_targeturl('http://localhost:3270/rtvpost');  // to use servlet instead of port

// Name of the RTView caches created in this demo
var cacheName1 = 'PubNubMarketData';
var cacheName2 = 'PubNubWeatherData';
var cacheName3 = 'PubNubSensorData';

var debug = true;

//***************************************************************

console.log('-----------------------------------------------------------------------');
console.log('Subscribing to market updates: ');

//start listening for market updates

pubnub1 = new PubNub({
	subscribeKey : 'sub-c-4377ab04-f100-11e3-bffd-02ee2ddab7fe'
})

pubnub1.addListener({
    message: function(message) {
	var msg = message.message;
	msg.time_stamp = msg.timestamp*1000;
	if (debug) console.log(msg);
	if (debug) console.log('... sending: ' + JSON.stringify(msg));
	rtview_utils.send_datatable(cacheName1, msg);
    },
    presence: function(presenceEvent) {
	// handle presence
	console.log("\nPresence!!", presenceEvent);
    }
}) 


pubnub1.subscribe({
	channels: ['pubnub-market-orders'] 
});

// Specific cache definition for sample data table
// Note: This is only called once on startup. 
// If data server is not running, cache will not be created correctly.

rtview_utils.create_datacache(cacheName1,
{   // cache properties
    "indexColumnNames": "symbol;trade_type",
    "historyColumnNames": "order_quantity;bid_price"
},[ // column metadata
    { "time_stamp": "date" },
    { "symbol": "string" },
    { "trade_type": "string" },
    { "order_quantity": "int" },
    { "bid_price": "double" }
]);

//***************************************************************
console.log('-----------------------------------------------------------------------');
console.log('Subscribing to weather feed: ');

pubnub2 = new PubNub({
    subscribeKey : 'sub-c-b1cadece-f0fa-11e3-928e-02ee2ddab7fe'
})

pubnub2.addListener({
    message: function(message) {
    	var msg = message.message;
    	msg.temp_fahrenheit = parseFloat(msg.temp_fahrenheit);
    	msg.ultraviolet_level = parseFloat(msg.ultraviolet_level);
    	msg.wind_direction = parseFloat(msg.wind_direction);
    	if (debug) console.log(msg);
	rtview_utils.send_datatable(cacheName2, msg);
    }
}) 

pubnub2.subscribe({
    channels: ['pubnub-weather'] 
});

// Specific cache definition for sample data table
// Note: This is only called once on startup. 
// If data server is not running, cache will not be created correctly.

rtview_utils.create_datacache(cacheName2,
{   // cache properties
    "indexColumnNames": "location;weather_station",
    "historyColumnNames": "weather;ultraviolet_level;temp_fahrenheit;wind_direction;elevation;latitude;longitude"
},[ // column metadata
    { "location": "string" },
    { "weather_station": "string" },
    { "weather": "string" },
    { "ultraviolet_level": "double" },
    { "temp_fahrenheit": "double" },
    { "wind_direction": "double" },
    { "elevation": "string" },
    { "latitude": "string" },
    { "longitude": "string" }
]);

//***************************************************************
console.log('-----------------------------------------------------------------------');
console.log('Subscribing to pubnub sensor network: ');

pubnub3 = new PubNub({
    subscribeKey : 'sub-c-5f1b7c8e-fbee-11e3-aa40-02ee2ddab7fe'
})

// pubnub sensor demo assigns large random numbers to sensor uuid, so they dont repeat. 
// Assign a new uuid so that we can accumulate history for sensor.
var uuid_cntr = 0;

pubnub3.addListener({
    message: function(message) {
    	var msg = message.message;
	msg.time_stamp = msg.timestamp*1000;
	msg.ambient_temperature = parseFloat(msg.ambient_temperature);
	msg.humidity = parseFloat(msg.humidity);
	msg.photosensor = parseFloat(msg.photosensor);
	msg.radiation_level = parseFloat(msg.radiation_level);
	msg.sensor_uuid = "probe-"+pad(uuid_cntr++,4);
	if (uuid_cntr > 50) uuid_cntr = 0;
	if (debug) console.log(msg);
	rtview_utils.send_datatable(cacheName3, msg);
    }
}) 

pubnub3.subscribe({
    channels: ['pubnub-sensor-network'] 
});

// Specific cache definition for sample data table
// Note: This is only called once on startup. 
// If data server is not running, cache will not be created correctly.

rtview_utils.create_datacache(cacheName3,
{   // cache properties
    "indexColumnNames": "sensor_uuid",
    "historyColumnNames": "ambient_temperature;humidity;photosensor;radiation_level;"
},[ // column metadata
    { "time_stamp": "date" },
    { "sensor_uuid": "string" },
    { "ambient_temperature": "double" },
    { "humidity": "double" },
    { "photosensor": "double" },
    { "radiation_level": "double" }
]);

//***************************************************************
console.log('-----------------------------------------------------------------------');
// the pubnub demos stop sending data after a few minutes, so re-subscribe to
// establish a new 'presense' and resume data flow.
setInterval( function() {
	console.log('reSubscribing to pubnub-market-orders channel: ');
	pubnub1.unsubscribe({
		channels: ['pubnub-market-orders'] 
	});
	pubnub1.unsubscribe({
		channels: ['pubnub-weather'] 
	});
	pubnub1.unsubscribe({
		channels: ['pubnub-sensor-network'] 
	});
	
	pubnub1.subscribe({
		channels: ['pubnub-market-orders'] 
	});
	pubnub1.subscribe({
		channels: ['pubnub-weather'] 
	});
	pubnub1.subscribe({
		channels: ['pubnub-sensor-network'] 
	});

}, 120000);

//----------------------------------------------------------------------
// Utilities
//
function pad(n, len) {
    s = n.toString();
    if (s.length < len) {
        s = ('0000000000' + s).slice(-len);
    }

    return s;
}

