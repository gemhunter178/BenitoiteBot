// Test execution of new cooldown versions. Creates a copy of new cooldowns in the 'test' folder without affecting the original cooldown file or connecting to twitch.

'use strict';
import fs from 'fs';
import { gFunc } from '../src/_generalFunctions.js';
import { files } from '../src/filePaths.js';
import { Cooldown } from '../src/cooldown.js';
import { CHANNELS } from '../src/constants.js';

// COOLDOWN initialization
let cooldown;

// read cooldown file has to be sync before everything else
try {
  const data = fs.readFileSync(files.cooldown);
  cooldown = JSON.parse(data);
} catch (err) {
  console.log(gFunc.mkLog('init', '%GENERAL') + 'cooldown file not found, generating a new one');
  try {
    fs.writeFileSync(files.cooldown, '{}');
    console.log(gFunc.mkLog('init', '%GENERAL') + files.cooldown + ' has been created');
    cooldown = {};
  } catch (err) {
    console.error(err);
  }
}

// imitate alteration done by tmi.js to channel array
CHANNELS.forEach(function(channel, index) {
  this[index] = '#' + channel;
}, CHANNELS)

// add a test channel to test initializations
CHANNELS.unshift('■■■testInit■■■');

// initialize values for new channels
Cooldown.init_new(cooldown, CHANNELS);

// save created config above to test directory
Cooldown.saveCooldownFile(cooldown, './test/cooldown.json');