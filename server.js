const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv').config();
const app = express();
const port = process.env.PORT;

// import controller
const user = require('./controller/user')
const course = require('./controller/course')
const admin = require('./controller/admin')
const room = require('./controller/room')

// set up middleware
app.use(express.json());
app.use(express.urlencoded({
    extended: false,
}))
app.use(cors());
// use route controller
app.use('/user' ,user)
app.use('/course', course)
app.use('/admin' ,admin)
app.use('/room', room)

// test server
app.get('/', (request ,response) => {
    try {
        response.sendStatus(200);
    } catch (err) {
        request.sendStatus(500);
    }
})

// start server
app.listen(port ,() => {
    console.log(`[server]: Server is listening on http://localhost:${port}`);
});