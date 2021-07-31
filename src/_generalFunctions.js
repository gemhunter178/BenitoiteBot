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
  
  // returns a promise with the data in the file
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
          // on successful read file
          resolve(data);
        }
      });
    });
    return promise;
  },
  
  // a 2 matrix row implementation of Levenshtein
  Levenshtein: function(string1, string2) {
    let len = string2.length;
    let test1 = Array(len + 1).fill(null);
    //initialize row 0
    for (let i = 0; i <= len; i++) {
      test1[i] = i;
    }
    for (let i = 0; i < string1.length; i++) {
    	let test2 = Array(len + 1).fill(null);
      test2[0] = i + 1;
      for (let j = 0; j < len; j++) {
        const change = string1[i] === string2[j] ? 0 : 1;
        test2[j + 1] = Math.min(test1[j + 1] + 1, test2[j] + 1, test1[j] + change);
      }
      test1 = test2;
    }
    return test1[len];
  },
      
  // returns an array of weighted minimum distances and their associated attribute
  closestObjectAttribute: function(inputString, inputObject) {
    let maxMatch = [];
    for (const attribute in inputObject) {
      let lDist = this.Levenshtein(inputString, attribute);
      //weighting for longer attributes
      if (attribute.length > inputString.length) {
        lDist = lDist - Math.floor((attribute.length - inputString.length) * 0.75);
      }
      if (maxMatch.length === 0) {
        maxMatch = [
          [lDist, attribute]
        ];
      } else if (lDist < maxMatch[0][0]) {
        maxMatch = [
          [lDist, attribute]
        ];
      } else if (lDist === maxMatch[0][0]) {
        maxMatch.push([lDist, attribute]);
      }
    }
    return maxMatch;
  }
}
