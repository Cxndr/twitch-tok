import { NavLink } from "react-router-dom";
import LoginForm from "./LoginForm";

export default function Header({user,setUser, profileData, setProfileData}) {

    return (
        <header>
            <div className="title">
                <h1>TwitchTok</h1>
                <h3>tiktok style feed for twitch clips</h3>
            </div>
            <nav>
                <NavLink to="/">🎬 Feed</NavLink>
                <NavLink to="/settings">⚙️ Settings</NavLink>
                <NavLink to="/saved">❤️ Saved</NavLink>
            </nav>
            <div className="user-nav">
                <LoginForm user={user} setUser={setUser} profileData={profileData} setProfileData={setProfileData}/>
            </div>
        </header>
    )
}

