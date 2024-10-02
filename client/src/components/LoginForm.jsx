import SERVER_URL from "../config";
import { useState } from "react";
import { Link } from "react-router-dom";


export default function LoginForm({user, setUser, profileData}) {

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })

    function handleInputChange(event) {
        setFormData({...formData,[event.target.name]:event.target.value});
        console.log(formData);
    }

    async function userLogin(username,password) {
        try {
            const response = await fetch(`${SERVER_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username, password})
            });

            if (!response.ok) {
                throw new Error("login failed");
            }

            const responseJSON = await response.json();
            sessionStorage.setItem('authToken', responseJSON.token)
            setUser(true);
        }
        catch(err) {
            console.error(err);
            alert("login failed");
        }
    }    

    async function userLogout() {
        sessionStorage.removeItem('authToken');
        setUser(false);
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const loginResponse = await userLogin(formData.username, formData.password)
        console.log(loginResponse);
    }


    return (
        <div>
            {user
            ?
                <>
                    <span className="user-display-text">Logged in as 
                        <span className="user-display-name"
                        style={{color:profileData.user_color}}>
                            <b> {profileData.user_name}</b>
                        </span>
                    </span>
                    <button onClick={userLogout}>Log Out</button>
                </>
            :
                <>
                    <form onSubmit={handleFormSubmit}>
                        <input 
                            type="text" 
                            id="log-username"
                            name="username" 
                            placeholder="username"
                            maxLength="16"
                            value={formData.username}
                            onChange={handleInputChange}
                        />
                        <input 
                            type="password"
                            name="password" 
                            id="log-password"
                            placeholder="password"
                            maxLength="24"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        <button type="submit">Login</button>
                        <Link to="/register"><button>Register</button></Link>
                    </form>
                    
                </>
                
            }
        </div>

    )
}