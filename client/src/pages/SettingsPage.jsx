import { useState } from "react";
import UserEditForm from "../components/UserEditForm";
import SelectStreamer from "../components/SelectStreamer";
import SelectCategories from "../components/SelectCategories";
import RegisterPage from "./RegisterPage";
// import SelectHiddenStreamer from "../components/SelectHiddenStreamer";


export default function SettingsPage({user,profileData,getProfile}) {

    const [editingUser, setEditingUser] = useState(false);

    function handleEditButton() {
        setEditingUser(true);
    }
    console.log("SETTINGPAGE PROFILE: ", profileData);
    return (
        <>
            {user
            ?
            <div className="settings-page">
                {editingUser
                ? <UserEditForm profileData={profileData} setEditingUser={setEditingUser} getProfile={getProfile}/>
                :
                <>
                    <div className="settings-user-display">
                        <p style={{color:profileData.user_color}}>
                            <b>{profileData.user_name}</b>
                        </p>
                        <button onClick={handleEditButton}>Edit User</button>
                    </div>
                    <SelectStreamer profileData={profileData} getProfile={getProfile}/>
                    <SelectCategories profileData={profileData} getProfile={getProfile}/>
                </>}
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