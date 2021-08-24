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