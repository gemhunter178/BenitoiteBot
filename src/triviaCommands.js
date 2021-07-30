export const trivia = {
  readSite: function (site) {
    const promise = new Promise ((resolve,reject) => {
      let https = require('https');
      https.get(site, (response) => {
        let str = '';
        response.on('data', function (appendStr) {
          str += appendStr;
        });
        response.on('end', function () {
          resolve(str);
        });
      }).on("error", (err) => {
        console.log(err.message);
        reject(err);
      });
    });
    return promise;
  },
  
  writeFilePromise: function (fs, data, fileName) {
    let promise = new Promise ((resolve, reject) => {
      fs.writeFile(fileName, data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(fileName + ' updated.');
        }
      });
    });
    return promise;
  },
  
  getCat: function (fs, files) {
    // fetch current time
    const current_time = Date.now();
    
    // resolves a bool of whether the file should be updated, cooldown of a day.
    let checkFile = new Promise ((resolve, reject) => {
      fs.readFile(files.triviaCatFile, 'utf8', (err, data) => {
        if (err) {
          // if not
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
        let newData = this.readSite('https://opentdb.com/api_category.php');
        newData.then( result => {
          result = JSON.parse(result);
          result.retrivalTime = current_time;
          result = JSON.stringify(result);
          this.writeFilePromise(fs, result, files.triviaCatFile).then(resultWrite => {
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
  }
}