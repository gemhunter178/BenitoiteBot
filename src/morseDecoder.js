export function MORSE(user, channel, client, message){
  if (message === ''){
    message = `we're going to need something to translate...`;
  } else if (message === 'help') {
    message = `use plain text or '.', '-', and '_' (for spaces) as a query!`;
  } else {
    if(['.','-','_'].includes(message[0])){
      //probably a morse to word
      //handle when underscores aren't space seperated
      message.replace(/_/g,' _ ');
      message.replace(/\s+/g,' ');
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
        '⠀': ' '
      };
      message = message.split(' ');
      for (let i = 0; i < message.length; i++){
        if (toWord.hasOwnProperty(message[i])){
          message[i] = toWord[message[i]];
        }
      }
      message = ' ' + message.join('');
    } else {
      //probably a word to morse
      message = message.toUpperCase();
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
        ' ': '⠀'
      };
      message = message.split('');
      for (let i = 0; i < message.length; i++){
        if (toMorse.hasOwnProperty(message[i])){
          message[i] = toMorse[message[i]];
        }
      }
      message = 'morse: ' + message.join(' ');
      if (message.length > 500) {
        message = message.slice(0,470);
        message += '[exceeds char limit]';
      }
    }
  }
  client.say(channel, message);
}