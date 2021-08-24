import { files } from './filePaths';
import { OWNER, API_KEYS } from './constants';
import { gFunc } from './_generalFunctions';
import { Cooldown } from './cooldown';
import { FISH , FISH_STATS } from './fishCommand';
import { CODEWORDGAME } from './codewordsGame';
import { MORSE } from './morseDecoder';
import { CONVERT } from './convert';
import { InternetLang } from './ILang';
import { WordsApi } from './wordsAPI';
import { Trivia } from './triviaCommands';
import { Timer } from './timer';

// in this case 'def' means default. list of all deafult commands and some data associated with them

/* COOLDOWN FILE NOT SET UP TO CHANGE PREFIX CURRENTLY 
(do not set to anything but '!!' if cooldown.js version is before v1.4) */
export const prefix = '!!';

/* - - - - - - - - - -
- for reference, mod level -1 is bot_owner, 0 is everyone, 1 is mods only, 2 is broadcaster only
- format for functionn args (from _tmiChatBot.js) -> (client, channel, user, query, extra variable) 
!! Command cannot be named 'help' if you wish for it to be edited by cooldown commands.
!! query === 'help' is reserved for explaining the command. bypass by making desc: null
- - - - - - - - - - */

export const defCommands = [
  {
    name: 'hello',
    run: function(client, channel, user) {
      // "@user, heya!"
      client.say(channel, `Heya, ` + user['display-name'] + `!`);
    },
    cd: 1000,
    mod: 0,
    desc: 'default command, sort of a !ping. Bot says hi to you'
  },
  {
    name: 'logme',
    run: function(client, channel, user) {
      // mostly for debug purposes
      client.say(channel, user['display-name'] + ` has been logged on console`);
      console.log(user);
    },
    cd: 10000,
    mod: 0,
    desc: 'displays contents of user object on console. Mostly for debugging purposes',
  },
  {
    name: 'goodbye',
    exVar: 'cooldown',
    run: function(client, channel, user, query, cooldown) {
      const writeCooldown = JSON.stringify(cooldown);
      gFunc.writeFilePromise(files.cooldown, writeCooldown).then( pass => {
        client.say(channel, `Alright, see you later!`);
        console.log('bot terminated by ' + user['display-name']);
        process.exit(0);
      }, error => {
        client.say(channel, 'error in writing cooldown file before stopping bot');
      });
    },
    mod: -1,
    desc: 'shuts off the bot',
  },
  {
    name: 'commands',
    exVar: 'cooldown',
    run: function(client, channel, user, query, cooldown) {
      let commandmsg = [];
      for (const commanditr in cooldown[channel]) {
        if (cooldown[channel][commanditr][0] > 0) {
          commandmsg.push(commanditr);
        }
      }
      commandmsg = gFunc.formatPrintOptions(commandmsg, false);
      client.say(channel, 'the current enabled commands on this bot are: ' + commandmsg);
    },
    cd: 1000,
    mod: 0,
    desc: 'lists all enabled commands on the channel (as long as within character limit)'
  },
  {
    name: 'cd',
    exVar: 'cooldown',
    run: Cooldown.changeCooldown,
    mod: 1,
    desc: 'changes the cooldown of a command for the channel, in seconds. Example: \'' + prefix + 'cd ' + prefix + 'hello 10\''
  },
  {
    name: 'disable',
    exVar: 'cdDisable',
    run: Cooldown.enable,
    mod: 1,
    desc: 'Disables a command for the channel. Example: \'' + prefix + 'disable ' + prefix + 'hello\''
  },
  {
    name: 'enable',
    exVar: 'cdEnable',
    run: Cooldown.enable,
    mod: 1,
    desc: 'Enables a command for the channel. Example: \'' + prefix + 'enable ' + prefix + 'hello\''
  },
  {
    name: 'timer',
    exVar: 'timerObject',
    run: Timer.addTimer,
    mod: 1,
    desc: 'adds a timer: \'' + prefix + 'timer [time in minutes] [message]\''
  },
  {
    name: 'deltimer',
    exVar: 'timerObject',
    run: Timer.delLastTimer,
    mod: 1,
    desc: 'deletes most recently added timer'
  },
  {
    name: 'convert',
    run: CONVERT,
    cd: 10000,
    mod: 0,
    desc: null //convert already has it's own help function currently, might migrate here eventually
  },
  {
    name: 'define',
    exVar: 'wordsApiData',
    run: function(client, channel, user, query, wordsApiData) {
      if (API_KEYS['x-rapidapi-key']) {
        WordsApi.runCommand(client, channel, user, query, wordsApiData);
      } else {
        client.say(channel, '!!words requires an API key for wordsAPI (#notspon) to function');
      }
    },
    cd: 10000,
    mod: 1,
    desc: 'returns a definition of the word, powered by WordsApi (#notspon)'
  },
  {
    name: 'fish',
    run: FISH,
    cd: 5000,
    mod: 0,
    desc: 'The famous fish command that started the drive behind this bot.'
  },
  {
    name: 'fishstats',
    run: FISH_STATS,
    cd: 15000,
    mod: 0,
    desc: 'Displays the current month\'s ' + prefix + 'fish records.'
  },
  {
    name: 'morse',
    run: MORSE,
    cd: 10000,
    mod: 0,
    desc: 'Converts to/from morse. From morse requires the query to start with \'.\' \'-\' or \'_\' ...or if asking: help -> .... . .-.. .--'
  },
  {
    name: 'codeword',
    run: CODEWORDGAME,
    cd: 5000,
    mod: 0,
    desc: 'Enter a query and try to find the codeword! example: codeword is "test" -> a query of "seat" would give 2 matching places (-e-t) and 1 other matching character (s)'
  },
  {
    name: 'trivia',
    exVar: 'saveChats',
    run: Trivia.useCommand,
    cd: 1000,
    mod: 1,
    desc: 'trivia, powered by Open Trivia Database! (#notspon) to play enter A | B | C | D for multiple choice or T | F for true false questions!'
  },
  {
    name: 'tone',
    run: InternetLang.searchToneInd,
    cd: 10000,
    mod: 0,
    desc: 'A tone indicator lookup based on toneindicators and tonetags on carrd co'
  },
  {
    name: 'purge',
    run: function (client, channel) {
      // purge means ban everyone in the provided list, bans happen 1.5 seconds apart and will only work if bot is modded
      // change false -> true if you want this command to be available.
      if(false){
        //future implementaion of not using so many setTimeout objects?
        gFunc.readFilePromise('./data/ban_list.json', false).then( ban_list => {
          ban_list = JSON.parse(ban_list);
          for (let i = 0; i < ban_list.length; i++) {
            setTimeout( function() { client.say(channel, '/ban ' + ban_list[i]);}, 1500*i);
          }
        }, error => {
          client.say(channel, 'no list found');
        });        
      } else {
        client.say(channel, 'requires editing from the bot owner to enable for safety reasons');
      }
    },
    mod: 1,
    desc: 'bans all users on a predefined list. Requires asking the bot owner to enable'
  },
  {
    name: 'test',
    run: function(client, channel) {
      client.say(channel, 'object is working!');
    },
    mod: -1,
    desc: 'a test command to test if this object file is working.'
  }
]