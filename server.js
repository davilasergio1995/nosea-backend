const express = require('express');
const alessa = express();
const path = require('path');
const chatJson = path.join(__dirname, '/database', 'chat.json');
const users = path.join(__dirname, '/database','users.json');
const {readFile, writeFile} = require('fs');

//parses JSON data
alessa.use(express.json());

alessa.use(express.static('database'));

//Sends .JSON file 
alessa.get('/api/chatLogs',(req,res) => {

    res.header("Content-type" , "application/json");
    res.sendFile(chatJson);
    
});


//Accepts .JSON data and pushes into .JSON
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

alessa.listen(8000,() => {
    console.log('Backend server listening on port 8000');
});