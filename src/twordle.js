import fs from 'fs';
import { files } from './filePaths.js';
import { gFunc } from './_generalFunctions.js';
import dayjs from 'dayjs';

// code for twordle game, a twitch adaptation of wordle. reworked from codewordsGame.js (also in src folder).
export function TWORDLE(client, channel, user, query) {
  
  function findNewWord() {
    let returnWord;
    // initialize dictionary
    try {
      const data = fs.readFileSync(files.twordleWordFile);
      returnWord = JSON.parse(data);
      
      // return defined here if dictionary exists
      returnWord = returnWord[Math.floor(Math.random() * returnWord.length)];
      
    } catch (err) {
      // defines a 'first' word as 'first' if no dictionary exists
      returnWord = 'first';
      console.log(gFunc.mkLog('info', '%Twordle') + files.twordleWordFile + ' does not exist or cannot be found... making file');
      try {
        // create a 'default' twordle dictionary where words are 5-10 letters long
        const promise = new Promise ((resolve,reject) => {
          let newData = gFunc.readHttps('https://www.randomlists.com/data/words.json');
          newData.then( result => {
            result = JSON.parse(result).data;
            resolve(result);
          }, error => {
            reject(error);
          })
        });
        promise.then( result => {
          // remove non-eligible words
          let count = 0;
          for (let i = 0; i < result.length; i++) {
            if(result[i].length > 7 || result[i].length < 5 || /[^a-z]/g.test(result[i])) {
              result.splice(i,1);
              // we have to re-check this index now
              i--;
            }
          }
          fs.writeFileSync(files.twordleWordFile, JSON.stringify(result));
          console.log(gFunc.mkLog('info', '%Twordle') + files.twordleWordFile + ' has been created');
          
          // return defined here if dictionary just made
          returnWord = result[Math.floor(Math.random() * result.length)];
        }, reject => {
          console.log(gFunc.mkLog('!err', '%Twordle') + 'could not retrieve default twordle dictionary!');
        } );      
      } catch (err) {
        console.error(err);
        // if everyone gets 'error' as a word then we know something is up, but game should function and not crash the bot
        returnWord = 'error';
      }
    }
    return returnWord;
  }
  
  // function for how many attempts allowed based on word length
  function maxAttempts(wordLen) {
    return Math.floor(2.5 * (wordLen - 5) + 6);
  }
  
  // fetch user data from twordleDataFile, returns userData object
  function fetchUserData(twordleData) {
    const now = new Date();
    // date in YYYYMMDD
    const formatDate = now.getUTCFullYear().toString()+(now.getUTCMonth()+1).toString().padStart(2, '0')+now.getUTCDate().toString().padStart(2, '0');
    // stores word number accross days
    let wordNum = 1;
    if (twordleData[user.username]) {
      if (twordleData[user.username].date === formatDate) {
        // user file exists and date is still valid
        return twordleData[user.username];
      } else {
        // update wordNum
        wordNum = twordleData[user.username].wordNum + 1;
      }
    }
    // file doesn't exist or date has changed (return above not triggered)
    let newWord = findNewWord();
    // defines a new file
    return {
      date: formatDate,
      word: newWord,
      wordNum: wordNum,
      wordLen: newWord.length,
      attempt: -1,
      maxAttempt: maxAttempts(newWord.length),
      prevAttempts: [],
      prevAttemptSquare: [],
      wrongLetters: [],
      complete: false
    }
  }
  
  // displays stats, returns a string
  function displayStats(userData, showGuesses) {
    let returnMsg = 'Guess: ' + userData.attempt + '/' + userData.maxAttempt + ' ';
    if (userData.attempt === 0) {
      returnMsg += 'no guesses so far.';
    } else {
      // to not clutter chat as much, guesses only shown on request
      if (showGuesses) {
        returnMsg += 'guesses: ';
        returnMsg += userData.prevAttempts.join(', ');
        returnMsg += ' | your word does not contain: ';
        returnMsg += userData.wrongLetters.join(', ');
      } else {
        returnMsg += 'squares: ';
        returnMsg += userData.prevAttemptSquare.join(', ');
        returnMsg += ' use \'show\' for guesses and wrong letters';
      }
    }
    return returnMsg;
  }
  
  // handles guesses - updates userData object and returns a message to display
  function handleGuess(userData, guess){
    // output message
    let squares = '';
    let finMsg = '';
    let samePlace = 0;
    for (let i = 0; i < userData.wordLen; i++) {
      if(guess[i] === userData.word[i]){
        samePlace++;
        squares += '🟩';
      } else {
        const curSqLen = squares.length;
        for (let j = 0; j < userData.wordLen; j++) {
          if (guess[i] === userData.word[j]) {
            squares += '🟨';
            break;
          }
        }
        // incorrect letter
        if (squares.length === curSqLen) {
          squares += '⬛';
          if (!userData.wrongLetters.includes(guess[i])) {
            userData.wrongLetters.push(guess[i]);
          }
        }
      }
    }

    if(samePlace === userData.wordLen){
      // they got it right
      userData.complete = true;
      finMsg = ' Congrats! you got it!';
    }
    // update attempts
    userData.attempt++;
    // update arrays
    userData.prevAttempts.push(guess);
    userData.prevAttemptSquare.push(squares);
    // update complete from reachign attempt limit
    if (userData.attempt === userData.maxAttempt) {
      userData.complete = true;
      finMsg = ' the word was ' + userData.word;
    }
    return 'Attempt ' + userData.attempt + '/' + userData.maxAttempt + ': ' + squares + finMsg;
  }
  
  // 'run' starts here
  query = query.replace(/\s/,'');
  query = query.toLowerCase();
  query = query.split();
  
  // data file object
  let twordleData;
  
  // open twordleDataFile
  try {
    twordleData = JSON.parse(fs.readFileSync(files.twordleDataFile));
    // file exists, check for user file

  } catch (err) {
    console.log(gFunc.mkLog('info', '%Twordle') + files.twordleDataFile + ' does not exist or cannot be found... making file');
    twordleData = {};
    fs.writeFileSync(files.twordleDataFile, '{}');
    console.log(gFunc.mkLog('info', '%Twordle') + files.twordleDataFile + ' has been created');
  }
  
  // data for specific user
  let userData = fetchUserData(twordleData);
  // debug: console.log(userData);
  
  // location for special queries (empty for now)
  
  // if it's a new word, display data, don't let them continue
  if (userData.attempt === -1) {
    const endMsg = ' Your word for today is ' + userData.wordLen + ' letters long. You have ' + userData.maxAttempt + ' attempts.'
    if (userData.wordNum === 1) {
      // first twordle
      const startMsg = 'Hi, ' + user['display-name'] + ', welcome to twordle, a twitch adaptation of Wordle!';
      client.say(channel, startMsg + endMsg);
    } else {
      const startMsg = 'New day, new word, ' + user['display-name'] + '.';
      client.say(channel, startMsg + endMsg);
    }
    userData.attempt++;
  } else if (userData.complete) {
    // they are done for today
    const now = new Date();
    const timeToNext = (23 - now.getUTCHours()).toString() + 'h ' + (59 - now.getUTCMinutes()).toString() + 'm';
    if (query[0] === 'show') {
      client.say(channel, 'Final stats for ' + user['display-name'] + ' today: ' + displayStats(userData, true) + '. Next twordle in approx. ' + timeToNext);
    } else {
      client.say(channel, 'Final stats for ' + user['display-name'] + ' today: ' + displayStats(userData, false) + '. Next twordle in approx. ' + timeToNext);  
    }
  } else {
    // query options
    if(query[0].length === 0){
      // display current data
      client.say(channel, 'Stats so far for ' + user['display-name'] + ' ' + displayStats(userData, false));
    } else if (query[0].length !== userData.wordLen) {
      if (query[0] === 'show') {
        client.say(channel, 'Stats so far for ' + user['display-name'] + ' ' + displayStats(userData, true));
      } else if(query[0] === '!') {
        client.say(channel, user['display-name'] + ', your word does NOT contain: ' + userData.wrongLetters.join(', '));
      } else {
        client.say(channel, 'Your guess doesn\'t match the world length! alternatively, for current stats, leave the query blank, or \'show\' for previous guesses');
      }
    } else {
      const msg = handleGuess(userData, query[0]);
      client.say(channel, msg);
    }
  }
  
  // save current round
  twordleData[user.username] = userData;
  try {
    fs.writeFileSync(files.twordleDataFile, JSON.stringify(twordleData));
  } catch (err) {
    console.err(err);
    // output what was supposed to save if failed
    console.log(userData);
  }
}