import { useState } from "react"
import SERVER_URL from "../config";


export default function CommentForm({clips,clipPos, getComments,profileData}) {

    const [formData, setFormData] = useState({
        comment: "",
    })

    function handleInputChange(event) {
        setFormData({...formData,[event.target.name]:event.target.value})
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        formData.user_id = 0;
        if (profileData.length != 0) {
            formData.user_id = profileData.id;
        }
        formData.content = clips[clipPos].id
        const formDataJSON = JSON.stringify(formData);
        formData.comment = "";
        const response = await fetch(`${SERVER_URL}/comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: formDataJSON
        });
        const responseJSON = await response.json();
        console.log(responseJSON)        
        getComments();
    }

    return (
        <div className="comment-form">
            {(profileData.length != 0)
            ?
                <form onSubmit={handleFormSubmit}>
                    <input
                        type="text"
                        id="comment"
                        name="comment" 
                        placeholder="Add a comment..."
                        maxLength="512"
                        value={formData.comment}
                        onChange={handleInputChange}
                    />
                    <button type="submit">Submit</button>
                </form>
            :
                <p style={{ textAlign: 'center' }}>Login/Register to post comments!</p>
            }
        </div>
    )
}