import { gFunc } from './_generalFunctions.js';
import { files } from './filePaths.js';
import fs from 'fs';

export function FISH(client, channel, user) {
  //Changed a test of read/write to file to the new fish command
  const now = new Date();
  const YearMonth = now.getUTCFullYear().toString()+(now.getUTCMonth()+1).toString().padStart(2, '0');
  //console.log(YearMonth);
  let fishData;
  let change = false;
  let readFishFile = gFunc.readFilePromise(files.fishDataFiles, true);
  readFishFile.then( result => {
    fishData = JSON.parse(result);
    let gaus = -5;
    while (gaus > 25 || gaus < -4.5) {
      let u = 0;
      let v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      gaus = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      gaus = gaus * 2.5;
    }
    const fsh = 5 + gaus;
    const msg = ['Teeny fish! lycelGib ',
      'Oh, I caught one lycelWhatif ',
      'Okay lycelIdk ',
      'Not bad! lycelYes ',
      'Pretty good! lycelCool ',
      'What a catch! lycelYay ',
      "That's a big 'un lycelAAA ",
      'Those are rare! lycelBlush ',
      'lycelW lycelW lycelW '];
    let sz = 0;
    let fishoutput = ' ';
    if ((Math.random()) < 0.9) {
      if (fsh > 20.0) {
      sz = 8;
      } else if (fsh > 10.0) {
      sz = 7;
      } else if (fsh > 7.5) {
      sz = 6;
      } else if (fsh > 6.25) {
      sz = 5;
      } else if (fsh > 5.25) {
      sz = 4;
      } else if (fsh > 4.75) {
      sz = 3;
      } else if (fsh > 3.75) {
      sz = 2;
      } else if (fsh > 2.5) {
      sz = 1;
      }
      fishoutput = user["display-name"] + ' caught a fish of ' + fsh.toFixed(2) + 'kg! (' + (fsh * 2.20462).toFixed(2) + 'lbs) ' + msg[sz];
    if (/6[.]*9/.test(fishoutput)){
      fishoutput += "- nice ";
    }
    if (!fishData.hasOwnProperty(channel)){
      fishData[channel] = {};
    }
    if (!fishData[channel].hasOwnProperty(YearMonth)){
      fishData[channel][YearMonth] = {maxUser: "", max: 0, minUser: "", min:50};
    }
    if (fishData[channel][YearMonth].max < fsh){
      fishData[channel][YearMonth].max = fsh;
      fishData[channel][YearMonth].maxUser = user["display-name"];
      fishoutput += " - That's a new largest fish!";
      change = true;
    }
    if (fishData[channel][YearMonth].min > fsh){
      fishData[channel][YearMonth].min = fsh;
      fishData[channel][YearMonth].minUser = user["display-name"];
      fishoutput += " - That's a new smallest fish!";
      change = true;
    }
    } else {
      fishoutput = 'Oh no! The fish escaped!! lycelHands ';
    }
    
    client.say(channel, fishoutput);
    if (change){
      const dataToWrite = JSON.stringify(fishData);
      gFunc.writeFilePromise(files.fishDataFiles, dataToWrite);
    }
  }, error => {
    console.log(gFunc.mkLog('!err', 'ERROR') + 'error reading fish file!');
  });
}
  
export function FISH_STATS(client, channel, user) {
  //for now just read fish stats and output the month's records
  const now = new Date();
  const YearMonth = now.getUTCFullYear().toString()+(now.getUTCMonth()+1).toString().padStart(2, '0');
  let fishData;
  let readFishFile = gFunc.readFilePromise(files.fishDataFiles, true);
  readFishFile.then( result => {
    fishData = JSON.parse(result);
    //message to chat later
    let message = "";
    if (fishData.hasOwnProperty(channel) && fishData[channel].hasOwnProperty(YearMonth)){
      fishData = fishData[channel][YearMonth]
      message = "The !!fish records for this month: largest was " + fishData.maxUser + " with a fish of " + fishData.max.toFixed(2) + 'kg! (' + (fishData.max * 2.20462).toFixed(2) + "lbs) and the smallest was " + fishData.minUser + " with a fish of " + fishData.min.toFixed(2) + 'kg! (' + (fishData.min * 2.20462).toFixed(2) + "lbs)";
    } else {
      message = "The !!fish records have not been set this month...";
    }
    client.say(channel, message);
  }, error => {
    console.log(gFunc.mkLog('!err', 'ERROR') + 'error reading fish file!');
  });
}

export function NB_FISHSTATS(client, channel, user, query, saveChatArray) {
  const time = Date.now();
  const objName = channel + '-' + time;
  const endTime = time + 2500;
  saveChatArray[objName] = {
    channel: channel,
    time: time,
    endTime: endTime,
    messages: []
  };
  gFunc.readFilePromise(files.fishDataFiles, false).then( result => {
    let fishData = JSON.parse(result);
    const now = new Date();
    const YearMonth = now.getUTCFullYear().toString()+(now.getUTCMonth()+1).toString().padStart(2, '0');
    if (!fishData.hasOwnProperty(channel)){
      fishData[channel] = {};
    }
    if (!fishData[channel].hasOwnProperty(YearMonth)){
      fishData[channel][YearMonth] = {maxUser: "", max: 0, minUser: "", min:50};
    }
    setTimeout(function () {
      let change = false;
      for (let i = 0; i < saveChatArray[objName].messages.length; i++) {
        if (saveChatArray[objName].messages[i].user === 'Nightbot') {
          if (/^[A-z0-9_]+\scaught\sa\sfish\sof\s[0-9\.]+kg!\s\([0-9\.]+lbs\)\s/.test(saveChatArray[objName].messages[i].message)) {
            // console.log(saveChatArray[objName].messages[i].message);
            const msg = saveChatArray[objName].messages[i].message.split(' ');
            const val = parseFloat(msg[6].slice(1)) / 2.2046;
            if (val > fishData[channel][YearMonth].max) {
              fishData[channel][YearMonth].max = val;
              fishData[channel][YearMonth].maxUser = msg[0];
              change = true;
            } 
            if (val  < fishData[channel][YearMonth].min) {
              fishData[channel][YearMonth].min = val;
              fishData[channel][YearMonth].minUser = msg[0];
              change = true;
            }
          }
        }
      }
      if (change) {
        client.say(channel, 'according to my data, that\'s a new record!');
        gFunc.writeFilePromise(files.fishDataFiles, JSON.stringify(fishData));
      }
      delete saveChatArray[objName];
    }, 2500);
  }, error => {
    console.log(gFunc.mkLog('!err', 'ERROR') + 'error reading fish file!');
  });
    
  return;
}