import dotenv from 'dotenv';
dotenv.config();

let streamerList = [
    "xqc",
    "dantes",
    "payo",
    "loltyler1",
    "jokerdtv",
    "pokelawls",
    "knut",
    "jessecox",
    "asmongold",
    "akademiks",
    "codemiko",
    "athenelive",
    "watchmeforever",
    "atheneaiheroes",
    "vedal987"
]
let streamerData = [];
let gamesData = [];
let gamesList = [
    "World of Warcraft",
    "League of Legends",
    "Starcraft 2"
    //"Just Chatting"
]   

// settings
let dateRange = 10; // how far back in days to get clips from
const domain = "localhost";
const timerAdd = 1.5; // time to add to clip timer to make up for loading the clip (has to be a better way)

// mechanical
const twitchClientID = process.env.TWITCH_CLIENT_KEY;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
let twitchAuthToken;
const currentDate = new Date();
let startDate = new Date(currentDate - (1000 * 60 * 60 * 24 * dateRange));
startDate = startDate.toISOString();
let clips = [];
let clipTicker = 0;
let clipTimer;
let lastScroll = performance.now();
let scrollDir = 0;
let scrollIdleTime = 300; // time in ms to allow retrigger of scroll event.
let idleTimePassed = false;

export const setTwitchAuthToken = async () => {
    try {
        const response = await fetch (
            "https://id.twitch.tv/oauth2/token", {
                method: "POST",
                body: new URLSearchParams({
                    "client_id": twitchClientID,
                    "client_secret": twitchClientSecret,
                    "grant_type": "client_credentials"
                })
            }
        );
        const responseJSON = await response.json();
        twitchAuthToken = responseJSON.access_token;
    }
    catch (err) {
        console.error(err);
    }
    validateTwitchAuthToken();
}

export const validateTwitchAuthToken = async () => {
    if (twitchAuthToken.length < 1) {
        console.error("tried to validate but no twitch auth token exists!")
        return;
    }
    
    try {
        const response = await fetch(
            "https://id.twitch.tv/oauth2/validate",{
                headers: {
                    "Authorization": `Bearer ${twitchAuthToken}`
                }
            }
        );
        const data = await response.json();
        console.log("successfully validated twitch auth token");
    }
    catch (err) {
        console.log("twitch auth token failed to validate");
        console.error(`twitch auth token failed to validate!\n ${err}`);
    }
}

export const setStreamersInfo = async () => {
    try {
        let paramStr;
        for (let i=0; i < streamerList.length; i++) {
            if (i>0) paramStr += "&";
            paramStr += "login=" + streamerList[i];
        }
        const url = "https://api.twitch.tv/helix/users?" + new URLSearchParams(paramStr);
        const response = await fetch(url,{
            headers: {
                "Authorization": `Bearer ${twitchAuthToken}`,
                "Client-Id": twitchClientID
            }
        });
        const responseJSON = await response.json();
        streamerData = responseJSON.data;
    }
    catch (err) {
        console.log("failed getting streamers info");
        console.error(err);
    }

}
export const setGamesInfo = async () => {
    try {
        let paramStr;
        for (let i=0; i < gamesList.length; i++) {
            if (i>0) paramStr += "&";
            paramStr += "name=" + gamesList[i];
        }
        const url = "https://api.twitch.tv/helix/games?" + new URLSearchParams(paramStr);
        const response = await fetch(url,{
            headers: {
                "Authorization": `Bearer ${twitchAuthToken}`,
                "Client-Id": twitchClientID
            }
        });
        const responseJSON = await response.json();
        gamesData = responseJSON.data;
    }
    catch (err) {
        console.log("failed getting games info");
        console.error(err);
    }
}

export const getClipsStreamer = async (id) => {
    try {
        const url = "https://api.twitch.tv/helix/clips?"
            + new URLSearchParams({
                "broadcaster_id": id.toString(),
                "started_at": startDate,
                "first": "20" // amount of clips to get (max is 100)
            })
        const response = await fetch (url, {
            headers: {
                "Authorization": `Bearer ${twitchAuthToken}`,
                "Client-Id": twitchClientID
            }
        });
        const responseJSON = await response.json();
        return responseJSON.data;
    }
    catch (err) {
        console.log("failed to get clips");
        console.error(err);
    }
}


