const express = require('express');
const router = express.Router();
const pool = require('../models/db');

//Return all dogs in the system
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query()
    }
})