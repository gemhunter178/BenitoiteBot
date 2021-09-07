# BenitoiteBot
A twitch chatbot that was originally created to keep track of !fish records (long story, but it needed to save state) that has since grown to include a few other chat minigames and helpful commands such as a timer that will remind the chat after a certain amount of minutes.

Bot is still being improved and new commands are still in development!

## Getting Started
Currently requires a few libraries installed through npm.
If one does not have npm (Node package manager) click [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and follow the instructions for your operating system.

Then just run:
```
npm install
```
Files in the `data` folder should be generated automatically, with the exception of a `ban_list.json`. 

### Getting bot constants
`constants.sample.js` in `src` should be changed `constants.js` and the data inside should be filled in correctly:

| Variable | Expected content |
| - | - |
| `CLIENT_ID` | a **string** with the client id provided when registering a Twitch app. It's not currently required but will be important for future updates.|
| `OAUTH_TOKEN` | a **string** starting with 'oauth:' and followed by the token
| `BOT_USERNAME` | a **string** with the username the bot is attached to in Twitch |
| `CHANNELS` | an **array of strings** on what channels the bot should join |
| `OWNER` | a **string** denoting your twitch username, in all lowercase, as the 'owner' of the bot. This username would be able to use 'owner only commands' such as `goodbye` (which shuts off the bot) |
| `API_KEYS` | an **object** with all the API Keys needed for certain commands. Do note omitting these will just disallow the functionality of some commands, but the bot can still run. Source of each key noted below|

Do **not** share a filled out version of constants.js, though that should already be reflected in the .gitignore. Anyone with the OAuth token would have whatever scopes ('permissions') given to the bot, such as chatting as that user.

Also in `src`, change `hiddenCommands.sample.js` to  `hiddenCommands.js`. This file works simlarly to `_defCommands.js` except it's not tracked by git. So, commands you do not wish others to see/use may be placed here. An example command is provided, though it's the same format as `_defCommands.js`.

#### Getting CLIENT_ID, and OAUTH_TOKEN
To start, go to the [Twitch developer site](https://dev.twitch.tv/), sign in and go to your console (should be a button on the top right.) In your console, click the 'Applications' tab and hit the 'Register Your Application' button. 

Name it however you like. 

For the OAuth Redirect URL, enter `http://localhost`.

For a Category, this is a 'Chat Bot' and let the site know you're not a robot.

Once that is done, hit the 'Create' button.

An application should have been created. to find the `CLIENT_ID`, click the 'Manage' button of the newly made application and it should be be in a filed named 'Client ID'.

To get an OAuth token, one can use the URL provided in 'OAuth implicit code flow' from [this Twitch devlopers page](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth):
```
https://id.twitch.tv/oauth2/authorize
    ?client_id=<your client ID>
    &redirect_uri=<your registered redirect URI>
    &response_type=<type>
    &scope=<space-separated list of scopes>
```
all <> enclosed variables must be filled in.
| Variable | Fill in with |
| - | - |
| `<your client ID>` | the client id mentioned above |
| `<your registered redirect URI>` | the URL listed in the same manage application page. Following my exmple: `http://localhost`|
| `<type>` | set this to `token` |
| `<space-separated list of scopes>` | see [this page](https://dev.twitch.tv/docs/authentication#scopes) for a list of scopes. These are the scopes that the token will have access to. Try to limit it to whatever you actually need the bot to have access to. Insert pluses (+) between the scopes (see example below.) This bot currently needs `channel:moderate`, `chat:edit`, and `chat:read`|

A filled in URL should look something like
```
https://id.twitch.tv/oauth2/authorize
    ?client_id=example55555555555555555555555
    &redirect_uri=http://localhost
    &response_type=token
    &scope=channel:moderate+chat:edit+chat:read
```
While logged into the account you want the bot to run as (yourself or a dedicated account), enter that URL. It should bring you to a twitch authorization page. Click authorize. Unless something is running directly on localhost, it should give you a page error, but this is expected. Check the URL it redirected to and one should see an `#access_token` field. Copy everything in between `#access_token=` and `&`. This is your token. Replace `<TOKEN_HERE>` in `constants.js` with that token.

If you still need help on figuring out how to get the above values, consult a video like [this one by Techno Tim](https://www.youtube.com/watch?v=7uSjKbAUHXg)

#### Getting API_KEYS
The only current API Key needed for the 'define' command comes from [wordsAPI](https://www.wordsapi.com/) which can be obtained by registering an account on [rapidAPI](https://rapidapi.com/) and taking the X-RapidAPI-Key given in [this wordsAPI API Documentation Page](https://rapidapi.com/dpventures/api/wordsapi/) 

### Starting the bot
With npm, just run 
```
npm run start
```

### Using the purge command
If one would like to use the purge command provided from this bot to ban a list of people, create a `ban_list.json` and place in an array of strings on what usernames to ban. (Note, will only work in places the bot is a moderator in.) 

Example content: `["user1", "example", "other_user"]`

Do note the purge command is only allowed after the `OWNER` has run the `allowpurge` command in a chat the bot is currently listening to.

## Bot Reference Page
A bot reference page is currently in development by me, but it should be in [my other website](https://pentagonitestudios.com/) when finished. 

A current available [command list](https://pentagonitestudios.com/benitoitebot/commands.html) can be found there.