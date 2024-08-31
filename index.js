require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const auth = require('basic-auth');
const odbc = require('odbc');
const { createPO } = require('./poService');
const { isValidDate } = require('./validator');
const { insertOrderQuery, getOrderDetailsQuery, insertMatchingDataQuery } = require('./queries');

// Initialize Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Basic Authentication Middleware
const basicAuth = (req, res, next) => {
  const credentials = auth(req);

  if (!credentials || credentials.name !== process.env.AUTH_USER || credentials.pass !== process.env.AUTH_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// Apply the authentication middleware to all routes
app.use(basicAuth);

// Set up MySQL connection using promises
const mysqlConnection = mysql.createPool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER,     
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// API endpoint to receive data
app.post('/api/orderNumber', async (req, res) => {
  const { orderNumber, date } = req.body;

  // Validate date format
  if (!isValidDate(date)) {
    return res.status(400).json({ error: 'Invalid date format. Expected format is dd/mm/yyyy' });
  }

  try {
    // Insert order into MySQL database
    const [results] = await mysqlConnection.query(insertOrderQuery, [orderNumber, date]);
    console.log('MySQL Insert Results:', results);

    res.status(200).json({ message: 'Data inserted successfully', results });

    // Call function to check for drop shipping after MySQL insertion
    await checkingForDropShipping(orderNumber);

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.error('Duplicate entry detected:', err.message);
      return res.status(409).json({ error: 'Order already exists', details: err.message });
    }
    console.error('Error executing MySQL query:', err.stack);
    res.status(500).json({ error: 'Database error', details: err.stack });
  }
 

   
    });

    app.put('/api/updatePoId', async (req, res) => {
      const { oldPoId = 0, newPoId, orderNumber } = req.body;
    
      if (!newPoId || !orderNumber) {
        return res.status(400).json({ error: 'newPoId and orderNumber are required' });
      }
    
      try {
        const updatePoIdQuery = 'UPDATE salesorder SET po_id = ? WHERE po_id = ? AND orderId = ?';
        const [result] = await mysqlConnection.query(updatePoIdQuery, [newPoId, oldPoId, orderNumber]);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'No matching records found to update' });
        }
  
        res.status(200).json({ message: 'PO ID updated successfully', result });
      } catch (err) {
        console.error('Error updating PO ID:', err.stack);
        res.status(500).json({ error: 'Database error', details: err.stack });
      }

});

app.put('/api/updateStatus', async (req, res) => {
  console.log('Received Request Body:', req.body);

  const { orderId, poId, itemCode, status } = req.body;

  if (orderId == null || poId == null || !Array.isArray(itemCode) || status == null) {
    return res.status(400).json({ error: 'orderId, poId, itemCode (as an array), and status are required' });
  }

  if (itemCode.length === 0) {
    return res.status(400).json({ error: 'itemCode array cannot be empty' });
  }

  // Generate a list of placeholders for the itemCode array
  const placeholders = itemCode.map(() => '?').join(',');

  try {
    const updateStatusQuery = `UPDATE salesorder SET status = ? WHERE orderId = ? AND po_id = ? AND productId IN (${placeholders})`;
    const [result] = await mysqlConnection.query(updateStatusQuery, [status, orderId, poId, ...itemCode]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No matching records found to update' });
    }

    res.status(200).json({ message: 'Status updated successfully', affectedRows: result.affectedRows });
  } catch (err) {
    console.error('Error updating status:', err.stack);
    res.status(500).json({ error: 'Database error', details: err.stack });
  }
});



// Function to check for drop shipping and insert into SQL Server database
async function checkingForDropShipping(orderNumber) {
  const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=JDE-TEST\\JDETEST;Database=JDE_BLUERIDGE;Uid=eb;Pwd=sanita2023;';
  let sqlConnection;

  try {
    // Establish connection to SQL Server
    sqlConnection = await odbc.connect(connectionString);
    console.log('Connected to the SQL Server database.');

    // Execute the query with the provided orderNumber
    const result = await sqlConnection.query(getOrderDetailsQuery, [orderNumber]);
    console.log('Order Details from SQL Server:', result);

    // Insert matching data into MySQL database
    for (const row of result) {
      const params = [
        row.orderId, 
        row.productId, 
        row.description, 
        row.qty, 
        row.c_name, 
        row.email, 
        row.date, 
        row.unitOfMesure
      ];
      
      await mysqlConnection.query(insertMatchingDataQuery, params);
      console.log('Data inserted into MySQL:', params);
    }

    //jde po 
    await createPO(result);

  } catch (err) {
    console.error('Error in SQL Server operation:', err);
  } finally {
    // Ensure the SQL Server connection is closed
    if (sqlConnection) {
      await sqlConnection.close();
      console.log('SQL Server database connection closed.');
    }
  }
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
