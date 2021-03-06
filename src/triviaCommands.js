import fs from 'fs';
import { files } from './filePaths.js';
import { gFunc } from './_generalFunctions.js';
// powered by https://opentdb.com/api_config.php
// trivia command object with everything needed to make a working trivia game
export const Trivia = {
  getCat: function (file, force) {
    // fetch current time
    const current_time = Date.now();

    // resolves a bool of whether the file should be updated, cooldown of a day.
    let checkFile = new Promise ((resolve, reject) => {
      if (force) {
        console.log(gFunc.mkLog('updt', '%Trivia_') + 'forcing trivia category update');
        resolve(true);
      }
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          // if no file exists
          console.log(gFunc.mkLog('info', '%Trivia_') + 'no trivia category file found, creating a new one');
          // attempt to make file later
          resolve(true);
        } else {
          // on successful read file
          data = JSON.parse(data);
          // timeout for cache
          if (current_time - data.retrivalTime > 86400000) {
            console.log(gFunc.mkLog('updt', '%Trivia_') + 'category file is more than a day old, refreshing.');
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });
    checkFile.then( result => {
      // result is true if the category file needs to be updated/written
      if (result){
        let newData = gFunc.readHttps('https://opentdb.com/api_category.php');
        newData.then( result => {
          result = JSON.parse(result);
          // reformatting file to be easier to search through later
          let formatCategories = {trivia_categories: {}};
          for (let i = 0; i < result.trivia_categories.length; i++){
            result.trivia_categories[i].name = result.trivia_categories[i].name.replace(/^Entertainment:\s|^Science:\s/, '').replace(/\s*&\s*/g,' and ').toLowerCase();
            formatCategories.trivia_categories[result.trivia_categories[i].name] = result.trivia_categories[i].id;
          }
          // add the 'any' category
          formatCategories.trivia_categories.any = -1;
          // for caching
          formatCategories.retrivalTime = current_time;
          formatCategories = JSON.stringify(formatCategories);
          gFunc.writeFilePromise(file, formatCategories).then(resultWrite => {
            console.log(resultWrite);
          }, errorWrite => {
            console.log(errorWrite)
          });
        }, error => {
          console.log(error);
        });
      } else {
        console.log(gFunc.mkLog('info', '%Trivia_') + 'using cached trivia categories');
      }
    }, error => {
      console.log(error);
    });
  },

  // used to initialize the trivia file. note 'channels' is the list of all channels the bot is in
  initialize: function (channels, file){
    let triviaData;
    gFunc.readFilePromise(file, true).then(data => {
      triviaData = JSON.parse(data);
      for (let i = 0; i < channels.length; i++) {
        if (!triviaData.hasOwnProperty(channels[i])){
          triviaData[channels[i]] = {
            // -1 will be used for 'any'
            category: -1,
            difficulty: -1,
            type: -1,
            time: 15000
          };
        }
      }
      // used to pass file location to writing file later
      triviaData.filePath = file;
      return triviaData;
    }, error => {
      console.log(gFunc.mkLog('!err', 'ERROR') + error);
      return 1;
    }).then(result => {
      if (result === 1){
        return;
      } else {
        result = JSON.stringify(result);
        gFunc.writeFilePromise(file, result);
      }
    });
  },

  // command that calls the other commands (use this in the chatbot command)
  useCommand: function (client, channel, user, query, saveChatArray) {
    if (query.length === 0) {
      client.say(channel, 'trivia, powered by Open Trivia Database! options: \'explain\', \'start\', \'category\', \'difficulty\', \'type\', \'time\', \'config\'');
      return;
    }
    const comList = {
      // 0 would fail the if check below
      start: 1,
      cat: 2,
      category: 2,
      diff: 3,
      difficulty: 3,
      type: 4,
      time: 5,
      config: 6,
      explain: 7,
      // semi-secret force update of category file
      update: 8
    }
    query = query.split(' ');
    query[0] = query[0].toLowerCase();
    if (comList[query[0]]){
      // only activates if a case insensitive match is found
      const opt = comList[query[0]];
      query.splice(0,1);
      query = query.join(' ');
      gFunc.readFilePromise(files.triviaData, false).then(data => {
        let triviaData = JSON.parse(data);
        switch (opt) {
          case 1:
            Trivia.start(channel, triviaData, client, saveChatArray);
            break;

          case 2:
            Trivia.chooseCat(channel, triviaData, files.triviaCatFile, client, query);
            break;

          case 3:
            Trivia.changeDifficulty(channel, triviaData, client, query);
            break;

          case 4:
            Trivia.changeType(channel, triviaData, client, query);
            break;

          case 5:
            Trivia.changeTime(channel, triviaData, client, query);
            break;

          case 6:
            Trivia.showConfig(channel, triviaData, files.triviaCatFile, client);
            break;

          case 7:
            client.say(channel, 'trivia, powered by Open Trivia Database! (#notspon) to play enter A | B | C | D for multiple choice or T | F for true false questions!');
            break;

          case 8:
            client.say(channel, 'forcing category check/update');
            Trivia.getCat(files.triviaCatFile, true);
            break;
        }
      }, error => {
        client.say(channel, 'could not find trivia data file... was it removed?');
      });
    } else {
      // tries to be helpful and gives closest option
      query = gFunc.closestObjectAttribute(query[0], comList);
      let potentialComs = '';
      // potential overkill for formatting
      for (let i = 0; i < query.length; i++) {
        potentialComs += ('\'' + query[i][1] + '\'');
        if (i < query.length - 2){
          potentialComs += ', ';
        } else if (i === query.length - 2) {
          potentialComs += ', or ';
        }
      }
      client.say(channel, `unsure which option... did you mean ` + potentialComs + '?');
      return;
    }
  },

  // based on messages in a saveChat, returns a string to append to message. also deletes used object.
  evalAns: function (saveChatArray, evalObj, correctAns) {
    // console.log(saveChatArray[evalObj]); // debug to see object
    let message = ' | Congrats to ';
    if(correctAns === 'True') {
      correctAns = '(t|true)';
    } else if (correctAns === 'False') {
      correctAns = '(f|false)';
    }
    const compareTo = new RegExp('^' + correctAns + '(\\s+|$)', 'i');
    for (let i = 0; i < saveChatArray[evalObj].messages.length; i++) {
      if (compareTo.test(saveChatArray[evalObj].messages[i].message)) {
        message += saveChatArray[evalObj].messages[i].user + ' for getting the right answer first!';
        break;
      }
    }
    delete saveChatArray[evalObj];
    if (message === ' | Congrats to ') {
      return ' | ...no one got the answer';
    } else {
      return message;
    }
  },

  start: function (channel, triviaData, client, saveChatArray){
    let getTriviaURL = 'https://opentdb.com/api.php?amount=1';
    if (triviaData[channel].category !== -1) {
      getTriviaURL += '&category=' + triviaData[channel].category;
    }
    if (triviaData[channel].difficulty !== -1) {
      getTriviaURL += '&difficulty=' + triviaData[channel].difficulty;
    }
    if (triviaData[channel].type !== -1) {
      getTriviaURL += '&type=' + triviaData[channel].type;
    }
    getTriviaURL += '&encode=url3986';
    gFunc.readHttps(getTriviaURL).then( result => {
      result = JSON.parse(result);
      switch (result.response_code) {
        case 0:
          // normal functions
          let startMsg = '';
          const time = Date.now();
          const objName = channel + '-' + time;
          const endTime = time + triviaData[channel].time;
          saveChatArray[objName] = {
            channel: channel,
            time: time,
            endTime: endTime,
            messages: []
          };
          if (triviaData[channel].category === -1) {
            startMsg += '[' + decodeURIComponent(result.results[0].category) + '] ';
          }
          if (triviaData[channel].difficulty === -1) {
            startMsg += '(' + result.results[0].difficulty + ') ';
          }
          if (result.results[0].type === 'boolean'){
            // true or false questions
            startMsg += 'True or False: ' + decodeURIComponent(result.results[0].question);
            client.say(channel, startMsg);
            setTimeout(() => {
              const addMsg = Trivia.evalAns(saveChatArray, objName, result.results[0].correct_answer);
              client.say(channel, 'Correct answer was: ' + result.results[0].correct_answer + addMsg);
            }, triviaData[channel].time);
          } else {
            // mulitple choice
            const ans = result.results[0].incorrect_answers;
            ans.push(result.results[0].correct_answer);
            gFunc.shuffleArray(ans);
            let addMsg = '';
            const letters = ['A','B','C','D'];
            let ans_placement;
            for (let i = 0; i < ans.length; i++){
              if (ans[i] === result.results[0].correct_answer) {
                ans_placement = i;
              }
              addMsg += '[' + letters[i] + ']: ' + decodeURIComponent(ans[i]);
              if (i < ans.length - 1) {
                addMsg += " | ";
              }
            }
            startMsg += decodeURIComponent(result.results[0].question) + ' ' + addMsg;
            client.say(channel, startMsg);
            setTimeout(() => {
              const addMsg = Trivia.evalAns(saveChatArray, objName, letters[ans_placement]);
              client.say(channel, 'Correct answer was: [' + letters[ans_placement] + ']: ' + decodeURIComponent(result.results[0].correct_answer) + addMsg);
            }, triviaData[channel].time);
          }
          break;

        case 1:
          // no results
          client.say(channel, 'no results :( perhaps parameters are too specific?');
          break;

        case 2:
          // invalid parameter
          client.say(channel, 'invalid parameter entered');
          break;

        case 3:
          // token not found
          client.say(channel, 'trivia token not found');
          break;

        case 4:
          // token empty
          client.say(channel, 'trivia token is empty');
          break;

        default:
          client.say(channel, 'unknown error, error code: ' + result.response_code);
          break;
      }

    }, error => {
      client.say(channel, 'trivia API could not be reached');
    });
  },

  // to choose a trivia category
  chooseCat: function (channel, triviaData, catFile, client, message){
    // read category file
    gFunc.readFilePromise(catFile, false).then(data => {
      let triviaCat = JSON.parse(data);
      // only write file if a valid category has been entered
      let writeFile = false;
      // direct comparison
      if (triviaCat.trivia_categories[message]){
        writeFile = true;
      } else {
        // attempt to find category
        message = gFunc.closestObjectAttribute(message, triviaCat.trivia_categories);
        // fails to find just 1 category
        if (message.length !== 1){
          let potentialCats = '';
          // potential overkill for formatting
          for (let i = 0; i < message.length; i++) {
            potentialCats += ('\'' + message[i][1] + '\'');
            if (i < message.length - 2){
              potentialCats += ', ';
            } else if (i === message.length - 2) {
              potentialCats += ', or ';
            }
          }
          client.say(channel, `unsure which category... did you mean ` + potentialCats + '?');
        } else {
          // finds closest category to input
          message = message[0][1];
          writeFile = true;
        }
      }
      if (writeFile){
        triviaData[channel].category = triviaCat.trivia_categories[message];
        const saveFile = triviaData.filePath;
        triviaData = JSON.stringify(triviaData);
        gFunc.writeFilePromise(saveFile, triviaData);
        client.say(channel, `trivia category changed to: ` + message);
      }
    }, error => {
      client.say(channel, 'could not find trivia category file... was it removed?');
    });
  },

  // function to change difficulty
  changeDifficulty: function (channel, triviaData, client, message){
    // very similar to changing category
    // only write file if a valid category has been entered
    let writeFile = false;
    // difficulty object
    const diff = {
      any: -1,
      easy: 'easy',
      medium: 'medium',
      hard: 'hard'
    };
    // direct comparison
    if (diff[message]){
      writeFile = true;
    } else {
      // attempt to find category
      message = gFunc.closestObjectAttribute(message, diff);
      // fails to find just 1 category
      if (message.length !== 1){
        let potentialDiff = '';
        for (let i = 0; i < message.length; i++) {
          potentialDiff += ('\'' + message[i][1] + '\'');
          if (i < message.length - 1){
            potentialDiff += ' | ';
          }
        }
        client.say(channel, `unsure which difficulty... did you mean ` + potentialDiff + '?');
      } else {
        // finds closest category to input
        message = message[0][1];
        writeFile = true;
      }
    }
    if (writeFile){
      triviaData[channel].difficulty = diff[message];
      const saveFile = triviaData.filePath;
      triviaData = JSON.stringify(triviaData);
      gFunc.writeFilePromise(saveFile, triviaData);
      client.say(channel, `trivia difficulty changed to: ` + message);
    }
  },

  changeType: function (channel, triviaData, client, message) {
    const types = {
      'boolean': 'boolean',
      truefalse: 'boolean',
      tf: 'boolean',
      multiplechoice: 'multiple',
      choice: 'multiple',
      any: -1
    };
    // user probably would not type these above so direct use of closestObjectAttribute()
    message = types[gFunc.closestObjectAttribute(message, types)[0][1]];
    triviaData[channel].type = message;
    const saveFile = triviaData.filePath;
    triviaData = JSON.stringify(triviaData);
    gFunc.writeFilePromise(saveFile, triviaData);
    if (message === -1) {
      message = 'any';
    } else if (message === 'boolean') {
      message = 'true or false';
    } else {
      message = 'multiple choice';
    }
    client.say(channel, `trivia type changed to: ` + message);
  },

  changeTime: function (channel, triviaData, client, message) {
    const inputTime = gFunc.stringToMsec(message)[0];
    triviaData[channel].time = inputTime;
    const saveFile = triviaData.filePath;
    triviaData = JSON.stringify(triviaData);
    gFunc.writeFilePromise(saveFile, triviaData);
    client.say(channel, `trivia answer time changed to: ` + inputTime/1000 + ' seconds');
  },

  showConfig: function (channel, triviaData, catFile, client){
    // read category file
    gFunc.readFilePromise(catFile, false).then(data => {
      let triviaCat = JSON.parse(data);
      let msg = 'current config: category: ';
      // doing this the opposite direction as this config code is used less often (less checks with category file)
      for (const category in triviaCat.trivia_categories){
        if (triviaCat.trivia_categories[category] === triviaData[channel].category) {
          msg += category + ' | difficulty: ';
          break;
        }
      }
      if (triviaData[channel].difficulty === -1) {
        msg += 'any | type: ';
      } else {
        msg += triviaData[channel].difficulty + ' | type: ';
      }
      if (triviaData[channel].type === -1) {
        msg += 'any | time allowed: ';
      } else {
        msg += triviaData[channel].type + ' | time allowed: ';
      }
      msg += triviaData[channel].time/1000 + ' seconds';
      client.say(channel, msg);
    }, error => {
      client.say(channel, 'could not find trivia category file... was it removed?');
    });
  }
}