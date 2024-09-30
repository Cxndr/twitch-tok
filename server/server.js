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


// do a get api route for now getting data already set in api.js
// - later do a post route to get users specific streamer/catoegries list

app.get("/clips", async function (req, res) {
    try {
        const clips = await api.getClips();
        res.json(clips);
    }
    catch(err) {
        console.error(err);
        response.status(204);
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

app.post("/streamernames", async function (req,res) {
    try {
        await api.setTwitchAuthToken();
        console.log("~~ STREAMER LIST ARR: ",req.body);
        const result = await api.getStreamerNames(req.body)
        console.log("~~~ RESULT: ", result);
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
            SELECT *
            FROM tt_comments
            WHERE content = ($1)
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

app.put("/comment/like/:id", async function (req,res) {
    try {
        // const operation = req.body.bool ? "+" : "-";
        const operation = "+";
        const updateContent = await db.query(`
            UPDATE tt_comments
            SET likes = likes ${operation} 1
            WHERE id = $1`,
            [req.params.id]
        );
        res.json(updateContent);
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
            user_feed_categories 
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

app.listen(8080, () => console.log("server is listening on port 8080..."));