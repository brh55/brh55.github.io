---
layout: post
title: Creating a Discord Magic 8 Ball [Part 2/2]
comments: true
author: brandon
image: assets/images/discord-tutorial-2.png
categories: [discord, development, chatbot, bots]
featured: true
excerpt: The second part of the tutorial will dig into the codebase. Here we will learn the basics of botkit, and how to respond to incoming events.
---

> **Important Links**
>
> - 🎦 YouTube tutorial is available on my YouTube Channel: https://youtu.be/tYNjfvsGnSw
> - `⟨⟩` All code is available on [GitHub.com/brh55/discord-magic-8-ball](https://github.com/brh55/discord-magic-8-ball)
> - [Botkit](https://github.com/howdyai/botkit)
> - [botkit-discord connector](https://github.com/brh55/botkit-discord)

In the [first part of the tutorial](http://brandonhim.com/discord/development/chatbot/bots/2018/12/30/discord-bot-part-1.html), we covered over Discord fundamentals such as registering the application and authorizing the bot within your guild. In this tutorial, we will go over building the Discord chatbot using Botkit with a custom connector.

If this is your first time working with [Botkit](https://github.com/howdyai/botkit), I encourage you to go through the really, really quick ["Get Started"](https://botkit.ai/getstarted.html) walk-through that should take you no more than 5 minutes. Fortunately for the depth of this tutorial, you should be perfectly fine with having no previous knowledge, as we will only be scratching the surface on Botkit.

> 💡
>
> If you are wondering why you would use Botkit over other chatbot frameworks, the key benefits support for all major platforms, and a very robust pipeline that is easy to customize and extend. On top of that it's used in many production quality chatbots.

### "Beep! Bop!" — Err... I mean let's get started

Start by creating a directory with the name of your project since it's always a good idea to maintain proper organization. Change your directory into your newly created folder.

```bash
$ mkdir discord-magic-8
$ cd discord-magic-8
```

Like any Node.js project, it's probably a good idea to start with `npm init` to configure your `package.json` to save your dependencies and metadata.

```bash
$ npm init
```

Enter through the prompts as usual, once that's done, you'll need to install the `botkit-discord` connector as a dependency.

```bash
$ npm install --save botkit-discord
```

As you may know or may not know, Botkit actually doesn't support Discord. As a result, I've created a custom connector that will allow you to focus on writing Botkit-centric code without having to worry about the Discord API. If you would like more information regarding the connector, feel free to check out the [botkit-discord repository](https://github.com/brh55/botkit-discord).

Once the dependency is done downloading, we can create our entry file, `index.js` and open it with your favorite text editor.

```bash
$ touch index.js
```

Once we are in the `index.js` file, begin by importing the connector and create a configuration object with a `token` property set to your Discord bot token *(if you don't know how to obtain this token, refer to part 1).*

```js

const discordBotkit = require('botkit-discord');

const configuration = {
	token: 'YOUR_DISCORD_TOKEN'
};
```

We will now initialize the bot and pass along the configuration object to our connector:

```js
// This can be known as your controller 
const discordBot = discordBotkit(configuration); 
```

Before we go any further, it's recommended we test to ensure the bot is actually working and that our token is valid. Honestly, this is a good habit to do before delving deeply into any project, as it can prevent any potential issues stemming from an invalid token.

One quick check is to run the `index.js` file and check terminal logs that the bot has is connected: `node index.js`

![image-20190123224911187](/var/folders/0m/mv8rkvws4cv2d9qgrlf195qm0000gp/T/abnerworks.Typora/image-20190123224911187.png)

You should see a "info: Logged in as [Bot Username] - [Bot Id]"

Next let's have our bot respond to a simple "hello world" when we direct message it (`direct_message`) — this is a good check for many reasons, but also a good way to get acclimated with the Botkit API.

We do this by using the `controller.hears` to set a trigger for "hello world" in response to `direct_message` events, and using the `bot` in our callback to reply back to the user with "testing".

```js
// The connector supports other types as well
discordBot.hears('hello world', direct_message, (bot, message) => {
    // ! Do not forget to pass along the message as the first parameters
	bot.reply(message, 'testing');
});
```

>**Botkit Knowledge**
>
>The hears method is a specific event listener method designed to handle phrases and keywords in particular. It's parameters are as followed...
>
>`.hears(patterns, types, middleware, callback)`
>
>The callback function will be executed with a `bot` and `message` input. The `bot` will provide additional features like reply, say, etc, and the `message` object will provide important data pertaining to our discord message.
>
>As you can see, it's advance enough to allow a significant amount of patterns or keywords and flexibility with the middleware, but simple enough to handle immediately.

Hop into your Discord guild, and let's direct message the bot with "hello world" to ensure this is working!

![Screen Shot 2019-01-23 at 10.57.10 PM](/Users/brhim/Desktop/Screen Shot 2019-01-23 at 10.57.10 PM.png)

Once we verified this is working, we can begin writing the simple logic to do all the wonderful "magic 8 ball"…***magic***.

Let's start by setting our pattern within the hears method to a wildcard match, `.*`, this will allow the bot to respond to all messages. However, we need to decide what type of messages we really want our bot to respond to, the connector currently supports 4 types of events: 

| Event          | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| ambient        | a channel the bot is in has a new message                    |
| direct_message | the bot received a direct message from a user                |
| direct_mention | the bot was addressed directly in a channel ("@bot hello")   |
| mention        | the bot was mentioned by someone in a message ("hello @bot") |

In this case, I just want my bot to reply to any `mentions` within a guild chat, however, feel free to change this to however your needs may be. *(in example:  `["direct_message", "direct_mention"]`)*

https://gist.github.com/a246ec9ca185026c91fbdb38395558b7

Let's start to assemble an array of responses that we want our bot to reply:

```js
const responses = [
    "It is certain",
    "It is decidedly so",
    "Without a doubt",
    "Yes – definitely",
    "You may rely on it",
    "As I see it",
    "yes",
    "Most Likely",
    "Outlook good",
    "Yes",
    "Signs point to yes"
];
```

Update this to whatever you want your bot to say — add some troll phrases if you please ;).

Let's now generate a *"random"* index, which we will use the random index to fetch a random response for our magic 8 ball.

```js
const randomIndex = Math.floor(Math.random() * responses.length);

bot.reply(message, responses[randomIndex]);
```

When we put it all together, our handler and our entire index.js file should look something like this:

```js
const discordBotkit = require('botkit-discord');

const configuration = {
	token: 'YOUR_DISCORD_TOKEN'
};

const discordBot = discordBotkit(configuration);

discordBot.hears('.*', 'mention', (bot, message) => {
	const responses = [
		"It is certain",
		"It is decidedly so",
		"Without a doubt",
		"Yes – definitely",
		"You may rely on it",
		"As I see it",
		"yes",
		"Most Likely",
		"Outlook good",
		"Yes",
		"Signs point to yes"
	];

	const randomIndex = Math.floor(Math.random() * responses.length);
	bot.reply(message, responses[randomIndex]);
});
```

Once you have everything correct, you can simply the `index.js` file and you'll have a working magic 8 ball! Simply **tag** it within your question, and watch the answers to your problems appear before your eyes.

If your anything like me, you'll know that food choices are the best thing to ask:

![gif result](http://g.recordit.co/LcxwLxfBMw.gif)
