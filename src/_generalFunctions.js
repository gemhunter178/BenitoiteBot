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
  Levenshtein: function (string1, string2) {
    const len = string2.length;
    let test1 = Array(len + 1).fill(null);
    // initialize row 0
    for (let i = 0; i <= len; i++) {
      test1[i] = i;
    }
    for (let i = 0; i < string1.length; i++) {
    	const test2 = Array(len + 1).fill(null);
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
  // will do a case insensitive search (utilizing .toLowerCase())
  closestObjectAttribute: function (inputString, inputObject) {
    let maxMatch = [];
    for (const attribute in inputObject) {
      let lDist = this.Levenshtein(inputString.toLowerCase(), attribute.toLowerCase());
      // weighting for longer attributes
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
  },
  
  // attempts to parse a string to ms
  // returns an array where index 0 is the interpretted time in ms and additional values are unknown units
  stringToMsec: function (inputString) {
    // longer matches have to be handled first (ms vs s)
    inputString = inputString.replace(/\s*m[il]*sec(ond)*s*/ig, 'ms');
    inputString = inputString.replace(/\s*sec(ond)*s*/ig, 's');
    inputString = inputString.replace(/\s*min(ute)*s*/ig, 'm');
    inputString = inputString.replace(/\s*h(ou)*rs*/ig, 'h');
    inputString = inputString.replace(/\s*d(ay)*s*/ig, 'd');
    inputString = inputString.replace(/\s*w(ee)*k*s*/ig, 'w');
    // non-leap years
    inputString = inputString.replace(/\s*y(ea)*rs*/ig, 'y');
    // will be rounded to = 30 days
    inputString = inputString.replace(/\s*mo(nth)*s*/ig, 'mo');
    while(inputString.search(/\d\s\D/) !== -1) {
      const loc = inputString.search(/\d\s/);
      inputString = inputString.substr(0, loc + 1) + inputString.substr(loc + 2);
    }
    inputString = inputString.split(' ');
    let returnArray = [0];
    let units = {
      ms: 1,
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
      w: 604800000,
      mo: 2592000000,
      y: 31536000000    
    };
    for (let i = 0; i < inputString.length; i++) {
      const unit = inputString[i].replace(/[^a-z]/ig,'');
      if (units.hasOwnProperty(unit)){
        const val = parseFloat(inputString[i]);
        if (isNaN(val)) {
          returnArray.push('[no value]:' + unit);
        } else {
          returnArray[0] += parseInt((val * units[unit]));
        }
      } else if (unit.length === 0){
        // default is seconds
        const val = parseFloat(inputString[i]);
        if (!isNaN(val)) {
          returnArray[0] += parseInt((val * 1000));
        }
      } else {
        returnArray.push(unit);
      }
    }
    return returnArray;
  }
}
