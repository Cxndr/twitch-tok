import { Link } from "react-router-dom"

export default function Header() {

    return (
        <header>
            <h1>TwitchTok</h1>
            <h3><i>tiktok style feed for twitch clips</i></h3>
            <nav>
                <Link to="/">Feed</Link>
                <Link to="/settings">Settings</Link>
                
                <Link to="/saved">Saved</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/search">Search</Link>
            </nav>
        </header>
    )
}

