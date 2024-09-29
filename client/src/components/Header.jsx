import { Link } from "react-router-dom";
import LoginForm from "./LoginForm";

export default function Header({login,setLogin}) {

    return (
        <header>
            <h1>TwitchTok</h1>
            <h3><i>tiktok style feed for twitch clips</i></h3>
            <nav>
                <Link to="/">Feed</Link>
                {login && <Link to="/settings">Settings</Link>}
                {login && <Link to="/saved">Saved</Link>}
                {login && <Link to="/profile">Profile</Link>}
                {login ? null : <Link to="/register">Register</Link>}
                <Link to="/search">Search</Link>
                <LoginForm login={login} setLogin={setLogin}/>
            </nav>
        </header>
    )
}

