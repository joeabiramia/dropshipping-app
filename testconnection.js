const odbc = require('odbc');

async function connectToDatabase() {
  const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=JDE-TEST\\JDETEST;Database=JDE_BLUERIDGE;Uid=eb;Pwd=sanita2023;';
  
  try {
    const connection = await odbc.connect(connectionString);
    console.log('Connected to the database.');

    // Run a simple test query
    const result = await connection.query('SELECT TOP 10 * FROM BRDTA.F55TD12D');
    console.log(result);

    await connection.close();
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

connectToDatabase();
