// SQL query string to get order details
const getOrderDetailsQuery = `
  SELECT BRDTA.F55TD12D.TDODOC AS orderId, 
         BRDTA.F4101.IMLITM AS productId, 
         BRDTA.F4101.IMDSC1 AS description, 
         BRDTA.F4101.IMSRP4, 
         BRDTA.F55TD12D.TDUORG /10000 AS qty, 
         BRDTA.F0101.ABALKY, 
         BRDTA.F0101.ABDC AS c_name, 
         BRDTA.F01151.EAEMAL AS email, 
         BRDTA.F55TD12H.TDUPMJ AS date, 
         BRDTA.F55TD12D.TDUOM AS unitOfMesure
  FROM BRDTA.F4101 
  INNER JOIN BRDTA.F55TD12D ON BRDTA.F4101.IMLITM = BRDTA.F55TD12D.TDLITM
  INNER JOIN BRDTA.F55TD12H ON BRDTA.F55TD12D.TDODCT = BRDTA.F55TD12H.TDODCT 
      AND BRDTA.F55TD12D.TDODOC = BRDTA.F55TD12H.TDODOC
  INNER JOIN BRDTA.F0101 ON BRDTA.F55TD12H.TDALKY = BRDTA.F0101.ABALKY
  INNER JOIN BRDTA.F01151 ON BRDTA.F0101.ABAN8 = BRDTA.F01151.EAAN8
  WHERE BRDTA.F55TD12D.TDODOC = ? 
    AND BRDTA.F4101.IMSRP4 = 'DRP';
`;

// SQL query string for inserting data into ordernumberreceived
const insertOrderQuery = `
  INSERT INTO ordernumberreceived (orderNumber, date) 
  VALUES (?, ?);
`;

// SQL query string for inserting data into another table
const insertMatchingDataQuery = `
  INSERT INTO salesOrder 
    (orderId, productId, description, qty, c_name, email, date, unitOfMesure) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`;

// Export the queries
module.exports = {
  getOrderDetailsQuery,
  insertOrderQuery,
  insertMatchingDataQuery
};
