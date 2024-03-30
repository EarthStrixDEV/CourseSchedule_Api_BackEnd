const express = require('express')
const router = express.Router()
const pool = require('../databases/db')

var Session_ = null

router.get('/getAllUser' ,async(request ,response) => {
    try {
        const query = await pool.query("SELECT * FROM mykuusertable WHERE email = ?",[Session_])
        const rows = await query[0]
        response.json(rows)
    } catch (error) {
        console.error(error);
        response.json({
            status: 'error',
            message: error
        })
    }
})

router.post('/getUser',async(request ,response) => {
    const {email} = request.body
    try {
        const query = await pool.query('SELECT * FROM mykuusertable WHERE email = ?',[email])
        const result = await query[0]
        response.json(result)
    } catch (error) {
        console.error(error);
        response.json({
            status: 'error',
            message: error
        })
    }
})

router.post('/register' ,async(request ,response) => {
    const {name ,lastname ,email ,password} = request.body
    try {
        const query = await pool.query("INSERT INTO mykuusertable (name ,lastname ,email ,password) VALUES (?,?,?,?)" ,[name,lastname,email,password])
        const rows = await query[0]
        response.json({
            status: 'success',
            rows: query[0]
        })
    } catch (error) {
        console.error(error);
        response.json({
            status: 'error',
            message: error
        })
    }
})

router.post('/login' ,async(request ,response) => {
    const {email} = request.body
    try {
        const query = await pool.query("SELECT * FROM mykuusertable WHERE email = ?",[email])
        if (query[0].length > 0) {
            Session_ = query[0][0].email
            console.log(Session_);
            response.json({
                status: 'success',
                rows: query[0]
            })
        } else {
            response.json({
                status: 'not user found!',
            })
        }
    } catch (error) {
        console.error(error);
        response.json({
            status: 'error',
            message: error
        })
    }
})

module.exports = router