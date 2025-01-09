const express = require('express');
const cors = require('cors');
const fs = require('node:fs');

// Load a token from file
let token = null;
fs.readFile('token.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    token = data.trim();
    console.log(token);
});

const app = express();

app.use(cors());
app.use(express.json());
app.post('/login', (req, res) => {
    console.log("called LOGIN; received " + req.method + ": " + req.body.username + ", " + req.body.password);

    res.send({
        token: token
    });
});
app.listen(8080, () => console.log('API is running on http://localhost:8080/login'));
