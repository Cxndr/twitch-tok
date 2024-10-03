import SERVER_URL from "../config";
import { useState } from "react";


export default function RegisterPage() {

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })

    function handleInputChange(event) {
        setFormData({...formData,[event.target.name]:event.target.value});
        console.log(formData);
    }

    async function registerNewUser() {
        const formDataJSON = JSON.stringify(formData);
        // console.log(formData);
        // formData.username="";
        // formData.password="";
        const url = `${SERVER_URL}/register`
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: formDataJSON
        });
        const responseJSON = await response.json()
        console.log(responseJSON);
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        registerNewUser()
    }

    return (
        <form className="register-form" onSubmit={handleFormSubmit}> 
            <input 
                type="text" 
                id="reg-username"
                name="username" 
                placeholder="choose a username"
                maxLength="16"
                value={formData.username}
                onChange={handleInputChange}
            />
            <input 
                type="password"
                name="password" 
                id="reg-password"
                placeholder="choose a password"
                maxLength="24"
                value={formData.password}
                onChange={handleInputChange}
            />
            <button type="submit">Register</button>
        </form>
    )
}