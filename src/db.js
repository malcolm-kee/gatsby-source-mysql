const mysql = require('mysql');

function query(dbConnection, statement) {
  return new Promise((fulfill, reject) => {
    dbConnection.query(statement, (error, results) => {
      if (error) return reject(error);

      if (/^call/i.test(statement)) {
        console.info(`stored procedure statments: '${statement}'`);
        return fulfill(results[0]);
      }

      fulfill(results);
    });
  });
}

function queryDb(connectionDetails, queries) {
  const db = mysql.createConnection(connectionDetails);

  return Promise.all(queries.map(({ statement }) => query(db, statement)))
    .then(queryResults => ({
      queryResults,
      db
    }))
    .catch(err => {
      console.error(err);
      db.end();
      throw err;
    });
}

module.exports = queryDb;
