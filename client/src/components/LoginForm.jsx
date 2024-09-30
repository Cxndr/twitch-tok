import SERVER_URL from "../config";
import { useState } from "react";


export default function LoginForm({user, setUser}) {

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
        <>
            {user
            ?
                <button onClick={userLogout}>Log Out</button>
            :
                <form onSubmit={handleFormSubmit}>
                    <input 
                        type="text" 
                        id="log-username"
                        name="username" 
                        placeholder="choose a username"
                        maxLength="16"
                        value={formData.username}
                        onChange={handleInputChange}
                    />
                    <input 
                        type="password"
                        name="password" 
                        id="log-password"
                        placeholder="choose a password"
                        maxLength="24"
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                    <button type="submit">Login</button>
                </form>
                
            }
        </>

    )
}