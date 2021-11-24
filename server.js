/* Imports/setup for the server. Imports the Express.js library, sets the server (alessa) up, imports necessary modules
(path, readFile, writeFile), and imports outside files that make up database */

const express = require('express');
const alessa = express();
const path = require('path');
const users = path.join(__dirname, '/database','users.json');
const mainChat = path.join(__dirname, '/database', 'main.json');
const {readFile, writeFile} = require('fs');
const bcrypt = require('bcrypt');
const util = require('util');
const readFilePromise = util.promisify(readFile);
const writeFilePromise = util.promisify(writeFile);
const jwt = require('jsonwebtoken');
const keys = require('dotenv').config();

//parses JSON data
alessa.use(express.json());

//allows use of files from specified folder (not yet implemented but code added for potential usability)
alessa.use(express.static('database'));

//Signs user in. If user exists and username/password are valid, server returns a token. If user doesn't exist or username/password
//aren't valid, user receives an error.
alessa.post('/api/users/login', async (req,res) => {
    let login=req.body;
    let fileRead = await readFilePromise(users);
    let parsedUsers = JSON.parse(fileRead);
    let user = parsedUsers.find(e => e.username === login.username);
    if (user === undefined) {
        res.send('no user');
    };
    try {
        if (await bcrypt.compare(login.password,user.password)) {
        //JWT creation
            const username=login.username;
            const userObj = {username: username};
            const accessToken = jwt.sign(userObj, process.env.A_TOKEN_SECRET_KEY);
            res.json({accessToken: accessToken});
        } else {
            res.send('no password');
        }
    } catch {
        res.status(500).send();
    }
});

let verifyToken = (req, res, next) => {
    const authHeader = req.body.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) res.sendStatus(401);
    jwt.verify(token,process.env.A_TOKEN_SECRET_KEY, (err,user) => {
        if (err) {
            res.sendStatus(403);
        } else {
            req.user = user;
            next();
        }
    });
}

//Sends chat log .JSON file [1]
alessa.post('/api/mainchatget/',verifyToken,(req,res) => {
    res.setHeader("Content-type","application/json");
    try {readFile(mainChat,(err, data) => {
        if (err) {
            console.log(err);
        } else {
        let json = JSON.parse(data);
        res.send(json);
        };
        
    })} catch(err){
        console.log(err);
    }
});


//Accepts .JSON data and pushes into chat log .JSON file [1]
alessa.post('/api/mainchatpost/',verifyToken,(req,res) => {
    res.setHeader("Content-type","application/json");
    res.sendStatus(200);
    readFile(mainChat,(err,data) => {
        if (err) {
            console.log(err);
        } else {
            let json = JSON.parse(data);
            if (req.body.message !== null) {
                json.push(req.body.message);
                writeFile(mainChat,JSON.stringify(json),(err) => {
                    if (err) {
                        console.log(err);
                }
            }); 
            }
             
        }
    });
});

//Takes in user signup info and compares it to DB. if user already exists, throws back error. If user does not exists, creates a new
//entry into the database with a hashed password.
alessa.post('/api/users/signup', async(req,res) => {
    try {
        const user = req.body;
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = {firstName: user.firstName, lastName: user.lastName, username: user.username, password: hashedPassword, email: user.email};
        const fileRead = await readFilePromise(users);
        const parsedUsers = JSON.parse(fileRead)
        if (parsedUsers.length === 0) {
            parsedUsers.push(newUser);
            await writeFilePromise(users, JSON.stringify(parsedUsers));
            res.send('ok');
        };
        if (parsedUsers.length !== 0) {
            parsedUsers.forEach((e) => {
                if (e.username === user.username) {
                    res.send('Username already exists');
                } else if (e.email === user.email) {
                    res.send('Email already registered');
                } else {
                    parsedUsers.push(newUser);
                    writeFilePromise(users, JSON.stringify(parsedUsers));
                    res.send('ok');
                }
            })
        };   
    } catch {
        res.status(401);
    }
});




//Activates server, logs a message when successful
alessa.listen(8000,() => {
    console.log('Backend server listening on port 8000');
});

//[1] Bugged. Initial GET request successful and any POST request successful, but after first 1-3 POST requests
//(sending messages to append to chat.json), GET request throws back a 500 server error.
