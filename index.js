const express = require('express')
const cookieParser = require('cookie-parser')
const crypto = require('crypto')
const MongoClient = require('mongodb').MongoClient

const mongoClient = new MongoClient("mongodb://localhost:27017/", {useNewUrlParser: true, useUnifiedTopology: true})

const port = 8000;

const app = express()
app.use(cookieParser())

app.get('/', (request, response) => {
    console.log("User connected!")
    if (!request.cookies['userid']) {
        let userid = crypto.randomBytes(20).toString('hex')
        mongoClient.connect((err, client) => {
            const db = client.db('admin')
            const collection = db.collection('users')
            collection.insertOne({'userid': userid})

            mongoClient.close()
        })
        response.cookie("userid", userid)
    }
    console.log("remote address: "+request.ip)
    console.log("cookies: "+JSON.stringify(request.cookies))
    
    response.send("Hello world from express!")
})


app.listen(8000, (err) => {
    if (err) {
        return console.log('Error has occured!', err)
    }
    console.log(`Server is listening on port ${port}`)
})