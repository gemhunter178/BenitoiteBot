// in this case 'def' means default. list of all deafult commands and some data associated with them
export const prefix = '!!';

// for reference, mod level -1 is bot_owner, 0 is everyone, 1 is mods only, 2 is broadcaster only
// format for functionn args (from _tmiChatBot.js) -> (client, channel, user, query)
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
    cd: 1000,
    mod: 0,
    desc: 'displays contents of user object on console. Mostly for debugging purposes'
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