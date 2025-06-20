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

        // insert test data
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
    }
}