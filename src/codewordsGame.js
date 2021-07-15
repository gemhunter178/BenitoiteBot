export function CODEWORDGAME(file, fs, user, channel, client, message) {
  let query = message.replace(/^!+codeword\s+/,'');
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
  if (!cdewrd.hasOwnProperty(channel)){
    let word = 'test';
    let https = require('https');
    https.get('https://www.randomlists.com/data/words.json', (response) => {
      let str = '';
      response.on('data', function (appendStr) {
        str += appendStr;
      });
      
      response.on('end', function () {
        console.log(str);
        word = JSON.parse(str).data;
      });
    }).on("error", (err) => {
      console.log(err.message);
    });
    word = word[Math.floor(Math.random()*word.length)];
    cdewrd[channel] = word;
    console.log(cdewrd);
    try {
      fs.writeFileSync(file, JSON.stringify(cdewrd));
    } catch (err) {
      console.err(err);
    }
  }
  client.say(channel, cdewrd[channel]);
}