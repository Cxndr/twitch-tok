import { useState, useEffect} from "react"
import SERVER_URL from "../config";
import UserEditForm from "../components/UserEditForm";
import SelectStreamer from "../components/SelectStreamer";
import SelectCategories from "../components/SelectCategories";
import SelectHiddenStreamer from "../components/SelectHiddenStreamer";


export default function SettingsPage({user}) {

    const [profileData, setProfileData] = useState([]);
    const [editingUser, setEditingUser] = useState(false);

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
                    <SelectStreamer profileData={profileData}/>
                    <SelectCategories profileData={profileData}/>
                    <SelectHiddenStreamer profileData={profileData}/>
                </>
            : null
            }
        </>
    )
}