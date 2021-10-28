const express = require('express');
const alessa = express();
const path = require('path');
const chatJson = path.join(__dirname, '/database', 'chat.json');

alessa.get('/api/chatLogs',(req,res) => {
    res.header("Content-type" , "application/json");
    res.sendFile(chatJson);
})

alessa.listen(8000,() => {
    console.log('Backend server listening on port 8000');
});