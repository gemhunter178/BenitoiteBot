import { files } from './filePaths.js';

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
    name: 'botinfo',
    run: function(client, channel, user) {
      client.say(channel, 'bot code originally made by gemhunter178, running off of nodejs: tmijs, twurple as well as some other libraries'); //tmi.js is missing period due to twitch reading it as a link
    },
    cd: 10000,
    cd_default: true,
    mod: 0,
    desc: 'just some general info on the bot'
  },
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
    run: 'STOP', //function mmoved to _tmiChatBot.js for this file to be compatible with web
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
      commandmsg = commandmsg.join(', ');
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
    exVar: 'datamuseData',
    run: 'DATAMUSE_DEFINE',
    cd: 5000,
    cd_default: false,
    mod: 1,
    desc: 'returns a definition of the word, powered by datamuse running off WordNet (#notspon). can accept parts of speech after a slash: \'/verb\'. To get the definition to \'help\', try \'helpp\' (avoids this response)'
  },
  {
    name: 'rhyme',
    exVar: 'datamuseData',
    run: 'DATAMUSE_RHYME',
    cd: 5000,
    cd_default: false,
    mod: 1,
    desc: 'returns perfect rhymes to a word, powered by datamuse running with RhymeZone (#notspon). To get rhymes to \'help\', try using \'yelp\''
  },
  {
    name: 'define2',
    exVar: 'wordsApiData',
    run: 'WORDSAPI_DEFINE',
    cd: 10000,
    cd_default: false,
    mod: 1,
    desc: 'older command, returns a definition of the word, powered by WordsApi (#notspon)'
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
    name: 'blocky',
    run: 'BLOCKLETTER',
    cd: 10000,
    cd_default: false,
    mod: 1,
    desc: 'Converts to those blocky regional characters. ...or if asking: help -> 🇭 🇪 🇱 🇵'
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
    // banning functions have been moved to ./projectPenguin.js
    name: 'purge',
    exVar: 'allowPurge',
    run: 'PURGE',
    mod: 1,
    desc: 'bans all users on a predefined list. Requires asking the bot owner to enable'
  },
  {
    name: 'allowpurge',
    exVar: 'allowPurge',
    run: 'ALLOWPURGE',
    mod: -1,
    desc: 'allows use of purge for 5 minutes. or use query \'false\' to end before 5 minutes'
  },
  {
    name: 'penguin',
    exVar: 'autoban',
    run: 'AUTOBAN',
    mod: 1,
    desc: 'Toggle to have a penguin bouncer check out who\'s coming in against the purge list and a regex'
  },
  {
    name: 'banlistadd',
    run: 'BANLISTADD',
    mod: 1,
    desc: 'Adds username(s) to the internal ban list of this bot, space or comma separated usernames please!'
  },
  {
    name: 'banlistrem',
    run: 'BANLISTREMOVE',
    mod: 1,
    desc: 'Removes username(s) from internal ban list, space or comma separated usernames please.'
  }
]