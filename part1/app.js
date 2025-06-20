const express = require('express');
const mysql = require('mysql12/promise');
const app = express();
const PORT = 8080;

// connect to database
async function main(){
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'DogWalkService'
        });

        // insert data for API testing
        await connection.execute(`
            INSERT INTO users(username, email, password_hash, role) VALUES
            ('alice123', 'alice@example.com', 'hashed123', 'owner'),
            ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
            ('carol123', 'carol@example.com', 'hashed789', 'owner'),
            ('davewalker', 'dave@example.com', 'hashed000', 'walker'),
            ('emily456', 'emily@example.com', 'hashed111', 'owner');
            `);
        await connection.execute(`
            INSERT INTO Dogs (owner_id, name, size) VALUES
            ((SELECT user_id FROM Users Where username = 'alice123'), 'Max', 'medium'),
            ((SELECT user_id FROM Users Where username = 'carol123'), 'Bella', 'small'),
            ((SELECT user_id FROM Users Where username = 'alice123'), 'Rocky', 'large'),
            ((SELECT user_id FROM Users Where username = 'emily456'), 'Luna', 'medium'),
            ((SELECT user_id FROM Users Where username = 'carol123'), 'Charlie', 'small');
            `)
        await connection.execute(`
            INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
            ((SELECT dog_id FROM Dogs WHERE name = 'Max' AND owner_id = (SELECT user_id FROM Users WHERE username = 'alice123')), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Bella' AND owner_id = (SELECT user_id FROM Users WHERE username = 'carol123')), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Rocky' AND owner_id = (SELECT user_id FROM Users WHERE username = 'alice123')), '2025-06-10 07:00:00', 60, 'South Terrace ', 'open'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Luna' AND owner_id = (SELECT user_id FROM Users WHERE username = 'emily456')), '2025-06-10 17:00:00', 60, 'South Terrace', 'cancelled'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Charlie' AND owner_id = (SELECT user_id FROM Users WHERE username = 'carol123')), '2025-06-10 17:00:00', 60, 'South Terrace', 'open');
            `)
        await connection.execute(`
            INSERT INTO rating (request_id, rating) VALUES
            ((SELECT request_id FROM walkrequests WHERE status = 'completed' AND
            dog_id = (SELECT dog_id FROM dogs WHERE name = 'Max')), 5)
        `);

        // /api/dogs
        // Return a list of all dogs with their size and owner's username
        app.get('api/dogs', async (req, res) =>{
            try {
                const [rows] = await connection.execute(`
                    SELECT d.name AS dog_name, d.size, u.username AS owner_username
                    FROM dogs d JOIN users u ON d.owner_id = u.user_id
                    `);
                    res.json(rows);
            } catch(err) {
                console.error(err);
                res.status(500).json({error: 'Failed to fetch dogs.'});
            }
        });

        // api/walkrequests/open
        // Return all open walk requests, including the dog name, requested time, location, and owner's username.
        app.get('/api/walkrequests/open', async (req, res) => {
            try {
                const [rows] = await connection.execute(`
                    SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location, u.username AS owner_username
                    FROM walkrequests wr
                    JOIN dogs d ON wr.dog_id = d.dog_id
                    JOIN users u ON wr.owner_id = u.user_id
                    WHERE wr.status = 'open'
                    `);
                    res.json(rows);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to fetch open walk requests.'});
            }
        });

        // /api/walkers/summary
        // Return a summary of each walker with their average rating and number of completed walks.
        app.get('/api/walkers/summary', async(req, res) => {
            try {
                const [rows] = await connection.execute(`
                    SELECT u.username AS walker_username,
                    COUNT(r.rating_id) AS total_ratings,
                    ROUND(AVG(r.rating), 1) AS average_rating,
                    COUNT(DISTINCT wr.request_id) AS completed_walks
                    FROM users u
                    LEFT JOIN walkerquests wr ON u.user_id = wr.accepted_walker_id AND wr.status = 'completed'
                    LEFT JOIN ratings r ON wr.request_id = r.request_id
                    WHERE u.role = 'walker'
                    GROUP BY u.username
                    `);
                    res.json(rows);
            }catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to fetch walkers summary.'});
            }
        });
    }
};