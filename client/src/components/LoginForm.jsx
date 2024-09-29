import SERVER_URL from "../config";
import { useState } from "react";


export default function LoginForm({login, setLogin}) {

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })

    function handleInputChange(event) {
        setFormData({...formData,[event.target.name]:event.target.value});
        console.log(formData);
    }

    async function userLogin() {
        const formDataJSON = JSON.stringify(formData);
        console.log(formDataJSON);
        // formData.username="";
        // formData.password="";
        const url = `${SERVER_URL}/login`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: formDataJSON,
            credentials: 'include'
        });
        const responseJSON = await response.json();
        if (response.ok) {
            console.log("login successful!");
            setLogin(true);
        }
        else {
            console.error("login failed: ", responseJSON.error);
        }
    }

    async function userLogout() {
        const response = await fetch(`${SERVER_URL}/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include'
        });
        const responseJSON = response.json();
        console.log(responseJSON);
        setLogin(false);
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const loginResponse = await userLogin(formData.username, formData.password)
        console.log(loginResponse);

        }


    return (
        <>
            {login
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