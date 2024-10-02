import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import expressWs from 'express-ws';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import * as api from './api.js';

dotenv.config();

const app = express();
expressWs(app);
app.use(express.json());
const corsOptions = {
    origin: process.env.CLIENT_DOMAIN,
    credentials: true,
};
app.use(cors(corsOptions));

const db = new pg.Pool({ 
    connectionString: process.env.DB_CONN_STRING
});


app.post("/clips", async function (req, res) {
    try {
        const streamers = req.body.streamers;
        const games = req.body.games;
        const hidden = req.body.hidden;
        const clips = await api.getClipsFeed(streamers,games,hidden);
        res.json(clips);
    }
    catch(err) {
        console.error(err);
        res.status(204);
    }
});

app.post("/saved-clips", async function (req,res) {
    try {
        console.log("reqbody: ",req.body)
        await api.setTwitchAuthToken();
        const clips = await api.getClipsIds(req.body)
        console.log(clips);
        res.json(clips);
    }
    catch(err) {
        console.error(err);
        res.status(204);
    }
});

app.get("/searchstreamers", async function (req,res) {
    try {
        await api.setTwitchAuthToken();
        const result = await api.searchStreamers(req.query.searchquery);
        if (!result) {
            return res.status(204).json([]);
        }
        res.json(result);
    }
    catch(err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/searchgames", async function (req,res) {
    try {
        await api.setTwitchAuthToken();
        const result = await api.searchGames(req.query.searchquery);
        if (!result) {
            return res.status(204).json([]);
        }
        res.json(result);
    }
    catch(err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/streamernames", async function (req,res) {
    try {
        await api.setTwitchAuthToken();
        const result = await api.getStreamerNames(req.body)
        if (!result) {
            return res.status(204).json([]);
        }
        res.json(result);
    }
    catch(err) {
        console.error(err);
        res.status(500);
    }
});

app.post("/gamenames", async function (req,res) {
    try {
        await api.setTwitchAuthToken();
        const result = await api.getGameNames(req.body)
        if (!result) {
            return res.status(204).json([]);
        }
        res.json(result);
    }
    catch(err) {
        console.error(err);
        res.status(500);
    }
});

app.get("/comment", async function (req, res) {
    try {
        const commentsContent = await db.query(`
            SELECT c.*, u.user_name, u.user_color, u.created_at
            FROM tt_comments c, tt_users u
            WHERE c.user_id = u.id
            AND c.content = ($1)
            ORDER BY id DESC`,
            [req.query.content]
        );
        res.json(commentsContent.rows);
        console.log("get recieved for", req.query.content);
    }
    catch(err) {
        console.error(err);
        res.status(204);
    }
});

app.post("/comment", async function (req, res) {
    try {
        if (req.body.user_id == "") {
            req.body.user_id = 1; // "anon" user
        }
        const insertContent = await db.query(`
            INSERT INTO tt_comments
            (user_id, content, comment)
            VALUES ($1,$2,$3)
            `,
            [req.body.user_id, req.body.content, req.body.comment]
        );
        res.json(insertContent);
    }
    catch(err) {
        console.error(err);
        res.status(204);
    }
})

app.put("/comment/like/:id", authenticateToken, async function (req,res) {
    try {
        const getLikes = await db.query(`
            SELECT liked_comments
            FROM tt_users
            WHERE id = $1`,
            [req.user.id]
        );
        const likedCommentsArr = getLikes.rows[0].liked_comments;
        console.log(likedCommentsArr);
        console.log(req.params.id);
        let alreadyLiked = false;
        if(likedCommentsArr.includes(parseInt(req.params.id))) {
            alreadyLiked = true;
        }
        console.log("liked:", alreadyLiked);
        const operation = alreadyLiked ? "-" : "+";
        console.log("OPERATION: ",operation);
        const updateComment = await db.query(`
            UPDATE tt_comments
            SET likes = likes ${operation} 1
            WHERE id = $1`,
            [req.params.id]
        );
        let updateUser
        if (alreadyLiked) {
            updateUser = await db.query(`
                UPDATE tt_users
                SET liked_comments = array_remove(liked_comments, $1)
                WHERE id = $2`,
                [req.params.id, req.user.id]
            );
            const removeUserFromComment = await db.query(`
                UPDATE tt_comments
                SET users_liked = array_remove(users_liked, $1)
                WHERE id = $2`,
                [req.user.id, req.params.id]
            );
        }
        else {
            updateUser = await db.query(`
                UPDATE tt_users
                SET liked_comments = array_append(liked_comments, $1)
                WHERE id = $2`,
                [req.params.id, req.user.id]
            );
            const AddUserToComment = await db.query(`
                UPDATE tt_comments
                SET users_liked = array_append(users_liked, $1)
                WHERE id = $2`,
                [req.user.id, req.params.id]
            );
        }
        res.json({alreadyLiked});
    }
    catch(err) {
        console.error(err);
        res.status(204);
    }
})

app.delete("/comment/delete/:id", async (req,res) => {
    try {
        const deleteContent = await db.query(`
            DELETE FROM tt_comments
            WHERE id = $1`,
            [req.params.id]
        );
        res.json(deleteContent);
    }
    catch(err) {
        console.error(err);
        res.status(204);
    }
});

app.get("/user/", async(req,res) => {
    try {
        const getUser = await db.query(`
            SELECT *
            FROM tt_users
            WHERE user_name = ($1)`,
            [req.query.username]
        );
        res.json(getUser.rows);
    }
    catch(err) {
        console.error(err);
        res.status(204);
    }
});

app.post("/register", async(req,res) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        await db.query(`
            INSERT INTO tt_users
            (user_name, password)
            VALUES ($1,$2)`,
            [req.body.username, hashedPassword]
        );
        return res.status(201).json({message:"user created"});
    }
    catch(err) {
        console.error(err);
        res.status(204);
    }
});

