// place any commands you wish to not be tracked in the repository here

export const hiddenCommands = [
  {
    name: 'test',
    run: function(client, channel) {
      client.say(channel, 'this is a test command, made in the hidden commands file');
    },
    mod: -1,
    desc: 'a test command to test if hidden commands are working.'
  }
]