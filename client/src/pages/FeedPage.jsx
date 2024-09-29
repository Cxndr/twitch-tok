import { useEffect, useState } from "react"

import Clips from "../components/Clips"
import Comments from "../components/Comments"
import Loading from "../components/Loading"

export default function FeedPage(){

    console.log("app is re-rendering hhhhh");

    const [clips, setClips] = useState([]);
    const [clipPos, setClipPos] = useState(0);
    const [clipsHasLoaded, setClipsHasLoaded] = useState(false);
    console.log("clipsHasLoaded", clipsHasLoaded)
  
    useEffect(() => {
      console.log("~ GETTING CLIPS ~")
      async function fetchClips() {
        try {
          const response = await fetch("http://localhost:8080/clips")
          setClips(await response.json())
          setClipsHasLoaded(true);
        }
        catch(err) {
          console.error(err);
        }
      }
      fetchClips();
    },[])
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
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }),[];
  

    return (
        <>
            {clipsHasLoaded ? null : <Loading/>}
            {clipsHasLoaded && <Clips clipPos={clipPos} clips={clips}/>}
            {clipsHasLoaded && <Comments clipPos={clipPos} clips={clips}/>}
        </>
    )
}