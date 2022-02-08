CREATE DATABASE personal_budget_database;

--\c into personal_budget_database

CREATE TABLE envelope(
    envelope_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255),
    current_balance DECIMAL(10,2)
);