const express = require('express');
const session = require('express-session')
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
    secret: 'dog-walking-secret',
    resave: false,
    saveUninitialized: true
}));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const dogRoutes = require('./routes/dogRoutes');
// Inport MySQL connection pool
const pool = require('./models/db');



app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dogs', dogRoutes);

// login endpoint to verify credentails and store session data
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const conn = await pool.getConnection();
        // Query to verify username and password 
        const [rows] = await conn.execute(
            `SELECT user_id, username, role FROM Users WHERE username = ? AND password_hash = ?`,
            [username, password]
        );
        conn.release();

        if (rows.length > 0){
            req.session.user = {
                user_id: rows[0].user_id,
                username:rows[0].username,
                role: rows[0].role
            };
            return res.json({ role: rows[0].role});
        }
        res.status(401).json({error: 'Invalid credentials'})
    }catch (err) {
        console.error(err);
        res.status(500).json({error:'Sever error during login'});
    }
});

// Logout route
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({error: 'Failed to logout'});
        }
        res.clearCookie('connect.sid');
        res.json({message:'Logged out successfully'});
    });
});

// Export the app instead of listening here
module.exports = app;