require = require('esm')(module/*, options*/);
module.exports = require('./_tmiChatBot.js');
setTimeout(function() {
  // module.exports = require('./_eventListener.js'); // enable for channel follow logs
}, 2500);
