const express = require('express');
const alessa = express();
const path = require('path');
const chatJson = path.join(__dirname, '/database', 'chat.json');

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
    res.json(req.body);
    console.log(req.body);
});

alessa.listen(8000,() => {
    console.log('Backend server listening on port 8000');
});