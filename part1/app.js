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
    }
}