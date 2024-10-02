import { useEffect, useState } from "react";
import SERVER_URL from "../config";
import Clip from "../components/Clip";
import RegisterPage from "./RegisterPage";

export default function SavedPage({profileData, getProfile}) {
    const [savedClips, setSavedClips] = useState([]);

    async function getSavedClips() {
        if (!profileData.saved_clips) return;
        try {
            const response = await fetch(`${SERVER_URL}/saved-clips`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(profileData.saved_clips)
            });
            const responseJSON = await response.json();
            console.log("resp: ", responseJSON);
            setSavedClips(responseJSON)
        }
        catch(err) {
            console.error(err);
        }
    }

    useEffect(() => {
        getSavedClips();
        console.log("savedclips: ",savedClips);
    },[profileData]);

    async function removeSavedClip(clipId,userId) {
        try {
            const token = sessionStorage.getItem('authToken');
            const data = {};
            data.bool = false;
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
    function handleDelete(e,id) {
        e.preventDefault();
        removeSavedClip(id,profileData.id)
    }


    return (
        <>
            {(profileData.length != 0)
            ?
            <div className="saved-clips-section">
                {savedClips.map((clip) => (
                    <div className="saved-clip" key={clip.id}>
                        <Clip key={clip.id} clipData={clip}/>
                        <button 
                            className="saved-clip-delete-button" 
                            onClick={(e)=>handleDelete(e,clip.id)}
                        >
                        🗑️
                        </button>
                    </div>
                ))}
            </div>
            :
            <div>
                <p style={{fontSize: '1.5rem', textAlign: 'center', paddingBottom: '3rem'}}>Login/Register to use custom settings!</p>
                <RegisterPage/>
            </div>
            }
        </>
    )
}