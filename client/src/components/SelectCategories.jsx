import makeAnimated from 'react-select/animated';
import AsyncSelect from 'react-select/async'
import { useState, useEffect} from "react"
import SERVER_URL from "../config";

export default function SelectCategories({profileData}) {

    const animatedComponents = makeAnimated();
    const [selectedGames, setSelectedGames] = useState([]);
    const [savedGames, setSavedGames] = useState([]);
    const [gamesLoaded,setGamesLoaded] = useState(false);

    const handleGamesChange = (selected) => {
        setSelectedGames(selected);
    };

    async function searchGames(query) {
        const url = `${SERVER_URL}/searchgames?`
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
                console.error("Error fetching categories");
                return[];
            }
            const responseJSON = await response.json();
            return responseJSON.map((category) => ({
                label: category.name,
                value: category.id
            }));
        }
        catch(err) {
            console.error(err);
        }
    }

    async function loadGamesList() {
        const idList = profileData.user_feed_categories;
        if (!idList) {
            setSavedGames([]);
            setGamesLoaded(true);
            return;
        }

        const url = `${SERVER_URL}/gamenames`
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(idList)
            });
            const responseJSON = await response.json();
            setSavedGames(JSON.parse(responseJSON));
            setGamesLoaded(true);
        }
        catch(err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadGamesList();
    }, [profileData]);

    async function saveGamesList() {
        const idList = selectedGames.map(({value}) => (value));
        let updateData = {
            user_feed_categories: idList
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
        {gamesLoaded ?
            <>
                <AsyncSelect
                    isMulti
                    components={animatedComponents}
                    loadOptions={searchGames}
                    onChange={handleGamesChange}
                    placeholder="search for categories..."
                    className="react-select"
                    defaultValue={savedGames}
                />
                <button onClick={saveGamesList}>Save</button>
            </>
            : <span>Loading Categories List...</span>
        }
        </div>
    )
}