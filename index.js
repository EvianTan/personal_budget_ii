const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const app = express();
const pool = require("./db");

app.use(express.json()); // => req.body

// ROUTES //

// get all envelopes
app.get("/envelopes", async (req, res) => {
    try {
        const allEnvelopes = await pool.query("SELECT * FROM envelope");
        res.json(allEnvelopes.rows);
    } catch (error) {
        console.error(error.message);
    }
})

// get an envelope
app.get("/envelopes/:id", async (req, res) => {  
    try {
        const {id} = req.params;
        const envelope = await pool.query(
            "SELECT * FROM envelope WHERE envelope_id = $1", 
            [id]
        );

        res.json(envelope.rows[0]);
    } catch (error) {
        console.error(error.message);
    }
})

// create an envelope
app.post("/envelopes", async (req, res) => {
    try {
        const name = req.body.name;
        const description = req.body.description;
        const current_balance = req.body.current_balance;

        const newEnvelope = await pool.query(
            "INSERT INTO envelope (name, description, current_balance) VALUES ($1, $2, $3) RETURNING *",
            [name, description, current_balance]
        );

        res.json(newEnvelope.rows[0]);
        
    } catch(error) {
        console.error(error.message);
    }
})

// update an envelope
app.put("/envelopes/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const name = req.body.name;
        const description = req.body.description;
        const current_balance = req.body.current_balance;

        const updateEnvelope = await pool.query(
            "UPDATE envelope SET name = $1, description = $2, current_balance = $3 WHERE envelope_id = $4",
            [name, description, current_balance, id]
        );

        res.json("Envelope was updated");
    } catch (error) {
        console.error(error.message);
    }
})

// delete an envelope
app.delete("/envelopes/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const deleteEnvelope = await pool.query(
            "DELETE FROM envelope WHERE envelope_id = $1",
            [id]
        );

        res.json("Envelope was deleted");
    } catch (error) {
        console.error(error.message);
    }
})

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})