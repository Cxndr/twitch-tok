import { Link } from "react-router-dom";
import LoginForm from "./LoginForm";

export default function Header({user,setUser}) {

    return (
        <header>
            <h1>TwitchTok</h1>
            <h3><i>tiktok style feed for twitch clips</i></h3>
            <nav>
                <Link to="/">Feed</Link>
                <Link to="/settings">Settings</Link>
                {user && <Link to="/saved">Saved</Link>}
                <Link to="/search">Search</Link>
                <LoginForm user={user} setUser={setUser}/>
                {user ? null : <Link to="/register"><button>Register</button></Link>}
                
            </nav>
        </header>
    )
}

