const express = require('express');
const pool = require('../databases/db');
const router = express.Router();

// update database
const room_seat_updater = async(room_id) => {
    try {
        const query = await pool.query('SELECT * FROM mykuroomtable WHERE room_id = ?',[room_id])
        const room_seat_ = await query[0].room_seat
        const room_seat_used_ = await query[0].room_seat_used
        if (room_seat_used_ === room_seat_) {
            try {
                const query = await pool.query('UPDATE mykuroomtable SET room_isFull = 1 WHERE room_id = ?',[room_id])
            } catch (err) {
                console.error(`Database query error: ${err}`);
            }
        }
    } catch (error) {
        console.error(`Database query error: ${error}`);
    }
}

// check room is full or not
const room_isFull = async(room_id) => {
    try {
        const query = await pool.query(`SELECT * FROM mykuroomtable WHERE room_id = ${room_id}`)
        const result = await query[0].room_isFull
        return room_isFull === 1 ? true : false;
    } catch (error) {
        console.error("Database query error: "+error);
    }
}

// get room data
router.get('/getAllRoom' ,async(request ,response) => {
    try {
        const query = await pool.query(`SELECT * FROM mykuroomtable`)
        const result = await query[0]
        response.json(result)
    } catch (error) {
        console.error(error);
        response.json({
            status: 'Database query error',
            error: error
        })
    }
})

// add room to database
router.post('/importRoom', async(request ,response) => {
    const {room_number ,room_seat} = request.body
    try {
        const query = await pool.query('INSERT INTO mykuroomtable (room_number ,room_seat ,room_seat_used ,room_isFull) VALUES (?, ? ,0 ,0)', [room_number, room_seat])
        const result = await query[0]
        response.json({
            status: 'Room added successfully'
        })
    } catch (error) {
        console.error(error);
        response.json({
            status: 'Database query error',
            error: error
        })
    }
})

// update room
router.post('/updateRoom/:id', async(request ,response) => {
    const id = request.params.id
    const {room_seat ,room_number} = request.body
    try {
        const query = await pool.query('UPDATE mykuroomtable SET room_number = ? ,room_seat = ? WHERE room_id = ?',[room_number ,room_seat ,id])
        const result = await query[0]
        response.json({
            status: 'Room updated successfully'
        })
    } catch (error) {
        console.error('Database query error: ', error);
        response.json({status: 'Database query error'});
    }
})

// delete room
router.post('/deleteRoom/:id',async(request ,response) => {
    const id = request.params.id
    try {
        const query = await pool.query('DELETE mykuroomtable WHERE room_id = ?',[id])
        const result = await query[0]
        response.json({
            status: 'delete room successfully'
        })
    } catch (error) {
        console.error(`Database query error: ${error}`);
        response.json({status: 'Database query error'});
    }
})

// booking subject and update seat
router.post('/bookingSubject' ,async(request, response) => {
    const {room_id ,room_number ,subject_id ,user_id ,subject_eng_name ,user_name, classroom_start_time ,classroom_end_time} = request.body
    
    if (room_isFull()) {
        response.json({
            status: `Room ${room_number} is full ,please try again`,
        })
        return
    }
        
    try {
        const query = await pool.query('INSERT INTO mykuclassroomtable (room_id ,subject_id ,user_id ,subject_eng_name ,user_name, room_number ,classroom_start_time ,classroom_end_time) VALUES (? ,? ,? ,? ,? ,? ,? ,?)',[room_id,subject_id,user_id,subject_eng_name, user_name, room_number, classroom_start_time, classroom_end_time])
        const query_update_seat = await pool.query('UPDATE mykuroomtable SET room_seat_used = room_seat_used + 1 WHERE room_id = ?',[room_id])
        room_seat_updater(room_id)
        response.json({
            status: 'Booked classroom successfully'
        })
    } catch (error) {
        console.error(error);
        response.json({
            status: 'Database query error'
        })
    }
})

// delete room
router.get('/deleteRoom/:id' ,async(request ,response) => {
    const id = request.params.id;
    try {
        const query = await pool.query('DELETE FROM mykuroomtable WHERE room_id = ?',[id])
        const result = await query[0]
        response.json({
            status: 'Delete Room Success'
        })
    } catch (error) {
        console.error(`Database query error: ${error}`);
        response.json({
            status: 'Database query error'
        })
    }
})

module.exports = router