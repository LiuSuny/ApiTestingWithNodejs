//const express = require("express");
//const fs = require("fs");
//const pg = require("pg");
//const fetch = require("node-fetch");

import fs from "fs";
import pg from "pg";
import express from "express";
import fetch from "node-fetch"
import env from "dotenv";






// const config = {
//     connectionString: 
//     "postgres:"
//     ssl: {
//         rejectUnauthorized: true,
//         ca: fs.readFileSync("/home/runner/.postgresql/root.crt").toString(),
//     },
// };

//const client = new pg.Client(config);

//Next we config our database
const config = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "World",
    password: "admin12345",
    port: 5432
  });

  const client = new pg.Client(config);

  const app = express();
  const Port = 3000;
  app.use(express.json());
  
  const TABLE_NAME = 'username';

  // Connect to the database and create table if not exists
client.connect(err => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to the database');
        client.query(`
            CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                status VARCHAR(50),
                species VARCHAR(50),
                type VARCHAR(50),
                gender VARCHAR(50),
                origin VARCHAR(255),
                location VARCHAR(255),
                image VARCHAR(255),
                url VARCHAR(255),
                created TIMESTAMP
            );
        `, (err, res) => {
            if (err) console.error('Table creation error', err.stack);
            else console.log('Table is ready');
        });
    }
});

// Fetch characters from the API and insert into the database
const fetchAndInsertCharacters = async () => {
    let characters = [];
    let url = "https://rickandmortyapi.com/api/character";

    while (url) {
        const res = await fetch(url);
        const data = await res.json();
        characters = characters.concat(data.results);
        url = data.info.next;
    }

    for (const character of characters) {
        const query = `
            INSERT INTO ${TABLE_NAME} (name, status, species, type, gender, origin, location, image, url, created)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT DO NOTHING;
        `;
        const values = [
            character.name,
            character.status,
            character.species,
            character.type || "",
            character.gender,
            character.origin.name,
            character.location.name,
            character.image,
            character.url,
            character.created
        ];
        await client.query(query, values);
    }
};

// Endpoint to fetch characters from the API and insert into the database
app.post("/api/fetchAndInsert", async (req, res) => {
    try {
        await fetchAndInsertCharacters();
        res.status(200).send("Characters fetched and inserted successfully!");
    } catch (err) {
        console.error('Error fetching and inserting characters', err);
        res.status(500).send("Error fetching and inserting characters.");
    }
});

// Endpoint to get characters from the database
app.get("/api/characters", async (req, res) => {
    try {
        const result = await client.query(`SELECT * FROM ${TABLE_NAME}`);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching characters from database', err);
        res.status(500).send("Error fetching characters from database.");
    }
});

// Serve the HTML page
app.get("/", (req, res) => {
    res.sendFile("index.html");
});



app.listen(Port, ()=>{
    console.log(`Port running on port: ${Port}.`);
});

