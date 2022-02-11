const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const app = express();
const pool = require("./db");

app.use(express.json()); // => req.body

const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


///////////////////////////////////////////////////////////////////////////////
// envelope api part
///////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * components:
 *  schemas:
 *      Envelope:
 *          type: object
 *          required: 
 *              - name
 *              - description
 *              - current_balance
 *          properties:
 *              envelope_id:
 *                  type: integer
 *                  description: The auto-generated id of the envelope
 *              name:
 *                  type: string
 *                  description: The title of the budget envelope
 *              description:
 *                  type: string
 *                  description: The detail info of the budget envelope
 *              current_balance:
 *                  type: decimal
 *                  description: The current balance of the budget envelope
 *          example:
 *              envelope_id: 2
 *              name: food
 *              description: the expense for food
 *              current_balance: 600
 */

/**
 * @swagger
 * tags:
 *  name: Envelopes
 *  description: The envelopes managing API
 */

/**
 * @swagger
 * /envelopes:
 *  get:
 *      summary: Returns the list of all the envelopes
 *      tags: [Envelopes]
 *      responses:
 *          200:
 *              description: The list of the envelopes
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: "#/components/schemas/Envelope"
 */

// get all envelopes
app.get("/envelopes", async (req, res) => {
    try {
        const allEnvelopes = await pool.query("SELECT * FROM envelope");
        res.json(allEnvelopes.rows);
    } catch (error) {
        console.error(error.message);
    }
})


/**
 * @swagger
 * /envelopes/{id}:
 *  get:
 *      summary: Returns the envelope by id
 *      tags: [Envelopes]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: the envelope id 
 *      responses:
 *          200:
 *              description: The envelope description by id
 *              content:
 *                  application/json:
 *                      schema:
 *                          items:
 *                              $ref: "#/components/schemas/Envelope"
 *          404:
 *              description: The envelope was not found
 */
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
        return res.status(404).send(error);
    }
})

/**
 * @swagger
 * /envelopes:
 *  post:
 *      summary: Create a new envelope
 *      tags: [Envelopes]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/Envelope" 
 *      responses:
 *          200:
 *              description: The envelope was successfully created
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/Envelope"
 *          500:
 *              description: Some server error
 */

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
        return res.status(500).send(error);
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
// transaction api part
///////////////////////////////////////////////////////////////////////////////

// read all transaction
app.get("/transactions", async (req, res) => {
    try {
        const allTransactions = await pool.query("SELECT * FROM transaction");
        res.json(allTransactions.rows);
    } catch (error) {
        console.error(error.message);
    }
})

// read a transaction
app.get("/transactions/:id", async (req, res) => {  
    try {
        const {id} = req.params;
        const transaction = await pool.query(
            "SELECT * FROM transaction WHERE transaction_id = $1", 
            [id]
        );

        res.json(transaction.rows[0]);
    } catch (error) {
        console.error(error.message);
    }
})

// create a transaction
app.post("/transactions", async (req, res) => {
    try {
        const date = req.body.date;
        const amount = req.body.amount;
        const recipient = req.body.recipient;
        const envelope_id = req.body.envelope_id;

        const newTransaction = await pool.query(
            "INSERT INTO transaction (date, amount, recipient, envelope_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [date, amount, recipient, envelope_id]
        );

        const updateEnvelope = await pool.query(
            "UPDATE envelope SET current_balance = current_balance-$1 WHERE envelope_id = $2 RETURNING *",
            [amount, envelope_id]
        );

        res.json(newTransaction.rows[0]);
        
    } catch(error) {
        console.error(error.message);
    }
})

// update a transaction
app.put("/transactions/:id", async (req, res) => {
    try {
        const {id} = req.params;

        // get old transaction
        const oldTransaction = await pool.query(
            "SELECT * FROM transaction WHERE transaction_id = $1", 
            [id]
        );
        const oldAmount = oldTransaction.rows[0].amount;
        const oldEnvelope = oldTransaction.rows[0].envelope_id;

        // new transaction
        const date = req.body.date;
        const amount = req.body.amount;
        const recipient = req.body.recipient;
        const envelope_id = req.body.envelope_id;

        
        // update this transaction
        const updateTransaction = await pool.query(
            "UPDATE transaction SET date = $1, amount = $2, recipient = $3, envelope_id = $4 WHERE transaction_id = $5",
            [date, amount, recipient, envelope_id, id]
        );

        // old envelope recover
        const oldEnvelopeRecover = await pool.query(
            "UPDATE envelope SET current_balance = current_balance+$1 WHERE envelope_id = $2",
            [oldAmount, oldEnvelope]
        );

        // new envelope substract
        const newEnvelopeSubstract = await pool.query(
            "UPDATE envelope SET current_balance = current_balance-$1 WHERE envelope_id = $2",
            [amount, envelope_id]
        );

        res.json("Transaction was updated");
    } catch (error) {
        console.error(error.message);
    }
})

// delete a transction
app.delete("/transactions/:id", async (req, res) => {
    try {
        const {id} = req.params;

        const transaction = await pool.query(
            "SELECT * FROM transaction WHERE transaction_id = $1", 
            [id]
        );
        const recoverAmount = transaction.rows[0].amount;
        const recoverEnvelope = transaction.rows[0].envelope_id;

        const deleteTransaction = await pool.query(
            "DELETE FROM transaction WHERE transaction_id = $1",
            [id]
        );
        
        const recoverDeletedEnvelope = await pool.query(
            "UPDATE envelope SET current_balance = current_balance+$1 WHERE envelope_id = $2",
            [recoverAmount, recoverEnvelope]
        );

        res.json("Transaction was deleted & envelope was recovered");
    } catch (error) {
        console.error(error.message);
    }
})

const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Express APIs",
        version: "1.0.0",
        description:
          "This is a simple CRUD API application made with Express and documented with Swagger",
      },
      servers: [
        {
          url: "http://localhost:3000",
        },
      ],
    },
    apis: ["./index.js"],
  };
  
  const specs = swaggerJsdoc(options);
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs,
        {
            explorer: true
        })
  );


app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})