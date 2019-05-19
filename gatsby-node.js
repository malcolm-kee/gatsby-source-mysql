const queryDb = require('./src/db');
const createMysqlNodes = require('./src/create-mysql-nodes');

exports.sourceNodes = async ({ actions }, configOptions) => {
  const { createNode } = actions;
  const { connectionDetails, queries } = configOptions;

  const { db, queryResults } = await queryDb(connectionDetails, queries);

  try {
    queries
      .map((query, index) =>
        Object.assign({}, query, { __sqlResult: queryResults[index] })
      )
      .forEach((sqlResult, _, sqlResults) =>
        createMysqlNodes(sqlResult, sqlResults, createNode)
      );

    db.end();
  } catch (e) {
    console.error(e);
    db.end();
  }
};
