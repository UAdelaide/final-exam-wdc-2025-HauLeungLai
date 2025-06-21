const express = require('express');
const router = express.Router();
const pool = require('../models/db');

//Return all dogs in the system
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Dogs'); // Query all dog records
        res.json(rows);
    }catch (error) {
        console.error('Failed to fetch dogs:', error); // Log error to server
        res.status(500).json({error: 'Failed to fetch dogs'});
    }
});

module.exports = router; //