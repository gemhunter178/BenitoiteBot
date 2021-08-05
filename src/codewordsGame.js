import { gFunc } from './_generalFunctions';
// code for the codewords game
export function CODEWORDGAME(file, fs, user, channel, client, message) {
  
  function findNewWordHttps() {
    const promise = new Promise ((resolve,reject) => {
      let newData = gFunc.readHttps('https://www.randomlists.com/data/words.json');
      newData.then( result => {
        result = JSON.parse(result).data;
        resolve(result[Math.floor(Math.random()*result.length)]);
      }, error => {
        reject(error);
      })
    });
    return promise;
  }
  
  function testWord(){
    cdewrd[channel].attempts++;
    let change = false;
    let samePlace = 0;
    let sameLetter = 0;
    let oldQuery = query;
    const CWLength = cdewrd[channel].word.length;
    /* unused since cheesing the game this way isn't actually that helpful
    if (query.length < CWLength){
      query = 'The codeword is ' + CWLength + ' characters long. Please enter a query of that length';
    }*/
    query = query.padEnd(CWLength,'-');
    query = query.slice(0,CWLength);
    if(query != oldQuery){
      change = true;
      oldQuery = query;
    }
    let compareCW = cdewrd[channel].word.split('');
    query = query.split('');
    for (let i = 0; i < CWLength; i++) {
      if(query[i] === compareCW[i]){
        samePlace++;
        query[i] = '*';
        compareCW[i] = '__';
      }
    }
    for (let i = 0; i < CWLength; i++) {
      for (let j = 0; j < CWLength; j++) {
        if (query[i] === compareCW[j]) {
          sameLetter++;
          // console.log('matched ' + compareCW[j]);
          compareCW[j] = '__';
          break;
        }
      }
    }
    if(samePlace != CWLength){
      query = oldQuery + ' has ' + samePlace + ' character(s) in the right position and ' + sameLetter + ' other matching letter(s) as the codeword.';
    } else {
      query = user['display-name'] + ' has found the codeword! -> ' + cdewrd[channel].word + '! This word took ' + cdewrd[channel].attempts + ' attempts. -> a new codeword has now been generated.';
      getNewWord(false);
    }
    client.say(channel, query);
    gFunc.writeFilePromise(fs, file, JSON.stringify(cdewrd));
  }
  
  function getNewWord(testing) {
    const getWordPromise = findNewWordHttps();
    getWordPromise.then(result => {
      cdewrd[channel] = {};
      cdewrd[channel].word = result;
      cdewrd[channel].attempts = 0;
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
  query = query.toLowerCase();
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
  if (!cdewrd[channel]){
    getNewWord(true);
  } else {
    testWord();
  }
}