import { files } from './filePaths.js';
import { gFunc } from './_generalFunctions.js';

// in this case 'def' means default. list of all default commands and some data associated with them

/* [WARN] do not set to anything but '!!' if cooldown.js version is before v1.4 */
export const prefix = '!!';

/* - - - - - - - - - -
- for reference, mod level -1 is bot_owner, 0 is everyone, 1 is mods only, 2 is broadcaster only
- format for functionn args (from _tmiChatBot.js) -> (client, channel, user, query, extra variable) 
[WARN] Command cannot be named 'help' if you wish for it to be edited by cooldown commands.
[WARN] Command cannot be named 'all' as enable all has it reserved to enable/disable all commands
[WARN] query === 'help' is reserved for explaining the command. bypass by making desc: null
object variables: 
{
  name: [the name of the command, without the prefix]
  exVar: [the name of the extra variable needed from extraVar in _tmiChatBot.js]
  run: [function to run on activation of the command - if string, it will call the matching property in functionList on _tmiChatBot.js]
  cd: [default cooldown, in milliseconds if none specified, it will permenantly be enabled]
  cd_default: [boolean if the command should default be enabled or disabled]
  mod: [user level required to use comamnd, see above]
  desc: [description of the command when 'help' is used as a query]
}
- - - - - - - - - - */

export const defCommands = [
  {
    name: 'hello',
    run: function(client, channel, user) {
      // "Heya, user!"
      client.say(channel, `Heya, ` + user['display-name'] + `!`);
    },
    cd: 1000,
    cd_default: true,
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
    cd_default: false,
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
          commandmsg.push(prefix + commanditr);
        }
      }
      commandmsg = gFunc.formatPrintOptions(commandmsg, false);
      client.say(channel, 'the current enabled commands on this bot are: ' + commandmsg);
    },
    cd: 1000,
    cd_default: true,
    mod: 0,
    desc: 'lists all enabled commands on the channel (as long as within character limit)'
  },
  {
    name: 'cd',
    exVar: 'cooldown',
    run: 'CD_CHANGE',
    mod: 1,
    desc: 'changes the cooldown of a command for the channel, in seconds. Example: \'' + prefix + 'cd ' + prefix + 'hello 10\''
  },
  {
    name: 'disable',
    exVar: 'cdDisable',
    run: 'CD_ENABLE',
    mod: 1,
    desc: 'Disables a command for the channel. Example: \'' + prefix + 'disable ' + prefix + 'hello\''
  },
  {
    name: 'enable',
    exVar: 'cdEnable',
    run: 'CD_ENABLE',
    mod: 1,
    desc: 'Enables a command for the channel. Example: \'' + prefix + 'enable ' + prefix + 'hello\''
  },
  {
    name: 'timer',
    exVar: 'timerObject',
    run: 'ADD_TIMER',
    cd: 10000,
    cd_default: true,
    mod: 1,
    desc: 'adds a timer: \'' + prefix + 'timer [time in minutes] [message]\''
  },
  {
    name: 'deltimer',
    exVar: 'timerObject',
    run: 'DEL_TIMER',
    mod: 1,
    desc: 'deletes most recently added timer'
  },
  {
    name: 'convert',
    run: 'CONVERT',
    cd: 10000,
    cd_default: false,
    mod: 0,
    desc: null //convert already has it's own help function currently, might migrate here eventually
  },
  {
    name: 'define',
    exVar: 'wordsApiData',
    run: 'WORDSAPI_DEFINE',
    cd: 10000,
    cd_default: false,
    mod: 1,
    desc: 'returns a definition of the word, powered by WordsApi (#notspon)'
  },
  {
    name: 'fish',
    run: 'FISH',
    cd: 5000,
    cd_default: false,
    mod: 0,
    desc: 'The famous fish command that started the drive behind this bot.'
  },
  {
    name: 'fishstats',
    run: 'FISH_STATS',
    cd: 15000,
    cd_default: false,
    mod: 0,
    desc: 'Displays the current month\'s ' + prefix + 'fish records.'
  },
  {
    name: 'morse',
    run: 'MORSE',
    cd: 10000,
    cd_default: false,
    mod: 0,
    desc: 'Converts to/from morse. From morse requires the query to start with \'.\' \'-\' or \'_\' ...or if asking: help -> .... . .-.. .--'
  },
  {
    name: 'codeword',
    run: 'CODEWORDGAME',
    cd: 5000,
    cd_default: false,
    mod: 0,
    desc: 'Enter a query and try to find the codeword! example: codeword is "test" -> a query of "seat" would give 2 matching places (-e-t) and 1 other matching character (s)'
  },
  {
    name: 'trivia',
    exVar: 'saveChats',
    run: 'TRIVIA_COMMAND',
    cd: 1000,
    cd_default: false,
    mod: 1,
    desc: 'trivia, powered by Open Trivia Database! (#notspon) to play enter A | B | C | D for multiple choice or T | F for true false questions!'
  },
  {
    name: 'tone',
    run: 'TONE',
    cd: 10000,
    cd_default: false,
    mod: 0,
    desc: 'A tone indicator lookup based on toneindicators and tonetags on carrd co'
  },
  {
    name: 'purge',
    exVar: 'allowPurge',
    run: function (client, channel, user, query, allowPurge) {
      // purge means ban everyone in the provided list, bans happen 1.5 seconds apart and will only work if bot is modded
      // if the owner of this bot does !!allowPurge anywhere the bot is active, this command is allowed for 5 minutes.
      if(allowPurge.allow){
        //future implementaion of not using so many setTimeout objects?
        gFunc.readFilePromise('./data/ban_list.json', false).then( ban_list => {
          ban_list = JSON.parse(ban_list);
          let banEndNum = parseInt(query);
          if(!banEndNum){
            banEndNum = ban_list.length;
          }
          let i = 0;
          setInterval(function() {
            if (i === banEndNum){
              clearInterval(this);
            } else {
              client.say(channel, '/ban ' + ban_list[i]);
              i++;
            }
          }, 1500);
        }, error => {
          client.say(channel, 'no list found');
        });        
      } else {
        client.say(channel, 'requires asking the bot owner to enable for safety reasons');
      }
    },
    mod: 1,
    desc: 'bans all users on a predefined list. Requires asking the bot owner to enable'
  },
  {
    name: 'allowpurge',
    exVar: 'allowPurge',
    run: function(client, channel, user, query, allowPurge) {
      if (/(false)|(stop)/i.test(query)){
        client.say(channel, 'purge access revoked.')
        allowPurge.allow = false;
      } else {
        allowPurge.allow = true;
        client.say(channel, 'permission granted.')
        setTimeout(function() {
          console.log('purge permissions removed (if not yet already)');
          allowPurge.allow = false;
        }, 300000);
      }
    },
    mod: -1,
    desc: 'allows use of purge for 5 minutes. or use query \'false\' to end before 5 minutes'
  }
]