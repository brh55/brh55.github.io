---
layout: post
title: Creating a Pokédex Chatbot in Discord (Part 1)
comments: true
author: brandon
image: assets/images/pokedex-tutorial.jpg
categories: [discord, development, chatbot, bots, pokemon]
featured: true
excerpt: The first part of this tutorial will cover over gathering requirements, and defining our Pokedex chatbot
---

# Creating a Pokédex Chatbot in Discord (Part 1)

![Image result for professor oak introduction game](https://i.pinimg.com/originals/c5/59/9e/c5599efc1e9a7d4787050c0c396e572b.png)

> Hello there! Welcome to the world of Pokémon! My name is Brandon! People call me the chatbot professor! This world is inhabited by intelligent creatures called chatbots! For some people, chatbots are tools. Others use them for fun. Myself...I study chatbots as a profession.

Now before we get started with even coding the project, we must go over the simple features of a Pokédex and decide which features we want to include in our project. This will help limit the scope of our project and have a vision of what the first iteration of our project is going to look like.

### Gathering Project Requirements

This process is generally skipped for developers when starting a side project, but it can save so much time in the long run. Honestly, I will be first to admit that everyone tends to do this differently, but my primary goals are to simply establish what we can and will create.

#### First Step: Researching
In the show, there are many moments when Ash uses his Pokédex, here’s a video of what happens (also one of my favorite episodes):

> [📹 Watch the Scene](https://youtu.be/rTYzdr-AtM0)

During this scene we learn that the Pokedex does a few things:

- Pokemon Recognition (Image Recognition)
- Shows a Pokemon Avatar
- Speaks to You (Text-To-Speech)

Without a doubt, creating all these features would be cool, however, this tutorial would get pretty darn lengthy. So let's focus on displaying the avatar and supporting speech output since Discord has a strong text and voice functionality built-in, which makes it perfect for our chatbot!

But for many of us, a Pokedex wouldn't truly be complete without drawing some inspiration from our childhood past time, Pokemon on the Gameboy!

![tumblr_osna80K7LT1rl04amo1_250](https://cdn-images-1.medium.com/max/1600/1*6LX1j07RHUcf_SI53rm6Zg.gif)

> A gif displaying the infamous Pokedex from Pokemon Green (found in Blue and Red variants)

This gives us some pretty fun, yet useful information regarding each Pokemon. In the Pokedex screen we notice the following:

- Pokemon Number - (No. XXX)
- Name
- Sprite/Avatar
- Category
- Height - Ft' Inches"
- Weight - lbs

With that being said, by including these features, we will have a fairly robust, yet do-able version of the Pokedex.

#### Second Step: Limit Project Scope

Now if we gather all of our initial research, we can finalize the scope of our Pokedex to only include the following set of features/functionalities:

- Give Pokemon Information
  - Display
    - Pokemon Number - (No. XXX)n
    - Name
    - Sprite/Avatar
    - Category
    - Height - Ft' Inches"
    - Weight - lbs
  - Speak (Voice Functionality)
    - "**[Name],** the **[category]** pokemon, **[species description].**
      (https://www.youtube.com/watch?v=u_R-KfBlCIE)"
- Not Found Error Handling
  - Displays "No Data"

>  ✏️ **Note**: "No Data" 
>
> It's good to think about a minimum "default" action that occurs when users try to perform unsupported actions or unrecognizable intents.
>
> Fortunately, the Pokedex defaults to a "No Data" action when Ash attempts to point to something the Pokedex doesn't understand!


**Alrighty**! Now we can begin to code!

wait, wait… hold your ponyta.

Let's take a bit of time to mock out what our bot is going to output to the users. This is going to save us tremendous time and help give us an idea of what the bot is going to "feel" like.

### Design Process

Traditionally, this is when we would start to create a simple wireframe on the user flow. Unfortunately, I couldn't find any Discord mock-up generators to create a preview of our conversation flow, so I'll just follow a simple trigger to output format to lay out all the potential interactions:`Trigger Message` -> `Outcome`

#### Interactions / Triggers

- !pokedex <pokemon>  → Return Pokemon Information
- !pokedex <pokemon #> → Return Pokemon Information
- !pokedex <misc text> → Display Error Message

Simple, but more than suitable for our needs, now let's establish what our "Display Pokemon Information" is going to look like.

#### Return Pokemon Information

Since this is the most "visual" piece of our interaction, it's a good idea to create a visual representation to display what we intend to show our user.

In this tutorial, we will be using the Discord embed visualizer created by [leovoel](https://github.com/leovoel) and take the gif from above try to translate it in the visualizer. Typically sketching works fine, but our chat platform has innate visual constraints, which the visualizer helps us work within.

> ✏️ **Note** 
>
> In traditional app or web development, we would call this a ***high-fidelity*** mock-up. A highly detailed mock-up that gives us a near-production representation.

In addition to knowing our constraints, we have a quicker feedback loop without having to do code changes and testing on our application end.

After coming up with several variations, this is the final design that I've come up with:

![final design](https://cdn-images-1.medium.com/max/1600/1*Qu8ZhtqYLai02HDpuCKyAQ.png)

Splendid! Now that we know what features are going to be included, and what our bot is going to look like, we have enough to finally begin coding towards our Pokédex in Discord.

Stay tuned for the second part of the tutorial.
