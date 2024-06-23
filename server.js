const express = require('express');
const app = express();
const bodyParser = require('body-parser');  
const cors = require('cors');


app.use(cors());    
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});