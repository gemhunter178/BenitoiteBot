import { gFunc } from './_generalFunctions';

// functions related to internet jargon and such
export const InternetLang = {
  // tone indicators. source: https://toneindicators.carrd.co/
  tone_ind: {
    j: 'joking',
    hj: 'half-joking',
    s: 'sarcastic',
    gen: 'genuine',
    g: 'genuine',
    srs: 'serious',
    nsrs: 'non-serious',
    pos: 'positive connotation',
    pc: 'positive connotation',
    neu: 'neutral connotation',
    neg: 'negative connotation',
    nc: 'negative connotation',
    p: 'platonic',
    r: 'romantic',
    c: 'copypasta',
    l: 'lyrics',
    ly: 'lyrics',
    lh: 'light-hearted',
    nm: 'not mad',
    lu: 'a little upset',
    nbh: 'for when you\'re vagueposting or venting, but it\'s directed at nobody here (none of your followers)',
    nsb: 'not subtweeting',
    sx: 'sexual intent',
    x: 'sexual intent',
    nsx: 'non-sexual intent',
    nx: 'non-sexual intent',
    rh: 'rhetorical question',
    rt: 'rhetorical question',
    t: 'teasing',
    ij: 'inside joke',
    m: 'metaphorically',
    li: 'literally',
    hyp: 'hyperbole',
    f: 'fake',
    th: 'threat',
    cb: 'clickbait'
  },
  
  // looks through tone_ind above and gives best results
  searchToneInd: function (channel, client, message) {
    message = message.toLowerCase();
    message = message.replace(/\//g,'');
    if (this.tone_ind[message]){
      client.say(channel, '[inidcator found]: /' + message + ' means ' + this.tone_ind[message]);
      return;
    } else {
      message = gFunc.closestObjectAttribute(message, this.tone_ind);
      if (message.length === 1){
        message = message[0][1];
        client.say(channel, '[inidcator found]: /' + message + ' means ' + this.tone_ind[message]);
        return;
      } else {
        let indMsg = 'no indicator found, did you mean: ';
        // taken from triviaCommands.js
        for (let i = 0; i < message.length; i++) {
          indMsg += ('\'/' + message[i][1] + '\'');
          if (i < message.length - 2){
            indMsg += ', ';
          } else if (i === message.length - 2) {
            indMsg += ', or ';
          }
        }
        client.say(channel, indMsg);
        return;
      }
    }
  }
}