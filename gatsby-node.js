const queryDb = require('./src/db');
const createMysqlNodes = require('./src/create-mysql-nodes');

exports.sourceNodes = async ({ actions, createNodeId, store }, configOptions) => {
  const { createNode, createParentChildLink } = actions;
  const { connectionDetails, queries } = configOptions;

  const { db, queryResults } = await queryDb(connectionDetails, queries);

  try {
    await Promise.all(
      queries
        .map((query, index) =>
          Object.assign({}, query, { __sqlResult: queryResults[index] })
        )
        .map((sqlResult, _, sqlResults) =>
          createMysqlNodes(sqlResult, sqlResults, {
            createNode,
            createNodeId,
            store,
            createParentChildLink
          })
        )
    );

    db.end();
  } catch (e) {
    console.error(e);
    db.end();
  }
};
