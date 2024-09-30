import { useState, useEffect} from "react"
import SERVER_URL from "../config";
import UserEditForm from "../components/UserEditForm";
import makeAnimated from 'react-select/animated';
import AsyncSelect from 'react-select/async'


export default function SettingsPage({user}) {

    const [profileData, setProfileData] = useState([]);
    const [editingUser, setEditingUser] = useState(false);
    const [selectedChannels, setSelectedChannels] = useState([]);
    const [savedStreamers, setSavedStreamers] = useState([]);

    async function getProfile() {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            console.error("user is not authenticated");
            return;
        }
        try {
            const response = await fetch(`${SERVER_URL}/profile`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const responseJSON = await response.json();
                setProfileData(responseJSON);
            }
            else {
                throw new Error("Unauthorized or expired token");
            }
        }
        catch(err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (user) { 
            getProfile() 
        }; 
    },[user]); 

    function handleEditButton() {
        setEditingUser(true);
    }

    const handleStreamersChange = (selected) => {
        setSelectedChannels(selected);
    };

    async function searchStreamers(query) {
        const url = `${SERVER_URL}/searchstreamers?`
            + new URLSearchParams({
                "searchquery": query
            })
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (!response.ok) {
                console.error("Error fetching streamers");
                return[];
            }
            const responseJSON = await response.json();
            return responseJSON.map((channel) => ({
                label: channel.display_name,
                value: channel.id
            }));
        }
        catch(err) {
            console.error(err);
        }
    }

    async function loadStreamerList() {
        const idList = profileData.user_feed_streamers;
        const url = `${SERVER_URL}/streamernames`
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(idList)
            });
            const responseJSON = await response.json();
            setSavedStreamers(JSON.parse(responseJSON));
        }
        catch(err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (profileData.user_feed_streamers) {
            loadStreamerList();
        }
    }, [profileData]);

    async function saveStreamerList() {
        const idList = selectedChannels.map(({value}) => (value));
        let updateData = {
            user_feed_streamers: idList
        };
        try {
            const token = sessionStorage.getItem('authToken');
            const response = await fetch(`${SERVER_URL}/update-user`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });
            if (response.ok) {
                const responseJSON = await response.json();
                console.log("lists updated", responseJSON);
            }
            else {
                throw new Error("updating lists failed");
            }
        }
        catch(err) {
            console.error(err);
        }
    }


    return (
        <>
            {user
            ?
                editingUser
                ? <UserEditForm profileData={profileData} setEditingUser={setEditingUser} getProfile={getProfile}/>
                :
                <>
                    <div>
                        <span style={{color:profileData.user_color}}>
                            <b>{profileData.user_name}</b>
                            <button onClick={handleEditButton}>Edit User</button>
                        </span>
                    </div>
                    {savedStreamers.length > 0 ?
                    <>
                        <AsyncSelect
                            isMulti
                            loadOptions={searchStreamers}
                            onChange={handleStreamersChange}
                            placeholder="search for channels..."
                            className="react-select"
                            defaultValue={savedStreamers}
                        />
                        <button onClick={saveStreamerList}>Save</button>
                    </>
                    : <span>Loading Streamer Lists...</span>
                    }
                </>
            : null
            }

        </>
    )
}