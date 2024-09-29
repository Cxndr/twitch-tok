import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import expressWs from 'express-ws';
import bcrypt from 'bcrypt';
import session from 'express-session';

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
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true} 
    // SET SECURE TO TRUE FOR DEV! 
}));

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
            SELECT password
            FROM tt_users
            WHERE user_name = ($1)`,
            [req.body.username]
        );
        if (userResult.rows.length === 0) {
            return res.status(404).json({error:"user not found"});
        }
        const serverPass = userResult.rows[0].password;
        console.log("userpass: ",req.body.password)
        console.log("serverpass: ",serverPass);
        console.log(userResult.rows);
        const isMatching = await bcrypt.compare(req.body.password, serverPass);
        if (isMatching) {
            req.session.userId = userResult.rows[0].id;
            return res.status(200).json({message:"login successful!"});
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

app.get("/auth/status", (req,res) => {
        if (req.session && req.session.userId) {
            return res.status(200).json({
                loggedIn: true, 
                userId: req.session.userId
            })
        }
        else {
            return res.status(401).json({
                loggedIn: false
            })
        }
});

app.post("/logout", (req,res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(204).json({error: "Logout failed"})
            }
            else {
                res.clearCookie("connect.sid");
                return res.status(200).json({message: "Logout success"});
            } 
        });
    }
    else {
        return res.status(200).json({message: "No session to log out from"});
    }
});


app.listen(8080, () => console.log("server is listening on port 8080..."));