/* Imports/setup for the server. Imports the Express.js library, sets the server (alessa) up, imports necessary modules
(path, readFile, writeFile), and imports outside files that make up database */

const express = require('express');
const alessa = express();
const path = require('path');
const chatJson = path.join(__dirname, '/database', 'chat.json');
const users = path.join(__dirname, '/database','users.json');
const {readFile, writeFile} = require('fs');

//parses JSON data
alessa.use(express.json());

//allows use of files from specified folder (not yet implemented but code added for potential usability)
alessa.use(express.static('database'));

//Sends chat log .JSON file [1]
alessa.get('/api/chatLogs',(req,res) => {

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

//Receives login info from front end, then compares it to the data inside the users.json file [2]
alessa.post('/api/users', (req,res) => {
    const login = req.body;
    readFile(users,(err,data) => {
        if (err) {
            console.log(err);
        } else {
            let json = JSON.parse(data);
            json.forEach((e) => {
                if (e.username === login.username && e.password === login.password) {
                    res.send('yes');
                } else {
                    res.send('no')
                }
            });
        }
    })
})

//Activates server, logs a message when successful
alessa.listen(8000,() => {
    console.log('Backend server listening on port 8000');
});

//[1] Bugged. Initial GET request successful and any POST request successful, but after first 1-3 POST requests
//(sending messages to append to chat.json), GET request throws back a 500 server error.

//[2] Extremely insecure. Security libraries such as Bcrypt offer fixes, will implement in a later session