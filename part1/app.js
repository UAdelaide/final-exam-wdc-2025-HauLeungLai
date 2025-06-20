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

        await connection.execute(`

            `)
    }
}