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
          //on successful read file
          data = JSON.parse(data);
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
      if(result){
        let newData = gFunc.readHttps('https://opentdb.com/api_category.php');
        newData.then( result => {
          result = JSON.parse(result);
          //reformatting file to be easier to search through later
          let formatCategories = {trivia_categories: {}};
          for (let i = 0; i < result.trivia_categories.length; i++){
            result.trivia_categories[i].name = result.trivia_categories[i].name.replace(/^Entertainment:\s|^Science:\s/, '').replace(/\s*&\s*/g,' and ').toLowerCase();
            formatCategories.trivia_categories[result.trivia_categories[i].name] = result.trivia_categories[i].id;
          }
          formatCategories.trivia_categories.any = -1;
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
            type: -1
          };
        }
      }
      return triviaData;
    }, error => {
      console.log(error);
      return 1;
    }).then(result => {
      if(result === 1){
        return;
      } else {
        result = JSON.stringify(result);
        gFunc.writeFilePromise(fs, file, result);
      }
    });
  },

  start: function (fs, channel, file){
    
  },

  // to choose a trivia category
  chooseCat: function (fs, channel, dataFile, catFile, client, message){
    gFunc.readFilePromise(fs, catFile, false).then(data => {
      let triviaCat = JSON.parse(data);
      gFunc.readFilePromise(fs, dataFile, false).then(data => {
        let triviaData = JSON.parse(data);
        let writeFile = false;
        if (triviaCat.trivia_categories.hasOwnProperty(message)){
          writeFile = true;
        } else {
          message = gFunc.closestObjectAttribute(message, triviaCat.trivia_categories);
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
            message = message[0][1];
            writeFile = true;
          }
        }
        if(writeFile){
          triviaData[channel].category = triviaCat.trivia_categories[message];
          triviaData = JSON.stringify(triviaData);
          gFunc.writeFilePromise(fs, dataFile, triviaData);
          client.say(channel, `trivia category changed to: ` + message);
        }
      }, error => {
        client.say(channel, 'could not find trivia data file... was it removed?');
      });
    }, error => {
      client.say(channel, 'could not find trivia category file... was it removed?');
    });
  }
}