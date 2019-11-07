const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const MongoClient = require('mongodb').MongoClient

const mongoClient = new MongoClient("mongodb://localhost:27017/", {useNewUrlParser: true, useUnifiedTopology: true})

const port = 8000;

const app = express()
app.use(cookieParser())
app.use(bodyParser.urlencoded({'extended': true}))

app.get('/', (request, response) => {
    console.log("User connected!")
    if (!request.cookies.userid) {
        console.log('Not authorized user')
        response.sendFile('html/loginpage.html',{root:'.'})
    } else {
        mongoClient.connect((err, client) => {
            const db = client.db('admin')
            const collection = db.collection('users')
            collection.findOne({'userid': request.cookies.userid}, (err, result) => {
                if (err) {
                    response.send(err)
                } else if (result) {
                    // response.sendFile('html/home.html', {root:'.'})
                    response.send(`<p>Welcome, ${result.nickname}!</p><a href="/exit">exit</a>`)
                }
                client.close()
            })
        })
    }
    console.log("remote address: ",request.ip)
    console.log("cookies: ",request.cookies)
    
    //response.send("Hello world from express!")
})

app.get('/exit', (request,response) => {
    response.cookie("userid", '')
    response.redirect('/')

})

app.post('/login', (request,response) => {
    mongoClient.connect((err, client) => {
        const db = client.db('admin')
        const collection = db.collection('users')
        collection.findOne({'nickname': request.body.nickname}, (err, result) => {
            if (result) {
                if (crypto.createHash('md5').update(request.body.password).digest('hex') == result.password) {
                    response.cookie("userid", result.userid)
                    response.redirect('/')
                } else {
                    response.send('<p>Wrong password.<p>')
                }
            } else {
                response.send(`<p>There is no user with name ${request.body.nickname}.</p>`)
            }
        })
    })
})


app.post('/register', (request,response) => {
    let userid = crypto.randomBytes(20).toString('hex')
    mongoClient.connect((err, client) => {
        const db = client.db('admin')
        const collection = db.collection('users')
        collection.findOne({'nickname': request.body.nickname}, (err, result) => {
            if (result){
                response.send('<p>Name already occupied!</p><a href="/">try again</a>')
            } else {
                if (request.body.password.length > 6) {
                    response.cookie("userid", userid)
                    collection.insertOne({'userid': userid, 'nickname': request.body.nickname, 'password': crypto.createHash('md5').update(request.body.password).digest('hex')})
                    response.redirect('/')
                } else {
                    response.send('<p> password must be at least 6 characters long!</p>')
                }
            }
        })
        //client.close()
    })
})

app.listen(8000, (err) => {
    if (err) {
        return console.log('Error has occured!', err)
    }
    console.log(`Server is listening on port ${port}`)
})
  