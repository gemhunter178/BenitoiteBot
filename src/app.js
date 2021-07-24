import tmi from 'tmi.js'
import fs from 'fs'
import { BOT_USERNAME , OAUTH_TOKEN, CHANNELS, OWNER } from './constants'
import { files } from './filePaths'
import { FISH , FISH_STATS } from './fishCommand'
import { CODEWORDGAME } from './codewordsGame'
import { MORSE } from './morseDecoder'

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  },
  channels: CHANNELS
});

let cooldown;
//read cooldown file has to be sync before everything else
try {
  const data = fs.readFileSync(files.cooldown);
  cooldown = JSON.parse(data);
} catch (err) {
  console.error(err);
  try {
    fs.writeFileSync(files.cooldown, '{}');
    console.log(files.cooldown + ' has been created');
    cooldown = {};
  } catch (err) {
    console.error(err);
  }
}
for (let i = 0; i < CHANNELS.length; i++){
  let channel = CHANNELS[i];
  //initialize cooldown object for channels that don't have one
  if (!cooldown.hasOwnProperty(channel)){
    //also a good list of all commands this currently has
    cooldown[channel] = {
      hello: [false, 1000],
      logme: [false, 1000],
      fish: [false, 5000],
      fishstats: [false, 15000],
      timer: [false, 30000],
      codeword: [false, 2000],
      morse: [false, 10000]
    };
  //debug
  //console.log(cooldown);
  }
}

function saveCooldownFile(data){
  data = JSON.stringify(data);
  fs.writeFile(files.cooldown, data, (err) => {
    if (err) console.log(err);
    else console.log('cooldown file updated');
  });
}

//save created config above
saveCooldownFile(cooldown);

function setCooldown(channel, command){
  cooldown[channel][command][0] = true;
  setTimeout(function(){cooldown[channel][command] = false;},cooldown[channel][command][1]);
}

client.connect();

//setInterval(function(){client.say('[channel]', `[message]`)},[time,ms]);

client.on('message', (channel, user, message, self) => {
  
  //messages that need to match only the first word
  let firstWord = message.split(' ')[0];
  //mod only stuff
  let isMod = user.mod || user['user-type'] === 'mod';
  let isBroadcaster = channel.slice(1) === user.username;
  let isModUp = isMod || isBroadcaster;
  // Ignore messages from self.
  if (self) return;

  //commands past this must start with !
  if (!message.startsWith('!')) return;

  if (message.toLowerCase() === '!!hello' && !cooldown[channel]['hello'][0]) {
    // "@user, heya!"
    setCooldown(channel, 'hello');
    client.say(channel, `Heya, ` + user['display-name'] + `!`);
  }
  
  if (message.toLowerCase() === '!!goodbye' && user.username === OWNER) {
    client.say(channel, `Alright, see you later!`);
    console.log('bot terminated by user');
    process.exit(0);
  }

  if (message.toLowerCase() === '!!logme' && !cooldown[channel]['logme'][0]) {
    //mostly for debug purposes
    setCooldown(channel, 'logme');
    client.say(channel, user['display-name'] + ` has been logged on console`);
    console.log(user);
    console.log(isModUp);
  }
  
  //the famous !fish commands
  if (firstWord.toLowerCase() === '!!fish' && !cooldown[channel]['fish'][0]) { 
    setCooldown(channel, 'fish'); 
    FISH(files.fishDataFiles, fs, user, channel, client);
  }
  
  if (firstWord.toLowerCase() === '!!fishstats' && !cooldown[channel]['fishstats'][0]) {
    setCooldown(channel, 'fishstats');
    FISH_STATS(files.fishDataFiles, fs, user, channel, client);
  }
  
  if (/^!!timer/i.test(firstWord) && isModUp && !cooldown[channel]['timer'][0]){
    setCooldown(channel, 'timer');
    let query = message.replace(/^!+timer[\s]*/,'');
    let timeMin = parseInt(query);
    if (timeMin === NaN || timeMin <= 0){
      timeMin = 10;
    }
    let plural = ' minutes';
    if (timeMin === 1) plural = ' minute';
    client.say(channel, `Timer set for ` + timeMin + plural + '!');
    console.log('timer set for ' + timeMin + plural + ' from now');
    setTimeout(function(){client.say(channel, `*TIMER END* This timer was set ` + timeMin + plural + ` ago!`)},timeMin * 60000);
  }
  
  //codewords
  if (/^!!codeword/i.test(firstWord) && !cooldown[channel]['codeword'][0]) {
    setCooldown(channel, 'codeword');
    CODEWORDGAME(files.codewordGameFile, fs, user, channel, client, message);
  }
  
  //morse code
  if (/^!!morse/i.test(firstWord) && !cooldown[channel]['morse'][0]){ 
    setCooldown(channel, 'morse');
    let query = message.replace(/^!+morse[\s]*/,'');
    MORSE(user, channel, client, query);
  }
});