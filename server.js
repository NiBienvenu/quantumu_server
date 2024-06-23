const express = require('express')
const cors = require('cors')

const ip = require("ip");

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


//Middlware

app.use(cors())


// routers
const ubunturouter = require('./routes/UbuntuRoute')

app.use('/vm', ubunturouter);

// test api

app.get('/', (req, res) => {
   res.header("Access-Control-Allow-Origin", "*")
   res.json({ message: 'Hello bienvenu 2' })
})

//port
const port = process.env.port || 8081
//server

app.listen(port, () => {
   console.log(`le serveur utilise le port ${port}`)
   console.log(`${(process.env.NODE_ENV)} - Server is running on : http://${ip.address()}:${port}/`);
})