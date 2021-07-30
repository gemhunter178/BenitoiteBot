export const gFunc = {
  readHttps: function (site) {
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
  
  writeFilePromise: function (fs, fileName, data) {
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
  
  //returns a promise with the data in the file
  readFilePromise: function (fs, fileName, createNew) {
    let promise = new Promise ((resolve, reject) => {
      fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
          // if no file exists
          console.log(fileName + ' does not exist, or cannot be accessed.');
          // attempt to make file if createNew is true
          if (createNew) {
            let writeNewFile = this.writeFilePromise(fs, fileName, '{}');
            writeNewFile.then(result => { 
              console.log(fileName + ' created.');
              resolve('{}');
            }, error => {
              reject(error);
            });
          } else {
            reject(err);
          }
        } else {
          //on successful read file
          resolve(data);
        }
      });
    });
    return promise;
  },
  
  //returns the closest item match to input in an object
  closestmatch: function (inputWord, inputObject) {
    
  }
}
