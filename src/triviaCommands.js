import { gFunc } from './_generalFunctions';
// new trivia commands??? https://opentdb.com/api_config.php
export const Trivia = {
  getCat: function (fs, file, force) {
    // fetch current time
    const current_time = Date.now();
    // check if forcing a update
    force = force.match(/force/i);
    
    // resolves a bool of whether the file should be updated, cooldown of a day.
    let checkFile = new Promise ((resolve, reject) => {
      if (force != null) {
        console.log('forcing trivia category update');
        resolve(true);
      }
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          // if no file exists
          console.log('no trivia category file found, creating a new one');
          // attempt to make file later
          resolve(true);
        } else {
          // on successful read file
          data = JSON.parse(data);
          // timeout for cache
          if (current_time - data.retrivalTime > 86400000) {
            console.log('category file is more than a day old, refreshing.');
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
          gFunc.writeFilePromise(fs, file, formatCategories).then(resultWrite => {
            console.log(resultWrite); 
          }, errorWrite => {
            console.log(errorWrite)
          });
        }, error => {
          console.log(error);
        });
      } else {
        console.log('using cached trivia categories');
      }
    }, error => {
      console.log(error);
    });
  },

  // used to initialize the trivia file. note 'channels' is the list of all channels the bot is in
  initialize: function (fs, channels, file){
    let triviaData;
    gFunc.readFilePromise(fs, file, true).then(data => {
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
      console.log(error);
      return 1;
    }).then(result => {
      if (result === 1){
        return;
      } else {
        result = JSON.stringify(result);
        gFunc.writeFilePromise(fs, file, result);
      }
    });
  },

  // command that calls the other commands (use this in the chatbot command)
  useCommand: function (fs, channel, dataFile, catFile, client, message, saveChatArray) {
    if (message.length === 0) {
      client.say(channel, 'trivia, powered by opentdb.com! options: \'start\', \'category\', \'difficulty\', \'type\', \'time\', \'config\'');
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
      config: 6
    }
    message = message.split(' ');
    message[0] = message[0].toLowerCase();
    if (comList[message[0]]){
      // only activates if a case insensitive match is found
      const opt = comList[message[0]];
      message.splice(0,1);
      message = message.join(' ');
      gFunc.readFilePromise(fs, dataFile, false).then(data => {
        let triviaData = JSON.parse(data);
        switch (opt) {
          case 1:
            this.start(fs, channel, triviaData, client, saveChatArray);
            break;

          case 2:
            this.chooseCat(fs, channel, triviaData, catFile, client, message);
            break;

          case 3:
            this.changeDifficulty(fs, channel, triviaData, client, message);
            break;

          case 4:
            this.changeType(fs, channel, triviaData, client, message);
            break;

          case 5:
            this.changeTime(fs, channel, triviaData, client, message);
            break;
            
          case 6:
            this.showConfig(fs, channel, triviaData, catFile, client);
            break;
        }
      }, error => {
        client.say(channel, 'could not find trivia data file... was it removed?');
      }); 
    } else {
      // tries to be helpful and gives closest option
      message = gFunc.closestObjectAttribute(message[0], comList);
      let potentialComs = '';
      // potential overkill for formatting
      for (let i = 0; i < message.length; i++) {
        potentialComs += ('\'' + message[i][1] + '\'');
        if (i < message.length - 2){
          potentialComs += ', ';
        } else if (i === message.length - 2) {
          potentialComs += ', or ';
        }
      }
      client.say(channel, `unsure which option... did you mean ` + potentialComs + '?');
      return;
    }
  },

  start: function (fs, channel, triviaData, client, saveChatArray){
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
    client.say(channel, getTriviaURL);
    //gFunc.readHttps(&category=15&difficulty=easy&type=multiple);
  },

  // to choose a trivia category
  chooseCat: function (fs, channel, triviaData, catFile, client, message){
    // read category file
    gFunc.readFilePromise(fs, catFile, false).then(data => {
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
        gFunc.writeFilePromise(fs, saveFile, triviaData);
        client.say(channel, `trivia category changed to: ` + message);
      }
    }, error => {
      client.say(channel, 'could not find trivia category file... was it removed?');
    });
  },
  
  // function to change difficulty
  changeDifficulty: function (fs, channel, triviaData, client, message){
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
      gFunc.writeFilePromise(fs, saveFile, triviaData);
      client.say(channel, `trivia difficulty changed to: ` + message);
    }
  },
  
  changeType: function (fs, channel, triviaData, client, message) {
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
    gFunc.writeFilePromise(fs, saveFile, triviaData);
    client.say(channel, `trivia type changed to: ` + message);
  },
  
  changeTime: function (fs, channel, triviaData, client, message) {
    const inputTime = gFunc.stringToMsec(message)[0];
    triviaData[channel].time = inputTime;
    const saveFile = triviaData.filePath;
    triviaData = JSON.stringify(triviaData);
    gFunc.writeFilePromise(fs, saveFile, triviaData);
    client.say(channel, `trivia answer time changed to: ` + inputTime/1000 + ' seconds');    
  },
  
  showConfig: function (fs, channel, triviaData, catFile, client){
    // read category file
    gFunc.readFilePromise(fs, catFile, false).then(data => {
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