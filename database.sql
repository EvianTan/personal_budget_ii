CREATE DATABASE personal_budget_database;

--\c into personal_budget_database

CREATE TABLE envelope(
    envelope_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255),
    current_balance DECIMAL(10,2)
);

CREATE TABLE transaction(
    transaction_id SERIAL PRIMARY KEY,
    date DATE,
    amount DECIMAL(10,2),
    recipient VARCHAR(255),
    envelope_id INTEGER,
    CONSTRAINT envelope FOREIGN KEY (envelope_id) REFERENCES envelope(envelope_id)
);