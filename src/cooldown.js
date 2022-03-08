'use strict';
import { prefix, defCommands } from './_defCommands.js';
import { hiddenCommands } from './hiddenCommands.js';
import { files } from './filePaths.js';
import { gFunc } from './_generalFunctions.js';
import fs from 'fs';

// implements the cooldown functionality
export const Cooldown = {
  // version number
  version: '1.4',
  
  // default cooldowns creator for versions 1.4 and up
  default_cooldowns: function() {
    // get cooldown from files
    function getDefCd (cdObject, addToObject) {
      for (let i = 0; i < cdObject.length; i++) {
        if (cdObject[i].cd) {
          const defEnable = ((cdObject[i].cd_default) ? 1 : -1);
          addToObject[cdObject[i].name] = defEnable * cdObject[i].cd;
        }
      }
    }
    const def_cooldowns = {};
    getDefCd (defCommands, def_cooldowns);
    getDefCd (hiddenCommands, def_cooldowns);
    return def_cooldowns;
  },
  
  /* deprecated, used for cooldown versions up to 1.3.2
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
  */
  
  // used to initialize/update cooldown file
  init_new: function (cooldownObject, channels){
    // update previously known things
    Cooldown.update(cooldownObject, channels);
    
    //initialize new channels
    for (let i = 0; i < channels.length; i++){
      const cooldownList = Cooldown.default_cooldowns();
      let channel = channels[i];
      // initialize cooldown object for channels that don't have one
      if (!cooldownObject.hasOwnProperty(channel)){
        cooldownObject[channel] = {};
        for (const command in cooldownList) {
          cooldownObject[channel][command] = [cooldownList[command], 0];
        }
      } 
    }
  },
  
  // adds cooldowns to new commands
  update: function (cooldownObject, channels) {
    // nowadays used for logging -> tests for new and no longer used commands by default
    let needUpdate = false;
    if(!cooldownObject.hasOwnProperty('version')){
      needUpdate = true;
    } else if (cooldownObject.version !== Cooldown.version) {
      needUpdate = true;
      // test for old version of cooldown file, if so rewrite.
      const splitVersion = cooldownObject.version.split('.');
      if (splitVersion[0] === '1') {
        if (splitVersion[1] <= 2) {
          console.log(gFunc.mkLog('info', '%CoolDwn') + 'pre 1.3 cooldown object found');
          for (const channel in cooldownObject) {
            if (channel !== 'version') {
              for (const command in cooldownObject[channel]) {
                cooldownObject[channel][command] = [(cooldownObject[channel][command][1]), 0];
              }
            }
          }
        }
        if(splitVersion[1] <= 3) {
          console.log(gFunc.mkLog('info', '%CoolDwn') + 'pre 1.4 cooldown object found');
          for (const channel in cooldownObject) {
            if (channel !== 'version') {
              for (const command in cooldownObject[channel]) {
                // copy over data, remove old
                const newName = command.slice(2);
                cooldownObject[channel][newName] = cooldownObject[channel][command];
                delete cooldownObject[channel][command];
              }
            }
          }
        }
      }
    }
    //initialize list of default cooldowns
    const cooldownList = Cooldown.default_cooldowns();
    // test for new commands, provided all channels have same set of commands
    const newCommands = [];
    // array for old comamnds to remove
    const oldCommands = [];
    for (const testChannel in cooldownObject) {
      if (testChannel !== 'version'){
        for (const command in cooldownList) {
          if (!cooldownObject[testChannel][command]){
            newCommands.push(command);
          }
        }
        for (const command in cooldownObject[testChannel]) {
          if (!cooldownList[command]) {
            oldCommands.push(command);
          }
        }
        break;
      }
    }
    // add or remove commands as needed
    for (let i = 0; i < channels.length ; i++) {
      if (cooldownObject[channels[i]]) {
        for (let j = 0; j < newCommands.length; j++) {
          if (!cooldownObject[channels[i]][newCommands[j]]){
            //initialize as defined
            cooldownObject[channels[i]][newCommands[j]] = [cooldownList[newCommands[j]], 0];
          }
        }
        for (let j = 0; j < oldCommands.length; j++) {
          delete cooldownObject[channels[i]][oldCommands[j]];
        }
      }
    }
    if(needUpdate) {
      console.log(gFunc.mkLog('updt', '%CoolDwn') + 'cooldown file updated to v' + Cooldown.version);
      cooldownObject.version = Cooldown.version;
    }
  },
  
  //eventually may need a funtion to remove old depreicated cooldowns.
  
  // saves the current working cooldown file
  saveCooldownFile: function (data, filePath){
    data = JSON.stringify(data);
    let saveToFile = files.cooldown;
    // if no filePath defined, save to usual cooldown file location (added for testing)
    if (filePath) {
      saveToFile = filePath;
    }
    fs.writeFile(filePath, data, (err) => {
      if (err) console.log(err);
      else console.log(gFunc.mkLog('info', '%CoolDwn') + 'cooldown file updated at ' + filePath);
    });
  },
  
  addPrefix: function (someStr) {
    return prefix + someStr;
  },
  
  remPrefix: function (someStr) {
    const prefixTest = new RegExp('^' + prefix);
    return someStr.replace(prefixTest, '');
  },
  
  // tests for cooldown, sets and returns true if command is available. else returns false
  checkCooldown: function (channel, command, cooldownObject, time, allow){
    if (!allow) {
      return false;
    } else if(!cooldownObject[channel][command]) {
      throw new Error('cooldown attribute for ' + command + ' is missing');
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
  changeCooldown: function (client, channel, user, query, cooldown) {
    query = Cooldown.remPrefix(query);
    query = query.toLowerCase().split(' ');
    if (query.length < 1) {
      client.say(channel, `no command found. example: !!cd !!hello 1`);
    } else if (query.length === 1) {
      client.say(channel, `please space separate time (in seconds) and the command`);
    } else {
      let success = true;
      let time, command;
      if (cooldown[channel][query[0]]){
        command = query[0];
        time = parseFloat(query[1]);
      } else if (cooldown[channel][query[1]]){
        command = query[1];
        time = parseFloat(query[0]);
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
          client.say(channel, Cooldown.addPrefix(command) + ` cooldown has been set to ` + Math.abs(time/1000) + ` seconds.`);
          // client.say(channel, command + ` cooldown has been set to ` + Math.abs(time/1000) + ` seconds.`);
          Cooldown.saveCooldownFile(cooldown);
        }
      }
    }
  },
  
  // enable or disable a command based on a bool 'enable'
  enable: function (client, channel, user, query, combinedCd) {
    let newTime = 1;
    let updateMessage = ' enabled.';
    if (!combinedCd[1]) {
      newTime = -1;
      updateMessage = ' disabled.';
    }
    query = query.toLowerCase().split(' ');
    if (query.length < 1) {
      client.say(channel, `command needs a query (which command to enable/disable)`);
    } else {
      if (query[0] === 'all') {
        for (const command in combinedCd[0][channel]) {
          combinedCd[0][channel][command][0] = newTime * Math.abs(combinedCd[0][channel][command][0]);
        }
        client.say(channel, `all commands` + updateMessage);
        Cooldown.saveCooldownFile(combinedCd[0]);
      } else {
        // if query is not 'all'
        query[0] = Cooldown.remPrefix(query[0]);
        if (combinedCd[0][channel][query[0]]){
          combinedCd[0][channel][query[0]][0] = newTime * Math.abs(combinedCd[0][channel][query[0]][0]);
          client.say(channel, Cooldown.addPrefix(query[0]) + updateMessage);
          Cooldown.saveCooldownFile(combinedCd[0]);
        } else {
          let msg = 'could not find command! Did you mean: ';
          const closestMatch = gFunc.closestObjectAttribute(query[0],combinedCd[0][channel]);
          for (let i = 0; i < closestMatch.length; i++) {
            msg += Cooldown.addPrefix(closestMatch[i][1]);
            if (i !== closestMatch.length - 1) {
              msg += ', ';
            }
          }
          msg += '?';
          client.say(channel, msg);
        }
      }
      
    }
  }
}
