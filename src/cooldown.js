export const Cooldown = {
  //used to initialize a new channel
  init_new: function (cooldownObject, channels){
    for (let i = 0; i < channels.length; i++){
      let channel = channels[i];
      //initialize cooldown object for channels that don't have one
      if (!cooldownObject.hasOwnProperty(channel)){
        //also a good list of all commands this currently has
        cooldownObject[channel] = {
          '!!hello': [false, 1000],
          '!!logme': [false, 1000],
          '!!fish': [false, 5000],
          '!!fishstats': [false, 15000],
          '!!timer': [false, 30000],
          '!!codeword': [false, 2000],
          '!!morse': [false, 10000]
        };
      } 
    }
  },
  
  //saves the current working cooldown file
  saveCooldownFile: function (data, fs, files){
    data = JSON.stringify(data);
    fs.writeFile(files.cooldown, data, (err) => {
      if (err) console.log(err);
      else console.log('cooldown file updated');
    });
  },
  
  //resets the cooldown file of a channel
  resetCooldown: function (channel, cooldown){
    for (const command in cooldown[channel]){
      if(cooldown[channel][command][1] < 0){
        cooldown[channel][command][0] = true;
      } else {
        cooldown[channel][command][0] = false;
      }
    }
  },
  
  //triggers cooldown to prevent spam
  setCooldown: function (channel, command, cooldown){
    cooldown[channel][command][0] = true;
    if (cooldown[channel][command][1] > 0){
      setTimeout(function(){cooldown[channel][command][0] = false;},cooldown[channel][command][1]);
    }
  },
  
  //command to parse message and change cooldown time if no syntax errors
  changeCooldown: function (channel, message, client, cooldown, fs, files) {
    let query = message.toLowerCase().split(' ');
    if (query.length < 2) {
      client.say(channel, `no command found. example: !!cd !!hello 1`);
    } else if (query.length === 2) {
      client.say(channel, `please space separate time (in seconds) and the command`);
    } else {
      let success = true;
      let time, command;
      if (cooldown[channel].hasOwnProperty(query[1])){
        command = query[1];
        time = parseFloat(query[2]);
      } else if (cooldown[channel].hasOwnProperty(query[2])){
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
          cooldown[channel][command][1] = time;
          client.say(channel, command + ` cooldown has been set to ` + time/1000 + ` seconds.`);
          this.saveCooldownFile(cooldown, fs, files);
        }
      }
    }
  },
  
  //enable ordisable a command based on a bool 'enable'
  enable: function (channel, message, client, cooldown, fs, files, enable) {
    let newStat = false;
    let newTime = 15000;
    let updateMessage = ' enabled.';
    if (!enable) {
      newStat = true;
      newTime = -1;
      updateMessage = ' disabled.';
    }
    let query = message.toLowerCase().split(' ');
    if (query.length < 2) {
      client.say(channel, `no command found. example: !!disable !!hello`);
    } else {
      if (cooldown[channel].hasOwnProperty(query[1])){
        cooldown[channel][query[1]][0] = newStat;
        cooldown[channel][query[1]][1] = newTime;
        client.say(channel, query[1] + updateMessage);
        this.saveCooldownFile(cooldown, fs, files);
      } else {
        client.say(channel, `could not find command! did you include the prefix?`);
      }
    }
  }
}
