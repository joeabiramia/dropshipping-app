const axios = require('axios');
const mysql = require('mysql2/promise');

// Create MySQL connection pool
const mysqlConnection = mysql.createPool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER,     
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Define your query here
const getOrderDetailsQuery = `
  SELECT orderId, productId, description, qty, c_name, email, date, unitOfMesure 
  FROM your_table_name 
  WHERE orderNumber = ?;
`;

async function createPO(orderNumber) {
  let connection;

  try {
    // Connect to MySQL
    connection = await mysqlConnection.getConnection();
    
    // Execute the query to fetch data
    const [rows] = await connection.query(getOrderDetailsQuery, [orderNumber]);
    console.log('Order Details from MySQL:', rows);

    // Prepare the body for the API request
    const apiBody = {
      Supplier_Code: "62",
      Buyer: "3689",
      Requested_Date: "14/08/2024",
      Scheduled_Pick_Date: "15/08/2024",
      Reference: "test123",
      Reference_2: "test123",
      GridIn_1_5: rows.map(row => ({
        Item_Number: row.productId,
        Quantity_Ordered: row.qty,
        Tr_UoM: row.unitOfMesure
      })),
      P564310_Version: "",
      Business_Unit: "MSWRHECOMJ",
      Currency: "USD",
      Effective_Date: "08/08/2024"
    };

    // Make the API request
    const response = await axios.post('http://10.192.164.1:7002/jderest/v3/orchestrator/Orch_po', apiBody, {
      auth: {
        username: 'JDE',
        password: 'ftp2019'
      }
    });

    console.log('API Response:', response.data);
    return response.data;

  } catch (err) {
    console.error('Error in API request or database operation:', err);
    throw err;  // Re-throw the error for handling in the calling function
  } finally {
    // Ensure the MySQL connection is closed
    if (connection) {
      await connection.release();
      console.log('MySQL connection released.');
    }
  }
}

module.exports = { createPO };
