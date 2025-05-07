# Twitch-Tok

### Watch Twitch clips in a **Tik-Tok/Youtube Shorts** style scrolling feed.

### Live Site: [twitch-tok-client.onrender.com](https://twitch-tok-client.onrender.com)

Twitches integration for clips has been largely underdeveloped. There are many possible reasons for why twitch has chosen not to develop clips into a feed-style application and keep clips focused on individual channels and leave propogation and aggregation to social media. 

This web app aims to fill the gap left - allowing you to select a list of games and categories that will generate an _algorithmless_ feed to scroll through the top clips from those channels and categories.

## Basic Usage
1. Visit [the live site](https://twitch-tok-client.onrender.com).
2. Create a profile.
3. Under settings set a list of channels and categories you'd like to follow.
4. The Feed page will aggregate clips from those channels in the past few days from highest to lowest views.
5. You can save clips into your saved page.

## Run locally
1. Clone this repo.
2. Inside the `server` folder run `npm run dev`.
3. Inside the `client` folder run `npm run build`.
4. You can find the app at `localhost:5173`.