export const getClipsStreamers = async () => {
    for (var i=0; i < streamerData.length; i++) {
        const streamerID = streamerData[i].id;
        const streamerClips = await getClipsStreamer(streamerID);
        clips.push(...streamerClips);
    }
}


export const getClipsGame = async (id) => {
    try {
        const url = "https://api.twitch.tv/helix/clips?"
            + new URLSearchParams({
                "game_id": id.toString(),
                "started_at": startDate,
                "first": "20" // amount of clips to get (max is 100)
            })
        const response = await fetch(url,{
            headers:{
                "Authorization": `Bearer ${twitchAuthToken}`,
                "Client-Id": twitchClientID
            }
        });
        const responseJSON = await response.json();
        return responseJSON.data;
    }
    catch (err){
        console.log("failed to get game clips for: " + id);
        console.error(err);
    }
}


export const getClipsGames = async () => {
    for (var i=0; i < gamesData.length; i++) {
        const gameID = gamesData[i].id;
        const gameClips = await getClipsGame(gameID);
        clips.push(...gameClips);
    }
}

export function removeDuplicates(arr) {
// this can be made faster but potentially less reliable down the line by sorting first 
// and comparing to arr[i-1].id instead.

    let unique = [];
    for (let i=0; i < arr.length; i++) {
        let addItem = true;
        if (i > 0) {
            for (let j=0; j < unique.length; j++) {
                if (unique[j].id === arr[i].id) addItem = false;    
            }
        }
        if (addItem === true) unique.push(arr[i]);
    }
    return unique;
}

export const sortClipsViewCount = (clips_arr) => {
    clips_arr.sort( function(a,b){ return b.view_count - a.view_count; } );
}

export async function getClips() {
    await setTwitchAuthToken();
    await setStreamersInfo();
    await setGamesInfo();
    await getClipsStreamers();
    await getClipsGames();
    clips = removeDuplicates(clips);
    sortClipsViewCount(clips);
    return(clips);
}



export function getClipSource(clipID) {
    prefix = "https://clips.twitch.tv/embed?"
    id = "clip=" + clipID;
    parent = "&parent=" + domain;
    autoplay = "&autoplay=true";
    muted = "&muted=false";
    return prefix + id + parent + autoplay + muted;
}

export function setClipSource() {
    document.getElementById('twitch-player').src = getClipSource(clips[clipTicker].id)
}

// const playerLoader = document.querySelector("#player-loading");
// const playerIframe = document.querySelector("#twitch-player");
// function displayPlayerloading() {
//     console.log("SETTING LOADER VISIBLE");
//     playerLoader.classList.add("display");
//     playerIframe.classList.remove("display");
// }
// function hidePlayerLoading() {
//     playerLoader.classList.remove("display");
//     playerIframe.classList.add("display");
// }

export async function initializeClips() {
    // displayPlayerloading();
    await getClips();
    setClipSource();
    setClipTimer(clips[clipTicker].duration);
    // hidePlayerLoading();
}

export function nextClip() {
    clipTicker += 1;
    if (clipTicker > clips.length-1) clipTicker = 0;
    setClipSource();
    setClipTimer(clips[clipTicker].duration);
}
export function prevClip() {
    clipTicker -= 1;
    if (clipTicker < 0) clipTicker = clips.length-1;
    setClipSource();
    setClipTimer(clips[clipTicker].duration);
}

export function setClipTimer(seconds) {
    seconds += timerAdd;
    const milliseconds = seconds * 1000;
    clearTimeout(clipTimer);
    clipTimer = setTimeout(() => {
        nextClip();
    },milliseconds);
}




// *** RUN *** //
// initializeClips();

// // *** INPUT *** //
// document.addEventListener("keydown",(event) => {
//     const keyName = event.key;
//     if (keyName === "ArrowDown") nextClip();
//     else if (keyName === "ArrowUp") prevClip();
// });

// document.addEventListener("wheel",(event) => {
//     idleTimePassed = false;
//     if (performance.now > lastScroll + scrollIdleTime) {idleTimePassed = true};
//     console.log(idleTimePassed);
//     if (event.deltaY < 0 && (idleTimePassed === true || scrollDir === 1)) {
//         lastScroll = performance.now();
//         scrollDir = 0;
//         prevClip();
//     }
//     else if (event.deltaY > 0 && (idleTimePassed === true || scrollDir === 0)) {
//         lastScroll = performance.now();
//         scrollDir = 1;
//         nextClip();
//     }            
// });
