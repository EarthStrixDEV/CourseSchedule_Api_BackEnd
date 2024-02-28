const express = require("express");
const router = express.Router();
const pool = require("../databases/db");

router.get("/getAllCourses", async (request, response) => {
    try {
        const query = await pool.query("SELECT * FROM mykusubjecttable");
        const rows = await query[0];
        response.json(rows);
    } catch (error) {
        console.error(error);
        response.json({
            status: 'error',
            message: error
        })
    }
});

router.get('/getCourse/:id',async (request ,response) => {
    const id = request.params.id;
    try {
        const query = await pool.query("SELECT * FROM mykusubjecttable WHERE subject_id = ?",[id])
        const rows = await query[0]
        response.json(rows);
    } catch (error) {
        console.error(error);
        response.json({
            status: 'error',
            message: error
        })
    }
})

router.post("/importCourse", async (request, response) => {
    const { subject_id, subject_nameTH ,subject_nameEN, credit ,type ,school_year } = request.body;
    try {
        const query = await pool.query("INSERT INTO mykusubjecttable (subject_real_id ,subject_nameTH ,subject_nameEN, credit, enable ,type , school_year) VALUES (? ,? ,? ,? ,0 ,? ,?)",[subject_id ,subject_nameTH ,subject_nameEN, credit , type ,school_year]);
        const result = await query[0]
        response.json({
            status: 'success',
            data: result
        })
    } catch (error) {
        console.error(error);
        response.json({
            status: 'error',
            message: error
        })
    }
});

router.post("/isEnableCourse/:name", async(request, response) => {
    const {enable} = request.query
    const subject_name = request.params.name
    try {
        const query = await pool.query("UPDATE mykusubjecttable SET enable = ? WHERE subject_name = ?",[enable ,subject_name])
        const result = await query[0]
        response.json({
            status: 'success',
            data: result
        })
    } catch (error) {
        console.error(error);
        response.json({status: 'error', message: error});
    }
});

router.post('/editCourse/:id' ,async (request ,response) => {
    const { subject_name, credit ,type ,school_year } = request.body;
    const subject_id = request.params.id;
    try {
        const query = await pool.query("UPDATE mykusubjecttable SET subject_name = ?, credit = ? ,type = ? ,school_year = ? WHERE subject_id = ?",[subject_id,subject_name,credit ,type,school_year])
        const result = await query[0]
        response.json({
            status: 'success',
            result: result
        })
    } catch (error) {
        console.error(error);
        response.json({status: 'error', message: error});
    }
})

router.get('/deleteCourse/:subject_id', async (request, response) => {
    const subject_id = request.params.subject_id;
    try {
        const query = await pool.query("DELETE FROM mykusubjecttable WHERE subject_id = ?",[parseInt(subject_id)])
        const result = await query[0]
        response.json({
            status: 'success',
            result: result
        })
    } catch (error) {
        console.error(error);
        response.json({status: 'error', message: error});
    }
})

// check course collision 
const scheduleCourseCollisions = async(subject_id ,start_time ,end_time ,date) => {
    try {
        const all_course = await pool.query('SELECT * FROM mykusumtable')
        const data = await all_course[0]
        const collisionFound = data.some(item => {
            if (item.date === date) {
                if ((start_time >= item.start_time && end_time <= item.end_time) ||
                    (start_time <= item.start_time && end_time >= item.start_time)) {
                    return true; // Collision found
                }
            }
            return false; // No collision
        });

        return collisionFound;
    } catch (error) {
        console.error(`Database query error: ${error}`);
    }
}

// booking Course
router.post('/BookingCourseToMain/:subject_id', async (request, response) => {
    const {subject_id ,subject_eng_name ,start_time ,end_time ,date ,section ,major_year ,student_count} = request.body
    
    try {
        const query = await pool.query('INSERT INTO mykusumtable (subject_id ,subject_eng_name ,start_time ,end_time ,date ,section ,major_year ,student_count) VALUES (? ,? ,? ,? ,? ,? ,? ,?)',[subject_id ,subject_eng_name ,start_time ,end_time ,date ,section ,major_year ,student_count])
        const result = await query[0]
        if (scheduleCourseCollisions(subject_id ,start_time ,end_time ,date)) {
            response.json({
                status: 'Booking course successfully',
                data: result,
                isCollision: true
            })
        } else {
            response.json({
                status: 'Booking course successfully',
                data: result,
                isCollision: false
            })
        }
    } catch (error) {
        console.error(error);
        response.json({
            status: `Database query error: ${error}`,
        })
    }
})

module.exports = router;