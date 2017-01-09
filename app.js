const express = require('express');
const app = express();
const http = require('http');
const querystring = require('querystring');
const nest = require('unofficial-nest-api');
const sonos = require('sonos');

const USERNAME = process.argv[2];
const PASSWORD = process.argv[3];

const PORT = process.env.NODE_PORT;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/nest', (req, res) => {
    nest.login(USERNAME, PASSWORD, (err, data) => {
        if (err) {
	    console.log(err.message);
	    process.exit(1);
	    return;
	}

	console.log('Logged in.');

	nest.fetchStatus((data) => {
	    const ids = nest.getDeviceIds();
	    console.log(ids[0]);
	    subscribe();

	    nest.setTemperature(ids[0], 73);
	    res.send(ids[0]);
	});
    });
});

const subscribe = () => {
    nest.subscribe(subscribeDone);
};

const subscribeDone = (deviceId, data) => {
    if (deviceId) {
	console.log(JSON.stringify(data));
    }

    setTimeout(subscribe, 2000);
};

const songUrl = 'http://media2.ldscdn.org/assets/music/childrens-songbook/2002-01-1820-daddys-homecoming-words-and-music-192k-eng.mp3'

app.post('/sonos', (req, res) => {
    sonos.search((device) => {
	device.stop(() => {
    	    device.queueNext(songUrl, (err, playing) => {
	        if (err) {
	    	    console.log('error', err);
		    res.send('failed');
	        }

		device.setVolume(70, (err, data) => {
		    if (err) { console.log(err); }
		    console.log('volume set', data);
		    device.play(() => {
		        res.send('worked');
		    });

		});
	    });
	});
    });
});

const momUrl = 'http://media2.ldscdn.org/assets/music/childrens-songbook/2002-01-1790-mother-i-love-you-words-and-music-192k-eng.mp3';

app.post('/momishome', (req, res) => {
    sonos.search(device => {
        device.stop(() => {
	    device.queueNext(momUrl, (err, data) => {
	        if (err) {
		    console.log('error', err);
		    res.send('failed');
		}

		device.setVolume(70, (err, data) => {
		    if (err) console.log(err);
		    device.play(() => {
		        res.send('mom is home!');
		    });
		});
	    });
	});
    });
});

app.listen(PORT || 3000, () => {
    console.log('Example app listening on port 3000!');
});
