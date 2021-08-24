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
    desc: "default command, sort of a !ping. Bot says hi to you"
  },
  {
    name: 'test',
    run: function(client, channel) {
      client.say(channel, 'object is working!');
    },
    cd: 1000,
    mod: -1
  }
]