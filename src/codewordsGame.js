export function CODEWORDGAME(file, fs, user, channel, client, message) {
  let query = message.replace(/^!codeword\s+/,'');
  query = query.replace(/\s/,'');
  let cdewrd;
  let access = false;
  let timeout = 0;
  while(!access){
    try {
      const data = fs.readFileSync(file);
      cdewrd = JSON.parse(data);
      access = true;
    } catch (err) {
      console.error(err);
      try {
        fs.writeFileSync(file, '{}');
        console.log(file + ' has been created');
      } catch (err) {
        console.error(err);
      }
    }
    if (timeout > 10) {
      console.log('tries to write file exceeded');
      client.say(channel, `error reading codeword file!`);
      return;
    }
    timeout++;
  }
  if(!cdewrd.hasOwnProperty(channel)){
    let word = 'test';
    //word = word[Math.floor(Math.random()*word.length)];
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