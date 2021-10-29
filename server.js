const express = require('express');
const alessa = express();
const path = require('path');
const chatJson = path.join(__dirname, '/database', 'chat.json');
const {readFile, writeFile} = require('fs');

//parses JSON data
alessa.use(express.json());

//Sends .JSON file 
alessa.get('/api/chatLogs',(req,res) => {
    res.header("Content-type" , "application/json");
    res.sendFile(chatJson);
})

//Accepts .JSON data
alessa.post('/api/chatLogs',(req,res) => {
    req.body;
    let test = JSON.stringify(req.body);
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

alessa.listen(8000,() => {
    console.log('Backend server listening on port 8000');
});