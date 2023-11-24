const express = require('express');
const app = express();
const sql = require('mssql');

// Azure SQL Database configuration
const config = {
    user: 'your_username',
    password: 'your_password',
    server: 'your_server.database.windows.net',
    database: 'your_database',
    options: {
        encrypt: true, // For security
        trustServerCertificate: false // Change as required
    }
};

// Connect to Azure SQL Database
sql.connect(config)
    .then(() => console.log('Connected to Azure SQL Database'))
    .catch(err => console.error('Connection failed', err));

// Express middleware to parse JSON
app.use(express.json());

// GET all items
app.get('/items', (req, res) => {
    new sql.Request()
        .query('SELECT * FROM Items')
        .then(result => {
            res.json(result.recordset);
        })
        .catch(err => {
            console.error('Error retrieving items', err);
            res.status(500).send('Error retrieving items');
        });
});

// POST (Create) a new item
app.post('/items', (req, res) => {
    const { name, description } = req.body;
    new sql.Request()
        .input('name', sql.NVarChar, name)
        .input('description', sql.NVarChar, description)
        .query('INSERT INTO Items (name, description) VALUES (@name, @description)')
        .then(() => {
            res.status(201).send('Item created successfully');
        })
        .catch(err => {
            console.error('Error creating item', err);
            res.status(500).send('Error creating item');
        });
});

// DELETE an item by ID
app.delete('/items/:id', (req, res) => {
    const itemId = req.params.id;
    new sql.Request()
        .input('id', sql.Int, itemId)
        .query('DELETE FROM Items WHERE id = @id')
        .then(() => {
            res.status(200).send(`Item with ID ${itemId} deleted`);
        })
        .catch(err => {
            console.error('Error deleting item', err);
            res.status(500).send('Error deleting item');
        });
});

// GET a specific item by ID
app.get('/items/:id', (req, res) => {
    const itemId = req.params.id;
    new sql.Request()
        .input('id', sql.Int, itemId)
        .query('SELECT * FROM Items WHERE id = @id')
        .then(result => {
            if (result.recordset.length === 0) {
                res.status(404).send(`Item with ID ${itemId} not found`);
            } else {
                res.json(result.recordset[0]);
            }
        })
        .catch(err => {
            console.error('Error retrieving item', err);
            res.status(500).send('Error retrieving item');
        });
});

// PUT (Update) an item by ID
app.put('/items/:id', (req, res) => {
    const itemId = req.params.id;
    const { name, description } = req.body;
    new sql.Request()
        .input('id', sql.Int, itemId)
        .input('name', sql.NVarChar, name)
        .input('description', sql.NVarChar, description)
        .query('UPDATE Items SET name = @name, description = @description WHERE id = @id')
        .then(() => {
            res.status(200).send(`Item with ID ${itemId} updated`);
        })
        .catch(err => {
            console.error('Error updating item', err);
            res.status(500).send('Error updating item');
        });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
