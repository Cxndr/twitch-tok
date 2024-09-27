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
    

    async function handleLike(event,id) {
        event.preventDefault();
        const data = {};
        const response = await fetch(`http://localhost:8080/comment/like/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        const responseJSON = await response.json()
        console.log(responseJSON);
        getComments();
    }

    async function handleDelete(event,id) {
        event.preventDefault();
        const response = await fetch(`http://localhost:8080/comment/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const responseJSON = await response.json();
        console.log(responseJSON);
        getComments();
    }


    return (
        <section className="comments-section">
            <CommentForm clips={clips} clipPos={clipPos} getComments={getComments}/>
            {comments.map((commentItem) => (
                <div key={commentItem.id}>
                    <p><b>{commentItem.user_id}</b></p>
                    <p>{commentItem.comment}</p>
                    <span>{commentItem.likes}</span> 
                    <button onClick={(e)=>handleLike(e,commentItem.id)}>👍</button>
                    <button onClick={(e)=>handleDelete(e,commentItem.id)}>🗑️</button>
                    <p>{commentItem.created_at}</p>
                </div>
            ))}
        </section>
    )
}

