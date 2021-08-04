import { gFunc } from './_generalFunctions';
export function FISH(fishDataFile, fs, user, channel, client) {
  //Changed a test of read/write to file to the new fish command
  const now = new Date();
  const YearMonth = now.getUTCFullYear().toString()+(now.getUTCMonth()+1).toString().padStart(2, '0');
  //console.log(YearMonth);
  let fishData;
  let change = false;
  let readFishFile = gFunc.readFilePromise(fs, fishDataFile, true);
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
      gFunc.writeFilePromise(fs, fishDataFile, dataToWrite);
    }
  }, error => {
    console.log('error reading fish file!');
  });
}
  
export function FISH_STATS(fishDataFile, fs, user, channel, client) {
  //for now just read fish stats and output the month's records
  const now = new Date();
  const YearMonth = now.getUTCFullYear().toString()+(now.getUTCMonth()+1).toString().padStart(2, '0');
  let fishData;
  let readFishFile = gFunc.readFilePromise(fs, fishDataFile, true);
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
    console.log('error reading fish file!');
  });
}