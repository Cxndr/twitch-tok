import { useState } from "react"
import SERVER_URL from "../config";


export default function CommentForm({clips,clipPos, getComments}) {

    const [formData, setFormData] = useState({
        comment: "",
    })


    function handleInputChange(event) {
        setFormData({...formData,[event.target.name]:event.target.value})
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        formData.user_id = 0; // todo: get this from user login
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
        </div>
    )
}