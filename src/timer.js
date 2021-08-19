// file for all timer-related commands
export const Timer = {
  // initialize timer objecct
  init: function(channels) {
    let returnObj = {};
    for (let i = 0; i < channels.length; i++) {
      returnObj[channels[i]] = [];
    }
    // debug:
    // console.log(returnObj);
    return returnObj;
  },
  
  // adding a timer
  addTimer: function(channel, message, client, timerObject) {
    let query = message.replace(/^!+timer[\s]*/,'');
    query = query.split(' ');
    let timeMin = parseFloat(query[0]);
    // to be added back if the next check fails
    const maybeNum = query.shift();
    let addMsg = query.join(' ');
    if (isNaN(timeMin) || timeMin <= 0){
      timeMin = 10;
      addMsg = maybeNum + ' ' + addMsg;
    } else if (timeMin % 1 != 0) {
      timeMin = timeMin.toFixed(4);
    }
    let plural = ' minutes';
    if (timeMin === 1) plural = ' minute';
    client.say(channel, `Timer set for ` + timeMin + plural + '!');
    console.log('timer set for ' + timeMin + plural + ' from now in ' + channel);
    if (addMsg.length === 0) {
      addMsg = '[TIMER END!] this one was set ' + timeMin + plural + ' ago';
    } else {
      addMsg = '[From ' + timeMin + plural + ' ago] -> ' + addMsg;
    }
    timerObject[channel].push(setTimeout(() => {client.say(channel, addMsg);},timeMin * 60000));
    return;
  },
  
  //delete last timer
  delLastTimer: function(channel, client, timerObject) {
    //remove any already done timers
    for (let i = 0; i < timerObject[channel].length; i++) {
      if (timerObject[channel][i]._destroyed) {
        timerObject[channel].splice(i, 1);
        // check whatever next item is now in this spot
        i--;
      }
    }
    const len = timerObject[channel].length;
    if (len !== 0) {
      const delTimer = timerObject[channel].pop();
      console.log('stopped timer #' + len + ' in channel ' + channel);
      client.say(channel, 'last timer (for ' + delTimer._idleTimeout / 60000 + ' mins) deleted');
      clearTimeout(delTimer);
    } else {
      client.say(channel, 'no active timers!');
    }
  }
}
    