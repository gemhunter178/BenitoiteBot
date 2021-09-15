'use strict';
import { files } from './filePaths.js';
import { gFunc } from './_generalFunctions.js';

// this file contains all the functions used in the autoban/purge items

export const ProjectPenguin = {
  
  // purge (ban all) based on ban_list
  purge: function (client, channel, user, query, allowPurge) {
    // purge means ban everyone in the provided list, bans happen 1.5 seconds apart and will only work if bot is modded
    // if the owner of this bot does !!allowPurge anywhere the bot is active, this command is allowed for 5 minutes.
    if(allowPurge.allow){
      //future implementaion of not using so many setTimeout objects?
      gFunc.readFilePromise(files.banList, false).then( ban_list => {
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
  
  // allows purge to run
  allowPurge: function(client, channel, user, query, allowPurge) {
    if (/(false)|(stop)/i.test(query)){
      client.say(channel, 'purge access revoked.')
      allowPurge.allow = false;
    } else {
      allowPurge.allow = true;
      client.say(channel, 'permission granted.')
      setTimeout(function() {
        console.log('purge permissions revoked (if not yet already)');
        allowPurge.allow = false;
      }, 300000);
    }
  },
  
  // autoban functionality, the original codename 'penguin.' set up as a toggle
  autoban: function(client, channel, user, query, autoban) {
    if (autoban[channel].enable === false) {
      // turn on autoban. Needs to also check the current users and ban any that don't pass
      autoban[channel].enable = true;
      client.say(channel, 'the penguin is HERE. 🐧');
      const needToBan = [];
      gFunc.readHttps('https://tmi.twitch.tv/group/user/' + channel.slice(1) + '/chatters').then( info => {
        const users = JSON.parse(info).chatters.viewers;
        if(typeof(users) === 'undefined') {
          console.log(gFunc.mkLog('!err', 'ERROR') + 'error in fetching users!');
        }
        gFunc.readFilePromise(files.banList, false).then( ban_list => {
          ban_list = JSON.parse(ban_list);
          for (let userIndex = 0; userIndex < users.length; userIndex++) {
            if (ban_list.includes(users[userIndex])) {
              needToBan.push(users[userIndex]);
            } else if (autoban.regex) {
              if(autoban.regex.test(users[userIndex])) {
                needToBan.push(users[userIndex]);
              }
            }
          }
          let banIndex = 0;
          (function banWithInterval() {
            if (banIndex === needToBan.length) {
              return;
            } else {
              const timeBetween = 1000 + Math.random() * 4269;
              setTimeout(function() {
                //console.log('/ban ' + needToBan[banIndex]);
                client.say(channel, '/ban ' + needToBan[banIndex]);
                banIndex++;
                banWithInterval();
              }, timeBetween);
            }
          }());
        }, err => {
          console.log(gFunc.mkLog('!err', 'ERROR') + 'no list found, sorry');
        });
      }, err => {
        console.error(err);
      });
    } else {
      autoban[channel].enable = false;
      client.say(channel, 'penguin has left...');
    }
  }
}