import { useEffect, useState, useRef } from "react"

import Clip from "../components/Clip"
import Comments from "../components/Comments"
import Loading from "../components/Loading"
import Switch from "react-switch";

import SERVER_URL from "../config"

export default function FeedPage({profileData, getProfile, autoMode, setAutoMode}){

    console.log("app is re-rendering hhhhh");

    const [clips, setClips] = useState([]);
    const [clipPos, setClipPos] = useState(0);
    const [clipsHasLoaded, setClipsHasLoaded] = useState(false);
    const [thisClipSaved, setThisClipSaved] = useState(null);
    console.log("clipsHasLoaded", clipsHasLoaded);

    const autoModeTimerRef = useRef(null);
  
    useEffect(() => {
      console.log("~ GETTING CLIPS ~");
      console.log("profileData: ", profileData);
      async function fetchClips() {
        let fetchData = {
          streamers: [85498365,500128827,22510310],
          games: [247865501,32399,18122,29595],
          hidden: []
        };
        if (profileData.length != 0) {
          fetchData.streamers = profileData.user_feed_streamers;
          fetchData.games = profileData.user_feed_categories;
          fetchData.hidden = profileData.hidden_streamers;
        }
        const fetchDataJSON = JSON.stringify(fetchData);
        console.log("json fetch:", fetchDataJSON);
        try {
          const response = await fetch("http://localhost:8080/clips", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: fetchDataJSON
          });
          setClips(await response.json())
          setClipsHasLoaded(true);
        }
        catch(err) {
          console.error(err);
        }
      }
      fetchClips();
    },[profileData])
    // console.log(clips);

    function updateClipPos(newPos) {
      if (newPos < clips.length && newPos >= 0) {
        setClipPos(newPos);
      }
    }

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
          updateClipPos(clipPos+1);
        }
        else if (e.key === "ArrowUp") {
          updateClipPos(clipPos-1);
        }
        else {return;}
        console.log(clipPos);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }),[];

    // useEffect(() => {
    //   let lastScroll = performance.now();
    //   let scrollDir = 0;
    //   let scrollIdleTime = 300; // time in ms to allow retrigger of scroll event.
    //   let idleTimePassed = false;

    //   const handleWheel = (e) => {
    //     if (performance.now > lastScroll + scrollIdleTime) {idleTimePassed = true};
    //     console.log(idleTimePassed);
    //     if (e.deltaY < 0 && (idleTimePassed === true || scrollDir === 1))   
    //     {
    //         lastScroll = performance.now();
    //         scrollDir = 0;
    //         updateClipPos(clipPos-1);
    //     }
    //     else if (e.deltaY > 0 && (idleTimePassed === true || scrollDir === 0))
    //     {
    //         lastScroll = performance.now();
    //         scrollDir = 1;
    //         updateClipPos(clipPos+1);
    //     }            
    //   }
    //   document.addEventListener('wheel', handleWheel);
    //   return () => {
    //     document.removeEventListener('wheel', handleWheel);
    //   };
    // }),[];
    

    function updateClipSaved() {
      if (profileData.length === 0) return;
      if (!clipsHasLoaded) return;
      const thisClipId = clips[clipPos].id;
      console.log(profileData);
      console.log("SAVED CLIPS:::::",profileData.saved_clips)
      console.log("this clip id: ",thisClipId);
      setThisClipSaved(profileData.saved_clips.includes(thisClipId));
    }
    if (thisClipSaved === null) {
      updateClipSaved();
    }

    function handleAutoSwitch(checked) {
      setAutoMode(checked);
      if (!checked && autoModeTimerRef.current) {
          clearTimeout(autoModeTimerRef.current);
          autoModeTimerRef.current = null;
      }
  }

  function autoClipTimer() {
      if (clips.length < 1 || !autoMode) return;

      // Clear any existing timer
      if (autoModeTimerRef.current) {
          clearTimeout(autoModeTimerRef.current);
      }

      autoModeTimerRef.current = setTimeout(() => {
          updateClipPos(clipPos + 1);
      }, (clips[clipPos].duration * 1000) + 5000);
  }

  useEffect(() => {
      autoClipTimer();
      return () => {
          if (autoModeTimerRef.current) {
              clearTimeout(autoModeTimerRef.current);
          }
      };
  }, [clipPos, autoMode, clips]);

    useEffect(() => {
      updateClipSaved();
  }, [clipPos]);

    async function saveClip(clipId,userId,bool) {
      try {
          console.log(clipId,userId,bool);
          const token = sessionStorage.getItem('authToken');
          const data = {};
          data.bool = bool;
          data.user_id = userId;
          data.clip_id = clipId;
          const response = await fetch(`${SERVER_URL}/update-user/saved-clips`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(data)
          });
          if (response.ok) {
              const responseJSON = await response.json();
              console.log("clip saved", responseJSON);
              setThisClipSaved(true);
              getProfile();
          }
          else {
              throw new Error("user update failed");
          }
      }
      catch(err) {
        console.error(err);
      }
    }

    function handleSaveClipButton() {
      saveClip(clips[clipPos].id,profileData.id,!thisClipSaved);
    }
    function handleShareButton() {
      navigator.clipboard.writeText(clips[clipPos].url)
      const shareText = document.getElementById("shared-video-text");
      shareText.classList.remove("hidden");
      setTimeout(()=> {
        shareText.classList.add("hidden");
      }, 3000);
    }

    return (
        <>
          {clipsHasLoaded ? null : <Loading/>}
          
            {clipsHasLoaded && 
              <section className="clips-section">
                <Clip clipData={clips[clipPos]} autoplay/>
              </section>
            }
          {clipsHasLoaded &&
            <section className="sidebar-section">

              <div className="clip-settings">
                <label>
                  <div className="auto-mode-switch">
                    <Switch 
                      onChange={handleAutoSwitch}
                      checked={autoMode}
                    />
                  </div>
                  Auto Mode 
                </label>
                <span className="instruction-text"> Use arrow keys or auto to cycle clips.</span>
              </div>

              <div className="clip-info">
                <h3>{clips[clipPos].title}</h3>
                <p>
                  <span className="clip-label">Channel: </span>
                  {clips[clipPos].broadcaster_name}
                </p>
                <p>
                  <span className="clip-label">Creator: </span>
                  {clips[clipPos].creator_name}
                </p>
                <p>
                  <span className="clip-label">View Count: </span>
                  {clips[clipPos].view_count}
                </p>
                <p>
                  <span className="clip-label">Created: </span>
                  {new Date(clips[clipPos].created_at).toLocaleString('en-GB').replace(",","")}
                </p>
              </div>
              
              <div className="video-buttons-wrapper">
                <div className="video-buttons">
                  {(profileData.length != 0) &&
                    <>
                      {thisClipSaved ? 
                        <i 
                          className="save-video-icon fa-solid fa-heart"
                          onClick={handleSaveClipButton}
                        ></i>
                      :
                        <i 
                          className="save-video-icon fa-regular fa-heart"
                          onClick={handleSaveClipButton}
                        ></i>
                      }
                    </>
                  }
                  <i
                      className="share-video-icon fa-solid fa-share"
                      onClick={handleShareButton}
                  ></i>
                  <span 
                    className="share-video-text hidden"
                    id="shared-video-text"
                  >
                    Link copied to clipboard!
                  </span>
                </div>

              </div>
              {clipsHasLoaded && <Comments clipPos={clipPos} clips={clips} profileData={profileData}/>}
            </section>  
          }
        </>
    )
}