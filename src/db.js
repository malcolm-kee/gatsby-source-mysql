const mysql = require('mysql');

function query(dbConnection, statement, reporter) {
  return new Promise((fulfill, reject) => {
    dbConnection.query(statement, (error, results) => {
      if (error) return reject(error);

      if (/^call/i.test(statement)) {
        reporter.info(`stored procedure statments: '${statement}'`);
        return fulfill(results[0]);
      }

      fulfill(results);
    });
  });
}

function queryDb(connectionDetails, queries, reporter) {
  const db = mysql.createConnection(connectionDetails);

  db.connect(err => {
    if (err) {
      reporter.panic(`Error establishing db connection`, err);
    }
  });

  return Promise.all(queries.map(({ statement }) => query(db, statement, reporter)))
    .then(queryResults => ({
      queryResults,
      db
    }))
    .catch(err => {
      db.end();
      reporter.error(`Error making queries`, err);
    });
}

module.exports = queryDb;
