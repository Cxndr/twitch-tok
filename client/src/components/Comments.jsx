import CommentForm from "./CommentForm"
import { useState, useEffect } from "react";
import SERVER_URL from "../config";
import { timeAgo } from "../utils/utils";

export default function Comments({clipPos, clips, profileData}) {

    const [comments, setComments] = useState([]);
    
    async function getComments() {
        const url = `${SERVER_URL}/comment?`
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
        const token = sessionStorage.getItem('authToken');
        data.user_id = profileData.id;
        try {
            const response = await fetch(`${SERVER_URL}/comment/like/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const responseJSON = await response.json()
            console.log("res:" ,responseJSON);
            getComments();
        }
        catch(err) {
            console.error(err);
        }
    }

    async function handleDelete(event,id) {
        event.preventDefault();
        const response = await fetch(`${SERVER_URL}/comment/delete/${id}`, {
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
        <>
            <CommentForm clips={clips} clipPos={clipPos} getComments={getComments} profileData={profileData}/>
            <div className="comments">
                {comments.map((commentItem) => (
                    <div 
                        key={commentItem.id}
                        className="comment-item"
                    >
                        <p 
                            className="comment-user"
                            style={{color:commentItem.user_color}}
                        >
                            <b>{commentItem.user_name}</b>
                        </p>
                        <p className="comment-content">{commentItem.comment}</p>
                        <span></span> 
                        <button
                            className={
                                commentItem.users_liked.includes(parseInt(profileData.id))
                                ? "comment-like-button liked"
                                : "comment-like-button"
                            }
                            onClick={(e)=>handleLike(e,commentItem.id)}>{commentItem.likes} 👍</button>
                        {(commentItem.user_id === profileData.id)
                        &&
                        <button className="comment-delete-button" onClick={(e)=>handleDelete(e,commentItem.id)}>🗑️</button>
                        }
                        <p className="comment-timestamp">{timeAgo(commentItem.created_at)}</p>
                    </div>
                ))}
            </div>
        </>
    )
}

