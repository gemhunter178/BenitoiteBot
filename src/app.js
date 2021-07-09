import tmi from 'tmi.js'
import fs from 'fs'
import { BOT_USERNAME , OAUTH_TOKEN, CHANNELS, BOT_MASTER } from './constants'

const client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: BOT_USERNAME,
		password: OAUTH_TOKEN
	},
	channels: CHANNELS
});

client.connect();

//setInterval(function(){client.say([insert channel name here], [message])},[time in ms]);

client.on('message', (channel, user, message, self) => {
	//mod only stuff
	let isMod = user.mod || user['user-type'] === 'mod';
	let isBroadcaster = channel.slice(1) === user.username;
	let isModUp = isMod || isBroadcaster;
	// Ignore echoed messages and ones that do not start with !.
	if(self) return;

	//commands past this must start with !
	if(!message.startsWith('!')) return;
	
	if(/^!timer\s+/i.test(message)){
		let query = message.replace(/^!timer\s+/,'');
		let timeMin = parseInt(query);
		let plural = ' minutes!';
		if (timeMin === 1) plural = ' minute!';
			
		client.say(channel, `Timer set for ` + timeMin + plural);
		console.log('timer set for ' + timeMin + ' minutes from now');
		setTimeout(function(){client.say(channel, `Timer alert!`)},timeMin * 60000);
		setTimeout(function(){client.say(channel, `Timer alert!`)},timeMin * 60000 + 1000);
		setTimeout(function(){client.say(channel, `Timer alert!`)},timeMin * 60000 + 2000);
	}

	if(message.toLowerCase() === '!hello') {
		// "@user, heya!"
		client.say(channel, `Heya, ` + user['display-name'] + `!`);
	}
	
	if(message.toLowerCase() === '!goodbye' && user.username === BOT_MASTER) {
		client.say(channel, `Alright, see you later!`);
	}

	if(message.toLowerCase() === '!logme') {
		//mostly for debug purposes
		client.say(channel, user['display-name'] + ` has been logged on console`);
		console.log(user);
		console.log(isModUp);
	}

	if(message.toLowerCase() === '!fish2') {
		//Changed a test of read/write to file to the new fish command
		const now = new Date();
		const YearMonth = now.getUTCFullYear().toString()+(now.getUTCMonth()+1).toString().padStart(2, '0');
		//console.log(YearMonth);
		const fishDataFile = './fishStats.json';
		let fishData;
		let change = false;
		try {
			const data = fs.readFileSync(fishDataFile);
			fishData = JSON.parse(data);
		} catch (err) {
			console.error(err);
		}
		let gaus = -5;
		while (gaus > 25 || gaus < -4.5) {
		  let u = 0;
		  let v = 0;
		  while (u === 0) u = Math.random();
		  while (v === 0) v = Math.random();
		  gaus = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
		  gaus = gaus * 2.5;
		}
		const fsh = 5 + gaus;
		const msg = ['Teeny fish! lycelGib ',
		  'Oh, I caught one lycelWhatif ',
		  'Okay lycelIdk ',
		  'Not bad! lycelYes ',
		  'Pretty good! lycelCool ',
		  'What a catch! lycelYay ',
		  "That's a big 'un lycelAAA ",
		  'Those are rare! lycelBlush ',
		  'lycelW lycelW lycelW '];
		let sz = 0;
		let fishoutput = ' ';
		if ((Math.random()) < 0.9) {
		  if (fsh > 20.0) {
			sz = 8;
		  } else if (fsh > 10.0) {
			sz = 7;
		  } else if (fsh > 7.5) {
			sz = 6;
		  } else if (fsh > 6.25) {
			sz = 5;
		  } else if (fsh > 5.25) {
			sz = 4;
		  } else if (fsh > 4.75) {
			sz = 3;
		  } else if (fsh > 3.75) {
			sz = 2;
		  } else if (fsh > 2.5) {
			sz = 1;
		  }
		  fishoutput = user["display-name"] + ' caught a fish of ' + fsh.toFixed(2) + 'kg! (' + (fsh * 2.20462).toFixed(2) + 'lbs) ' + msg[sz];
		if(/6[.]*9/.test(fishoutput)){
			fishoutput += " nice. ";
		}
			
		if(!fishData.hasOwnProperty(YearMonth)){
			fishData[YearMonth] = {maxUser: "", max: 0, minUser: "", min:50};
		}
		if(fishData[YearMonth].max < fsh){
			fishData[YearMonth].max = fsh;
			fishData[YearMonth].maxUser = user["display-name"];
			fishoutput += " - That's a new largest fish!";
			change = true;
		}
		if(fishData[YearMonth].min > fsh){
			fishData[YearMonth].min = fsh;
			fishData[YearMonth].minUser = user["display-name"];
			fishoutput += " - That's a new smallest fish!";
			change = true;
		}
		} else {
		  fishoutput = 'Oh no! The fish escaped!! lycelHands ';
		}
		
		client.say(channel, fishoutput);
		if(change){
			const dataToWrite = JSON.stringify(fishData);
			try {
				fs.writeFileSync(fishDataFile, dataToWrite);
			} catch (err) {
				console.err(err);
			}
		}
	}
	
	if(message.toLowerCase() === '!fishstats') {
		//just read fish stats and iutput the month's records
		const now = new Date();
		const YearMonth = now.getUTCFullYear().toString()+(now.getUTCMonth()+1).toString().padStart(2, '0');
		const fishDataFile = './fishStats.json';
		let fishData;
		try {
			const data = fs.readFileSync(fishDataFile);
			fishData = JSON.parse(data);
		} catch (err) {
			console.error(err);
		}
		//message to chat later
		let message = "";
		if(fishData.hasOwnProperty(YearMonth)){
			fishData = fishData[YearMonth]
			message = "The !fish records for this month: largest was " + fishData.maxUser + " with a fish of " + fishData.max.toFixed(2) + 'kg! (' + (fishData.max * 2.20462).toFixed(2) + "lbs) and the smallest was " + fishData.minUser + " with a fish of " + fishData.min.toFixed(2) + 'kg! (' + (fishData.min * 2.20462).toFixed(2) + "lbs)";
		} else {
			message = "The !fish records have not been set this month...";
		}
		client.say(channel, message);
		
	}
});