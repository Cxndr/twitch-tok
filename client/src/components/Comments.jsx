import CommentForm from "./CommentForm"
import { useState, useEffect } from "react";

export default function Comments({clipPos, clips}) {

    const [comments, setComments] = useState([]);
    
    async function getComments() {
        const url = "http://localhost:8080/comment?"
            + new URLSearchParams({
                "content": clips[clipPos].id.toString()
            })
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        const responseJSON = await response.json();
        setComments(responseJSON);
    }
    
    useEffect(() => {
        getComments();
    },[clipPos, clips]);
    

    return (
        <section className="comments-section">
            <CommentForm clips={clips} clipPos={clipPos} getComments={getComments}/>
            {comments.map((commentItem) => (
                <div key={commentItem.id}>
                    <p><b>{commentItem.user_id}</b></p>
                    <p>{commentItem.comment}</p>
                    <p>{commentItem.likes} Likes</p>
                    <p>{commentItem.created_at}</p>
                </div>
            ))}
        </section>
    )
}

