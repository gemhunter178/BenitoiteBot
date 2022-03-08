// command line input menu for testing things
require = require('esm')(module);
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

readline.question('run what test? ', test => {
  test = test.toLowerCase();
  switch (test) {
    case 'cooldown':
      console.log('running cooldown startup test')
      module.exports = require('./cooldown_test.js');
      break;
    default:
      console.log(`${test} is not a runnable test from this menu, please try again`);
      break;
  }
  readline.close();
})