// implements the cooldown functionality
export const Cooldown = {
  // version number
  version: '1.3.1',
  
  // default cooldowns
  // also a good list of all commands this currently has
  default_cooldowns: {
    '!!hello': 1000,
    '!!logme': 1000,
    '!!commands': 10000,
    '!!fish': 5000,
    '!!fishstats': 15000,
    '!!timer': 30000,
    '!!codeword': 2000,
    '!!morse': 10000,
    '!!convert': 10000,
    '!!tone': 10000,
    '!!define': 10000,
    // trivia is meant to be mod-only but can be disabled.
    '!!trivia': 1000
  },
  
  // used to initialize a new channel
  init_new: function (cooldownObject, channels){
    for (let i = 0; i < channels.length; i++){
      let channel = channels[i];
      // initialize cooldown object for channels that don't have one
      if (!cooldownObject.hasOwnProperty(channel)){
        cooldownObject[channel] = {};
        for (const command in this.default_cooldowns) {
          cooldownObject[channel][command] = [this.default_cooldowns[command], 0];
        }
      } 
    }
    this.update(cooldownObject, channels);
  },
  
  // adds cooldowns to new commands
  update: function (cooldownObject, channels) {
    let needUpdate = false;
    if(!cooldownObject.hasOwnProperty('version')){
      needUpdate = true;
    } else if (cooldownObject.version !== this.version) {
      needUpdate = true;
      // test for old version of cooldown file, if so rewrite.
      const splitVersion = cooldownObject.version.split('.');
      if (splitVersion[0] === '1' && splitVersion[1] <= 2) {
        console.log('old cooldown object found');
        for (const channel in cooldownObject) {
          if (channel !== 'version') {
            for (const command in cooldownObject[channel]) {
              cooldownObject[channel][command] = [(cooldownObject[channel][command][1]), 0];
            }
          }
        }
      }
    }
    if(needUpdate) {
      console.log('updating cooldown file to v' + this.version);
      for (let i = 0; i < channels.length ; i++) {
        for ( const command in this.default_cooldowns ){
          if (!cooldownObject[channels[i]].hasOwnProperty(command)){
            //initialize as disabled
            cooldownObject[channels[i]][command] = [-this.default_cooldowns[command], 0];
          }
        }
      }
      cooldownObject.version = this.version;
    }
  },
  
  //eventually may need a funtion to remove old depreicated cooldowns.
  
  // saves the current working cooldown file
  saveCooldownFile: function (data, fs, files){
    data = JSON.stringify(data);
    fs.writeFile(files.cooldown, data, (err) => {
      if (err) console.log(err);
      else console.log('cooldown file updated');
    });
  },
  
  // tests for cooldown, sets and returns true if command is available. else returns false
  checkCooldown: function (channel, command, cooldownObject, time, allow){
    if (!allow) {
      return false;
    } else if (cooldownObject[channel][command][0] < 0) {
      return false;
    } else if (time - cooldownObject[channel][command][1] > cooldownObject[channel][command][0]) {
      // cooldown is over
      cooldownObject[channel][command][1] = time;
      return true;
    } else {
      return false;
    }    
  },
  
  // command to parse message and change cooldown time if no syntax errors
  changeCooldown: function (channel, message, client, cooldown, fs, files) {
    let query = message.toLowerCase().split(' ');
    if (query.length < 2) {
      client.say(channel, `no command found. example: !!cd !!hello 1`);
    } else if (query.length === 2) {
      client.say(channel, `please space separate time (in seconds) and the command`);
    } else {
      let success = true;
      let time, command;
      if (cooldown[channel][query[1]]){
        command = query[1];
        time = parseFloat(query[2]);
      } else if (cooldown[channel][query[2]]){
        command = query[2];
        time = parseFloat(query[1]);
      } else {
        success = false;
        client.say(channel, `could not find command! did you include the prefix?`);
      }
      if(success){ 
        if (isNaN(time)) {
          client.say(channel, `could not read time (in seconds please)!`);
        } else if (time < 0) {
          client.say(channel, `negative cooldown times are not allowed.`);
        } else {
          time  = time.toFixed(3) * 1000;
          if (cooldown[channel][command][0] < 0) {
            time = -time;
          }
          cooldown[channel][command][0] = time;
          client.say(channel, command + ` cooldown has been set to ` + Math.abs(time/1000) + ` seconds.`);
          this.saveCooldownFile(cooldown, fs, files);
        }
      }
    }
  },
  
  // enable or disable a command based on a bool 'enable'
  enable: function (channel, message, client, cooldown, fs, files, enable) {
    let newTime = 1;
    let updateMessage = ' enabled.';
    if (!enable) {
      newTime = -1;
      updateMessage = ' disabled.';
    }
    let query = message.toLowerCase().split(' ');
    if (query.length < 2) {
      client.say(channel, `no command found. example: !!disable !!hello`);
    } else {
      if (cooldown[channel][query[1]]){
        cooldown[channel][query[1]][0] = newTime * Math.abs(cooldown[channel][query[1]][0]);
        client.say(channel, query[1] + updateMessage);
        this.saveCooldownFile(cooldown, fs, files);
      } else if (query[1] === 'all') {
        for (const command in cooldown[channel]) {
          cooldown[channel][command][0] = newTime * Math.abs(cooldown[channel][command][0]);
        }
        client.say(channel, `all commands` + updateMessage);
        this.saveCooldownFile(cooldown, fs, files);
      } else {
        client.say(channel, `could not find command! did you include the prefix?`);
      }
    }
  }
}
