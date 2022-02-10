const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const app = express();
const pool = require("./db");

app.use(express.json()); // => req.body

///////////////////////////////////////////////////////////////////////////////
// envelope api part
///////////////////////////////////////////////////////////////////////////////
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



///////////////////////////////////////////////////////////////////////////////
// transcation api part
///////////////////////////////////////////////////////////////////////////////

// read all transcation
app.get("/transcations", async (req, res) => {
    try {
        const allTranscations = await pool.query("SELECT * FROM transcation");
        res.json(allTranscations.rows);
    } catch (error) {
        console.error(error.message);
    }
})

// read a transcation
app.get("/transcations/:id", async (req, res) => {  
    try {
        const {id} = req.params;
        const transcation = await pool.query(
            "SELECT * FROM transcation WHERE transcation_id = $1", 
            [id]
        );

        res.json(transcation.rows[0]);
    } catch (error) {
        console.error(error.message);
    }
})

// create a transcation
app.post("/transcations", async (req, res) => {
    try {
        const date = req.body.date;
        const amount = req.body.amount;
        const recipient = req.body.recipient;
        const envelope_id = req.body.envelope_id;

        const newTranscation = await pool.query(
            "INSERT INTO transcation (date, amount, recipient, envelope_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [date, amount, recipient, envelope_id]
        );

        const updateEnvelope = await pool.query(
            "UPDATE envelope SET current_balance = current_balance-$1 WHERE envelope_id = $2 RETURNING *",
            [amount, envelope_id]
        );

        res.json(newTranscation.rows[0]);
        
    } catch(error) {
        console.error(error.message);
    }
})

// update a transcation
app.put("/transcations/:id", async (req, res) => {
    try {
        const {id} = req.params;

        const date = req.body.date;
        const amount = req.body.amount;
        const recipient = req.body.recipient;
        const envelope_id = req.body.envelope_id;

        // can only update date, recipient
        const updateTranscation = await pool.query(
            "UPDATE transcation SET date = $1, amount = $2, recipient = $3, envelope_id = $4 WHERE envelope_id = $5",
            [date, amount, recipient, envelope_id, id]
        );

        res.json("Transcation was updated");
    } catch (error) {
        console.error(error.message);
    }
})

// delete a transction
app.delete("/transcations/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const deleteTranscation = await pool.query(
            "DELETE FROM transcation WHERE transcation_id = $1",
            [id]
        );

        res.json("Transcation was deleted");
    } catch (error) {
        console.error(error.message);
    }
})

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})