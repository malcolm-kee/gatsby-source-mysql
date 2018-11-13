const createNodeHelpers = require('gatsby-node-helpers').default;
const mysql = require('mysql');

exports.sourceNodes = ({ actions }, configOptions) => {
  const { createNode } = actions;
  const {
    connectionDetails,
    query,
    idFieldName = 'id',
    typePrefix = 'MySql'
  } = configOptions;
  const { createNodeFactory } = createNodeHelpers({
    typePrefix
  });

  const MySqlNode = createNodeFactory('Results');

  const dbConnection = mysql.createConnection(connectionDetails);

  return new Promise((fulfill, reject) => {
    dbConnection.query(query, (error, results, fields) => {
      if (error) return reject(error);

      if (Array.isArray(results)) {
        results.forEach((result, index) => {
          const sanitizedResult = Object.assign({}, result, {
            id: result[idFieldName]
          });
          const resultNode = MySqlNode(sanitizedResult);
          createNode(resultNode);
        });
      }

      fulfill();
    });

    dbConnection.end();
  });
};
