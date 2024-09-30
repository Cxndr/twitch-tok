import makeAnimated from 'react-select/animated';
import AsyncSelect from 'react-select/async'
import { useState, useEffect} from "react"
import SERVER_URL from "../config";

export default function SelectStreamer({profileData}) {

    const animatedComponents = makeAnimated();
    const [selectedChannels, setSelectedChannels] = useState([]);
    const [savedStreamers, setSavedStreamers] = useState([]);
    const [streamersLoaded, setStreamersLoaded] = useState(false);


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
        if (!idList) {
            setSavedStreamers([]);
            setStreamersLoaded(true);
            return;
        }
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
            setStreamersLoaded(true);
        }
        catch(err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadStreamerList();
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
        <div>
        {streamersLoaded ?
            <>
                <AsyncSelect
                    isMulti
                    components={animatedComponents}
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
        </div>
    )
}