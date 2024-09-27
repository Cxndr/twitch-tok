import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import expressWs from 'express-ws';

import * as api from './api.js';

const app = express();
expressWs(app);
app.use(express.json());
app.use(cors());
dotenv.config();
const db = new pg.Pool({ 
    connectionString: process.env.DB_CONN_STRING
});


// do a get api route for now getting data already set in api.js
// - later do a post route to get users specific streamer/catoegries list

app.get("/clips", async function (req, res) {
    try {
        const clips = await api.getClips();
        console.log(clips);
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
            ORDER BY id ASC`,
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


app.listen(8080, () => console.log("server is listening on port 8080..."));