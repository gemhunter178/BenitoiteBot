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
(do not touch if cooldown.js version is before v1.4) */
export const prefix = '!!';

// for reference, mod level -1 is bot_owner, 0 is everyone, 1 is mods only, 2 is broadcaster only
// format for functionn args (from _tmiChatBot.js) -> (client, channel, user, query, extra variable)
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
    cd: 1,
    mod: 1,
    desc: 'changes the cooldown of a command for the channel, in seconds. Example: \'' + prefix + 'cd ' + prefix + 'hello 10\''
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
    name: 'test',
    run: function(client, channel) {
      client.say(channel, 'object is working!');
    },
    cd: 1000,
    mod: -1,
    desc: 'a test command to test if this object file is working.'
  }
]