import tmi from 'tmi.js'
import fs from 'fs'
import { BOT_USERNAME , OAUTH_TOKEN, CHANNELS, BOT_MASTER } from './constants'
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

client.connect();

//words: https://www.randomlists.com/data/words.json
//setInterval(function(){client.say('[channel]', `[message]`)},[time,ms]);

client.on('message', (channel, user, message, self) => {
  //messages that need to match only the first word
  let firstWord = message.split(' ')[0];
  //mod only stuff
  let isMod = user.mod || user['user-type'] === 'mod';
  let isBroadcaster = channel.slice(1) === user.username;
  let isModUp = isMod || isBroadcaster;
  // Ignore echoed messages and ones that do not start with !.
  if (self) return;

  //commands past this must start with !
  if (!message.startsWith('!')) return;

  if (message.toLowerCase() === '!!hello') {
    // "@user, heya!"
    client.say(channel, `Heya, ` + user['display-name'] + `!`);
  }
  
  if (message.toLowerCase() === '!!goodbye' && user.username === BOT_MASTER) {
    client.say(channel, `Alright, see you later!`);
    console.log('bot terminated by user');
    process.exit(0);
  }

  if (message.toLowerCase() === '!!logme') {
    //mostly for debug purposes
    client.say(channel, user['display-name'] + ` has been logged on console`);
    console.log(user);
    console.log(isModUp);
  }
  
  //the famous !fish commands
  if (firstWord.toLowerCase() === '!!fish') FISH(files.fishDataFiles, fs, user, channel, client);
  
  if (firstWord.toLowerCase() === '!!fishstats') FISH_STATS(files.fishDataFiles, fs, user, channel, client);
  
  if (/^!!timer/i.test(firstWord) && isModUp){
    let query = message.replace(/^!+timer[\s]*/,'');
    let timeMin = parseInt(query);
    if (timeMin === NaN){
      timeMin = 10;
    }
    let plural = ' minutes!';
    if (timeMin === 1) plural = ' minute!';
    client.say(channel, `Timer set for ` + timeMin + plural);
    console.log('timer set for ' + timeMin + ' minutes from now');
    setTimeout(function(){client.say(channel, `Timer alert!`)},timeMin * 60000);
    setTimeout(function(){client.say(channel, `Timer alert!`)},timeMin * 60000 + 1000);
    setTimeout(function(){client.say(channel, `Timer alert!`)},timeMin * 60000 + 2000);
  }
  
  //codewords
  if (/^!!codeword/i.test(firstWord)) CODEWORDGAME(files.codewordGameFile, fs, user, channel, client, message);
  
  //morse code
  if (/^!!morse/i.test(firstWord)){ 
    let query = message.replace(/^!+morse[\s]*/,'');
    MORSE(user, channel, client, query);
  }
});