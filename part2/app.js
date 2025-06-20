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
const { getConnection } = require('./models/db');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// login verification logic
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await getConnection.execute(
            `SELECT username, role FROM Users WHERE username = ? AND password_hash = ?`,
            [username, password]
        );

        if (row)
    }
})

// Export the app instead of listening here
module.exports = app;