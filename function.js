// const odbc = require('odbc');
// const { getOrderDetailsQuery, insertMatchingDataQuery } = require('./queries');

// async function checkingForDropShipping(VALUES) {
//   const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=JDE-TEST\\JDETEST;Database=JDE_BLUERIDGE;Uid=eb;Pwd=sanita2023;';
//   const mysqlConfig = {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT
//   };

//   let connection;

//   try {
//     // Establish connection to the database
//     connection = await odbc.connect(connectionString);
//     console.log('Connected to the database.');

//     // Execute the query with the provided orderNumber
//     const result = await connection.query(getOrderDetailsQuery, [orderNumber]);
//     console.log('Order Details:', result);

//     // Execute insert query if needed (provide parameters if required)
//     const insertResult = await connection.query(insertMatchingDataQuery);
//     console.log('Insert Result:', insertResult);

//   } catch (err) {
//     console.error('Database error:', err);
//   } finally {
//     // Ensure the connection is closed
//     if (connection) {
//       await connection.close();
//       console.log('Database connection closed.');
//     }
//   }
// }

// module.exports = checkingForDropShipping;
// poService.js
