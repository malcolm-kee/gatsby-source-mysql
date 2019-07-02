const queryDb = require('./src/db');
const createMysqlNodes = require('./src/create-mysql-nodes');

exports.sourceNodes = async (
  { actions, store, createNodeId, cache, reporter },
  configOptions
) => {
  const { createNode } = actions;
  const { connectionDetails, queries } = configOptions;

  const { db, queryResults } = await queryDb(connectionDetails, queries, reporter);

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
          cache,
          reporter
        })
      )
    );

    db.end();
  } catch (e) {
    reporter.error(`Error while sourcing data with gatsby-source-mysql`, e);
    db.end();
  }
};
