# BenitoiteBot
A twitch chatbot for extra command functionality
Still a work in progress but already includes some helpful and fun functions.
## Getting Started
Currently requires `esm`,`tmi.js`, and `homoglyph-search` libraries.
If one does not have npm (Node package manager) click [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and follow the instructions for your operating system.

Then run:
```
npm init esm
npm i tmi.js
npm i homoglyph-search
```

`constants.sample.js` in `src` should be changed `constants.js` and the data inside should be filled in correctly:

| Variable | Expected content |
| - | - |
| `CLIENT_ID` | a **string** with the client id provided when registering a twitch app. It's not currently required but will be important for future updates.|
| `OAUTH_TOKEN` | a **string** starting with 'oauth:' and followed by the token
| `BOT_USERNAME` | a **string** with the username the bot is attached to in twitch |
| `CHANNELS` | an **array of strings** on what channels the bot should join |
| `OWNER` | a **string** denoting your username, as the 'owner' of the bot |
| `API_KEYS` | an **object** with all the API Keys needed for certain commands. Do note omitting these will just disallow the functionality of some commands, but the bot can still run. |

If you need help on figuring out how to get the above values, consult a video like [this one by Techno Tim](https://www.youtube.com/watch?v=7uSjKbAUHXg) that helped me get started with this bot initially.

Files in the `data` folder should be generated automatically, with the exception of a `ban_list.json`. 
### Starting the bot
With npm, just run `npm run start`.
Alternatively if one has yarn, `yarn start`
### Using the purge command
If one would like to use the purge command provided from this bot to ban a list of people, create a `ban_list.json` and place in an array of strings on what usernames to ban. (Note, will only work in places the bot is a moderator in.) 
Example content: `["user1", "example", "other_user"]`
Do note the purge command is only allowed after the `OWNER` has run the `allowpurge` command in a chat the bot is currently in.
## Bot Reference Page
A bot reference page is currently in development by me, but it should be in [my other website](https://pentagonitestudios.com/benitoitebot.html). 
A current available command list can be found there.