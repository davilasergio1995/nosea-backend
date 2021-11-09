/* Imports/setup for the server. Imports the Express.js library, sets the server (alessa) up, imports necessary modules
(path, readFile, writeFile), and imports outside files that make up database */

const express = require('express');
const alessa = express();
const path = require('path');
const chatJson = path.join(__dirname, '/database', 'chat.json');
const users = path.join(__dirname, '/database','users.json');
const {readFile, writeFile} = require('fs');
const bcrypt = require('bcrypt');
const util = require('util');
const e = require('express');
const readFilePromise = util.promisify(readFile);
const writeFilePromise = util.promisify(writeFile);

//parses JSON data
alessa.use(express.json());

//allows use of files from specified folder (not yet implemented but code added for potential usability)
alessa.use(express.static('database'));

//Sends chat log .JSON file [1]
alessa.get('/api/chatLogs/',(req,res) => {

    res.header("Content-type" , "application/json");
    res.sendFile(chatJson);
    
});


//Accepts .JSON data and pushes into chat log .JSON file [1]
alessa.post('/api/chatLogs/',(req,res) => {
    res.sendStatus(200);
    req.body;
    readFile(chatJson,(err,data) => {
        if (err) {
            console.log(err);
        } else {
            let json = JSON.parse(data);
            json.push(req.body);
            writeFile(chatJson,JSON.stringify(json), (err) => {
                if (err) {
                    console.log(err);
                }
            })
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

//Signs user in. If user exists and username/password are valid, server returns a token. If user doesn't exist or username/password
//aren't valid, user receives an error.
alessa.post('/api/users/login', async (req,res) => {
    let login=req.body;
    let fileRead = await readFilePromise(users);
    let parsedUsers = JSON.parse(fileRead);
    let user = parsedUsers.find(e => e.username === login.username);
    if (user === null) {
        res.status(400).send('User doesn\'t exist');
    };
    try {
        if (await bcrypt.compare(login.password,user.password)) {
            res.send('a-ok');
        } else {
            res.send('Username/password incorrect');
        }
    } catch {
        res.status(500).send();
    }
});


//Activates server, logs a message when successful
alessa.listen(8000,() => {
    console.log('Backend server listening on port 8000');
});

//[1] Bugged. Initial GET request successful and any POST request successful, but after first 1-3 POST requests
//(sending messages to append to chat.json), GET request throws back a 500 server error.

//[2] Extremely insecure. Security libraries such as Bcrypt offer fixes, will implement in a later session