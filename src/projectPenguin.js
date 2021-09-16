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
        }, 1200);
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
              const timeBetween = 1000 + Math.floor(Math.random() * 4269);
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
  },
  
  // add names to ban list
  banListAdd: function(client, channel, user, query) {
    if(query.length !== 0) {
      query = query.split(/[,\s]+/);
      gFunc.readFilePromise(files.banList, false).then(ban_list => {
        ban_list = JSON.parse(ban_list);
        gFunc.save(ban_list, files.banListBackup);
        let numAdd = 0;
        for (let i = 0; i < query.length; i++) {
          if (!ban_list.includes(query[i])) {
            ban_list.unshift(query[i]);
            numAdd++;
          }
        }
        gFunc.save(ban_list, files.banList);
        if(numAdd !== 0) {
          client.say(channel, numAdd + ' usernames have been added to the list.');
        } else {
          client.say(channel, 'all names already accounted for.');
        }
      }, reject => {
        console.log(reject);
      });
    } else {
      client.say(channel, 'needs a query of which username(s) to add. space separated, please.');
    }
  },
  
  //remove names from ban list
  banListRemove: function(client, channel, user, query) {
    if(query.length !== 0) {
      query = query.split(/[,\s]+/);
      gFunc.readFilePromise(files.banList, false).then(ban_list => {
        ban_list = JSON.parse(ban_list);
        gFunc.save(ban_list, files.banListBackup);
        let numRem = 0;
        for (let i = 0; i < query.length; i++) {
          const indexOfUname = ban_list.indexOf(query[i]);
          if (indexOfUname !== -1) {
            ban_list.splice(indexOfUname, 1);
            numRem++;
          }
        }
        gFunc.save(ban_list, files.banList);
        if(numRem !== 0) {
          client.say(channel, numRem + ' usernames have been removed from the list.');
        } else {
          client.say(channel, 'no such username(s) found');
        }
      }, reject => {
        console.log(reject);
      });
    } else {
      client.say(channel, 'needs a query of which username(s) to remove. space separated, please.');
    }
  }
}