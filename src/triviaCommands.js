import { gFunc } from './_generalFunctions';
// new trivia commands??? https://opentdb.com/api_config.php
export const trivia = {
  getCat: function (fs, file, force) {
    // fetch current time
    const current_time = Date.now();
    // check if forcing a update
    force = force.match(/force/i);
    
    // resolves a bool of whether the file should be updated, cooldown of a day.
    let checkFile = new Promise ((resolve, reject) => {
      if (force != null) {
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
          if (current_time - data.retrivalTime > 86400) {
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
          formatCategories.retrivalTime = current_time;
          for (let i = 0; i < result.trivia_categories.length; i++){
            result.trivia_categories[i].name = result.trivia_categories[i].name.replace(/^Entertainment:\s|^Science:\s/, '').replace(/\s*&\s*/g,' and ').toLowerCase();
            formatCategories.trivia_categories[result.trivia_categories[i].name] = result.trivia_categories[i].id;
          }
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
  
  start: function (fs, channel, file){
    
  }
}