export function CODEWORDGAME(file, fs, user, channel, client, message) {
  
  function findNewWordHttps() {
    const promise = new Promise ((resolve,reject) => {
      let https = require('https');
      https.get('https://www.randomlists.com/data/words.json', (response) => {
        let str = '';
        response.on('data', function (appendStr) {
          str += appendStr;
        });
        
        response.on('end', function () {
          let getWords = JSON.parse(str).data;
          //console.log(getWords);
          resolve(getWords[Math.floor(Math.random()*getWords.length)]);
        });
      }).on("error", (err) => {
        console.log(err.message);
        reject(err);
      });
    })
    return promise;
  }
  
  function testWord(){
    let change = false;
    let samePlace = 0;
    let sameLetter = 0;
    const oldQuery = query;
    const CWLength = cdewrd[channel].length;
    if (query.length < CWLength){
      query = 'The codeword is ' + CWLength + ' characters long. Please enter a query of that length';
    } else {
      query = query.slice(0,CWLength);
      if(query != oldQuery){
        change = true;
      }
      let compareCW = cdewrd[channel].split('');
      query = query.split('');
      for (let i = 0; i < CWLength; i++) {
        if(query[i] === compareCW[i]){
          samePlace++;
          compareCW[i] = '_';
        }
      }
      for (let i = 0; i < CWLength; i++) {
        for (let j = 0; j < CWLength; j++) {
          if (query[i] === compareCW[j]) {
            sameLetter++;
            compareCW[j] = '_';
            break;
          }
        }
      }
      if(samePlace != CWLength){
        query = query.join('') + ' has ' + samePlace + ' character(s) in the same place and ' + sameLetter + ' other matching letter(s) as the codeword.';
      } else {
        query = user['display-name'] + ' has found the codeword! - ' + cdewrd[channel];
        getNewWord(false);
      }
    }
    client.say(channel, query);
  }
  
  function getNewWord(testing) {
    const getWordPromise = findNewWordHttps();
    getWordPromise.then(result => {
      cdewrd[channel] = result;
      try {
        fs.writeFileSync(file, JSON.stringify(cdewrd));
      } catch (err) {
        console.err(err);
      }
      if (testing) {
        testWord();
      }
      return;
    }, error => { 
      console.error('error in getting new word');
      return;
    });
  }
  
  let query = message.replace(/^!+codeword\s*/,'');
  query = query.replace(/\s/,'');
  let cdewrd;
  try {
    const data = fs.readFileSync(file);
    cdewrd = JSON.parse(data);
  } catch (err) {
    console.error(err);
    try {
      fs.writeFileSync(file, '{}');
      console.log(file + ' has been created');
      cdewrd = {};
    } catch (err) {
      console.error(err);
    }
  }
  if(query.length === 0){
    client.say(channel, `Gem's codeword game! Try to guess the codeword by entering a query. *codeword may contain '-'`);
    return;
  }
  if (!cdewrd.hasOwnProperty(channel)){
    getNewWord(true);
  } else {
    testWord();
  }
}