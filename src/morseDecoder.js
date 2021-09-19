// function for morse encode/decoding

export function MORSE(client, channel, user, query){
  if (query === ''){
    query = `we're going to need something to translate...`;
  } /* [moved help to command definitions] else if (query === 'help') {
    query = `use plain text or '.', '-', and '_' (for spaces) as a query!`;
  } */ else {
    if(['.','-','_'].includes(query[0])){
      //probably a morse to word
      //handle when underscores aren't space seperated
      query.replace(/_/g,' _ ');
      query.replace(/\s+/g,' ');
      const toWord = {
        '.-': 'A',
        '-...': 'B',
        '-.-.': 'C',
        '-..': 'D',
        '.': 'E',
        '..-.': 'F',
        '--.': 'G',
        '....': 'H',
        '..': 'I',
        '.---': 'J',
        '-.-': 'K',
        '.-..': 'L',
        '--': 'M',
        '-.': 'N',
        '---': 'O',
        '.--.': 'P',
        '--.-': 'Q',
        '.-.': 'R',
        '...': 'S',
        '-': 'T',
        '..-': 'U',
        '...-': 'V',
        '.--': 'W',
        '-..-': 'X',
        '-.--': 'Y',
        '--..': 'Z',
        '.----': '1',
        '..---': '2',
        '...--': '3',
        '....-': '4',
        '.....': '5',
        '-....': '6',
        '--...': '7',
        '---..': '8',
        '----.': '9',
        '-----': '0',
        _: ' ',
        '|': ' '
      };
      query = query.split(' ');
      for (let i = 0; i < query.length; i++){
        if (toWord.hasOwnProperty(query[i])){
          query[i] = toWord[query[i]];
        }
      }
      query = 'text: ' + query.join('');
    } else {
      //probably a word to morse
      query = query.toUpperCase();
      const toMorse = {
        A: '.-',
        B: '-...',
        C: '-.-.',
        D: '-..',
        E: '.',
        F: '..-.',
        G: '--.',
        H: '....',
        I: '..',
        J: '.---',
        K: '-.-',
        L: '.-..',
        M: '--',
        N: '-.',
        O: '---',
        P: '.--.',
        Q: '--.-',
        R: '.-.',
        S: '...',
        T: '-',
        U: '..-',
        V: '...-',
        W: '.--',
        X: '-..-',
        Y: '-.--',
        Z: '--..',
        1: '.----',
        2: '..---',
        3: '...--',
        4: '....-',
        5: '.....',
        6: '-....',
        7: '--...',
        8: '---..',
        9: '----.',
        0: '-----',
        ' ': '|'
      };
      query = query.split('');
      for (let i = 0; i < query.length; i++){
        if (toMorse.hasOwnProperty(query[i])){
          query[i] = toMorse[query[i]];
        }
      }
      query = 'morse: ' + query.join(' ');
      if (query.length > 500) {
        query = query.slice(0,470);
        query += '[exceeds char limit]';
      }
    }
  }
  client.say(channel, query);
}

//silly little thing above but with the regional indicators
export function BLOCKLETTER (client, channel, user, query) {
  const toBlockLetter = {
    A: '🇦',
    B: '🇧',
    C: '🇨',
    D: '🇩',
    E: '🇪',
    F: '🇫',
    G: '🇬',
    H: '🇭',
    I: '🇮',
    J: '🇯',
    K: '🇰',
    L: '🇱',
    M: '🇲',
    N: '🇳',
    O: '🇴',
    P: '🇵',
    Q: '🇶',
    R: '🇷',
    S: '🇸',
    T: '🇹',
    U: '🇺',
    V: '🇻',
    W: '🇼',
    X: '🇽',
    Y: '🇾',
    Z: '🇿',
    '!': '❕',
    '?': '❔',
    ' ': '⠀'
  };
  query = query.toUpperCase();
  query = query.split('');
  for (let i = 0; i < query.length; i++){
    if (toBlockLetter.hasOwnProperty(query[i])){
      query[i] = toBlockLetter[query[i]];
      if (!(query[i] === '❕' || query[i] === '❔')) {
        query[i] += ' ';
      }
      /* previously made to include blood symbols but they look awful on twitch
      if(!toBlockLetter[query[i]].includes(',')){
        query[i] = toBlockLetter[query[i]];
      } else {
        // note this only works for two characters since that's the most each entry has
        const temp = toBlockLetter[query[i]].split(',');
        query[i] = ((Math.random() > 0.5) ? temp[0] : temp[1]);
      }
      query[i] += '%20';
      */
    }
  }
  query = query.join('');
  query = decodeURIComponent(query);
  if (query.length > 500) {
    query = query.slice(0,470);
    query += '[exceeds char limit]';
  }
  client.say(channel, query);
}