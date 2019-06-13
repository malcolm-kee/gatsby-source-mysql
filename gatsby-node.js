const queryDb = require('./src/db');
const createMysqlNodes = require('./src/create-mysql-nodes');

exports.sourceNodes = async ({ actions, store, createNodeId, cache }, configOptions) => {
  const { createNode } = actions;
  const { connectionDetails, queries } = configOptions;

  const { db, queryResults } = await queryDb(connectionDetails, queries);

  try {
    const sqlData = queries.map((query, index) =>
      Object.assign({}, query, { __sqlResult: queryResults[index] })
    );

    await Promise.all(
      sqlData.map((sqlResult, _, sqlResults) =>
        createMysqlNodes(sqlResult, sqlResults, {
          createNode,
          store,
          createNodeId,
          cache
        })
      )
    );

    db.end();
  } catch (e) {
    console.error(e);
    db.end();
  }
};