app.post("/login", async(req,res) => {
    try {
        console.log(req.body.username);
        const userResult = await db.query(`
            SELECT password, id
            FROM tt_users
            WHERE user_name = ($1)`,
            [req.body.username]
        );
        if (userResult.rows.length === 0) {
            return res.status(404).json({error:"user not found"});
        }
        const serverPass = userResult.rows[0].password;
        const userId = userResult.rows[0].id;
        const isMatching = await bcrypt.compare(req.body.password, serverPass);
        if (isMatching) {
            const token = jwt.sign({id:userId, user_name:req.body.username}, process.env.JWT_SECRET, {
                expiresIn: '24h',
            });
            return res.status(200).json({
                message:"login successful!",
                token: token
            });
        }
        else {
            return res.status(401).json({error:"password is incorrect"});
        }
    }
    catch(err) {
        console.error(err);
        res.status(204);
    }
})

function authenticateToken(req,res,next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({message: "Token missing"});
    }

    jwt.verify(token,process.env.JWT_SECRET,(err,user) =>{
        if (err) {
            return res.status(403).json({message:"invalid token"});
        }
        req.user = user;
        next();
    });
}

app.get("/profile", authenticateToken, async (req,res) => {
    const userResult = await db.query(`
        SELECT 
            id, 
            created_at, 
            user_name,
            user_color,
            user_feed_streamers,
            user_feed_categories,
            hidden_streamers,
            saved_clips
        FROM tt_users
        WHERE id = ($1)`,
        [req.user.id]
    );
    if (userResult.rows.length === 0) {
        return res.status(404).json({error:"user not found"});
    }
    res.json(userResult.rows[0]);
});

app.put("/update-user", authenticateToken, async (req,res) => {
    try {
        const saltRounds = 10;
        let hashedPassword = null;
        if (req.body.password) {
            hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        }

        let updateQuery = 'UPDATE tt_users SET ';
        const queryParams = [];
        let paramIndex = 1;
        if (req.body.user_name) {
            updateQuery += `user_name = $${paramIndex}, `;
            queryParams.push(req.body.user_name);
            paramIndex++;
        }
        if (hashedPassword) {
            updateQuery += `password = $${paramIndex}, `;
            queryParams.push(hashedPassword);
            paramIndex++;
        }
        if (req.body.user_color) {
            updateQuery += `user_color = $${paramIndex}, `;
            queryParams.push(req.body.user_color);
            paramIndex++;
        }
        if (req.body.user_feed_streamers) {
            updateQuery += `user_feed_streamers = $${paramIndex}, `;
            queryParams.push(req.body.user_feed_streamers);
            paramIndex++;
        }
        if (req.body.user_feed_categories) {
            updateQuery += `user_feed_categories = $${paramIndex}, `;
            queryParams.push(req.body.user_feed_categories);
            paramIndex++;
        }
        if (req.body.hidden_streamers) {
            updateQuery += `hidden_streamers = $${paramIndex}, `;
            queryParams.push(req.body.hidden_streamers);
            paramIndex++;
        }
        if (req.body.saved_clips) {
            updateQuery += `saved_clips = $${paramIndex}, `;
            queryParams.push(req.body.saved_clips);
            paramIndex++;
        }
        updateQuery = updateQuery.slice(0,-2); // remove trailing ", "
        updateQuery += ` WHERE id = $${paramIndex}`;
        queryParams.push(req.user.id);

        const updateResult = await db.query(updateQuery, queryParams);

        if (updateResult.rowCount === 0) {
            return res.status(404).json({error:"user not found"});
        }
        return res.status(200).json({message: "update successful"});
    }
    catch(err) {
        console.error(err);
        res.status(500);
    }
    
});

app.put("/update-user/saved-clips", authenticateToken, async (req,res) => {
    try {
        const clipId = req.body.clip_id;
        if (req.body.bool) {
            const updateContent = await db.query(`
                UPDATE tt_users
                SET saved_clips = array_append(saved_clips, $1)
                WHERE id = $2`,
                [clipId, req.user.id]
            );
            console.log(updateContent.rowCount === 0);
            if (updateContent.rowCount === 0) {
                return res.status(404).json({error:"user not found"});
            }
            return res.status(200).json({message: "clip saved successfully"});
        }
        if (!req.body.bool) {
            const updateContent = await db.query(`
                UPDATE tt_users
                SET saved_clips = array_remove(saved_clips, $1)
                WHERE id = $2`,
                [clipId,req.user.id]
            );
            console.log(updateContent.rowCount === 0);
            if (updateContent.rowCount === 0) {
                return res.status(404).json({error:"user not found"});
            }
            return res.status(200).json({message: "clip removed successfully"});
        }
        return res.status(204).json({message: "save/unsave value not provided!"});
        
    }
    catch(err) {
        console.error(err);
        res.status(204);
    }
});

app.listen(8080, () => console.log("server is listening on port 8080..."));