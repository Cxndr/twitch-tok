import SERVER_URL from "../config";
import { useState } from "react";

export default function UserEditForm({profileData,setEditingUser,getProfile}) {

    const [formData, setFormData] = useState({
        user_name: profileData.user_name,
        password: "",
        user_color: profileData.user_color
    });

    function handleInputChange(event) {
        setFormData({...formData,[event.target.name]:event.target.value});
        console.log(formData);
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        let updateData = {};
        if (formData.user_name != profileData.user_name) {
            updateData.user_name = formData.user_name;
        }
        if (formData.password.trim().length > 0) {
            updateData.password = formData.password;
        }
        if (formData.user_color != profileData.user_color) {
            updateData.user_color = formData.user_color;
        }
        if (Object.keys(updateData).length === 0) {
            console.log(updateData);
            console.log(formData);
            console.log("no changes submitted");
            setEditingUser(false);
            getProfile();
            return;
        }

        try {
            const token = sessionStorage.getItem('authToken');
            const response = await fetch(`${SERVER_URL}/update-user`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const responseJSON = await response.json();
                console.log("user updated", responseJSON);
                setEditingUser(false);
                getProfile();
            }
            else {
                throw new Error("user update failed");
            }
        }
        catch(err) {
            console.error(err);
        }
    }

    function handleCancel() {
        setEditingUser(false);
    }

    return (
        <form className="user-edit-form"onSubmit={handleFormSubmit}>
            <input
                type="text"
                name="user_name"
                id="edit-username"
                maxLength="16"
                value={formData.user_name}
                onChange={handleInputChange}
            />
            <input
                type="text"
                name="password"
                id="edit-password"
                maxLength="24"
                placeholder="******"
                value={formData.password}
                onChange={handleInputChange}
            />
            <input
                type="color"
                name="user_color"
                id="edit-usercolor"
                value={formData.user_color}
                onChange={handleInputChange}
            />
            <button type="submit">Save</button>
            <button onClick={handleCancel}>Cancel</button>
        </form>
    )
}