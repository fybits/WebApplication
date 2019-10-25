const express = require('express')
const crypto = require('crypto')
var cookieParser = require('cookie-parser')

const port = 8000;

const app = express()
app.use(cookieParser())


app.get('/', (request, response) => {
    console.log("User connected!")
    console.log("remote address: "+request.ip)
    console.log("cookies: "+JSON.stringify(request.cookies))
    if (!request.cookies['userid'])
        response.cookie("userid", crypto.randomBytes(20).toString('hex'))
    response.send("Hello world from express!")
})


app.listen(8000, (err) => {
    if (err) {
        return console.log('Error has occured!', err)
    }
    console.log(`Server is listening on port ${port}`)
})