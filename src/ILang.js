import { gFunc } from './_generalFunctions';

// functions related to internet jargon and such
export const InternetLang = {
  // tone indicators. source: https://toneindicators.carrd.co/ and https://tonetags.carrd.co/
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
    a: 'alterous',
    r: 'romantic',
    c: 'copypasta',
    l: 'lyrics',
    ly: 'lyrics',
    lh: 'light-hearted',
    nm: 'not mad',
    lu: 'a little upset',
    nbh: 'nobody here',
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
    cb: 'clickbait',
    q: 'quote',
    ot: 'off topic',
    nbr: 'not being rude',
    ay: 'at you',
    nay: 'not at you',
    nf: 'not forced',
    ref: 'reference',
    sarc: 'sarcastic'
  },
  
  // looks through tone_ind above and gives best results
  searchToneInd: function (client, channel, user, query) {
    query = query.toLowerCase();
    query = query.replace(/\//g,'');
    if (InternetLang.tone_ind[query]){
      client.say(channel, '[inidcator found]: /' + query + ' means ' + InternetLang.tone_ind[query]);
      return;
    } else {
      query = gFunc.closestObjectAttribute(query, InternetLang.tone_ind);
      if (query.length === 1){
        query = query[0][1];
        client.say(channel, '[closest indicator known]: /' + query + ' means ' + InternetLang.tone_ind[query]);
        return;
      } else {
        let indMsg = 'no indicator found, did you mean: ';
        // taken from triviaCommands.js
        for (let i = 0; i < query.length; i++) {
          indMsg += ('\'/' + query[i][1] + '\'');
          if (i < query.length - 2){
            indMsg += ', ';
          } else if (i === query.length - 2) {
            indMsg += ', or ';
          }
        }
        client.say(channel, indMsg);
        return;
      }
    }
  }
}