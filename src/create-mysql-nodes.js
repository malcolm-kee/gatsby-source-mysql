const createNodeHelpers = require('gatsby-node-helpers').default;
const { createRemoteFileNode } = require('gatsby-source-filesystem');
const pluralize = require('pluralize');

const { createNodeFactory, generateNodeId } = createNodeHelpers({
  typePrefix: 'mysql'
});

function reduceChildFields(childEntities, nodeId) {
  let childFields = {};

  childEntities.forEach(
    ({
      name: childName,
      idFieldName: childIdFieldName,
      foreignKey,
      cardinality = 'OneToMany',
      __sqlResult
    }) => {
      const childIds = __sqlResult
        .filter(child => child[foreignKey] === nodeId)
        .map(child => generateNodeId(childName, child[childIdFieldName]));

      if (cardinality === 'OneToMany') {
        childFields[`${pluralize.plural(childName)}___NODE`] = childIds;
      } else {
        childFields[`${pluralize.singular(childName)}___NODE`] = childIds[0];
      }
    }
  );

  return childFields;
}

function mapSqlResults(
  __sqlResult,
  { parentName, foreignKey, childEntities, idFieldName }
) {
  return __sqlResult.map(result => {
    const nodeId = result[idFieldName];
    const parentField =
      parentName && foreignKey
        ? {
            [`${parentName}___NODE`]: generateNodeId(parentName, result[foreignKey])
          }
        : {};

    const childFields = reduceChildFields(childEntities, nodeId);

    return Object.assign(
      {},
      result,
      {
        id: nodeId
      },
      parentField,
      childFields
    );
  });
}

async function createMysqlNode(
  node,
  { name, remoteImageFieldNames },
  { createNode, store, createNodeId, cache, reporter }
) {
  const MySqlNode = createNodeFactory(name);
  const sqlNode = MySqlNode(node);

  const remoteNodes = await Promise.all(
    remoteImageFieldNames
      .filter(field => !!node[field])
      .map(async field => {
        try {
          return await createRemoteFileNode({
            url: node[field],
            parentNodeId: sqlNode.id,
            store,
            createNode,
            createNodeId,
            cache
          });
        } catch (e) {
          reporter.error(`Error when getting image ${node[field]}`, e);
        }
      })
  );

  // filter out nodes which fail
  const imageNodes = remoteNodes.filter(Boolean);

  if (remoteImageFieldNames.length === 1) {
    if (imageNodes.length > 0) {
      sqlNode.mysqlImage___NODE = imageNodes[0].id;
    }
  }

  sqlNode.mysqlImages___NODE = imageNodes.map(imageNode => imageNode.id);

  await createNode(sqlNode);
}

async function createMysqlNodes(
  { name, __sqlResult, idFieldName, parentName, foreignKey, remoteImageFieldNames = [] },
  allSqlResults,
  { createNode, store, createNodeId, cache, reporter }
) {
  const childEntities = allSqlResults.filter(
    ({ parentName }) => !!parentName && parentName === name
  );

  if (Array.isArray(__sqlResult)) {
    const sqlNodes = mapSqlResults(
      __sqlResult,
      { foreignKey, parentName, childEntities, idFieldName },
      childEntities
    );

    await Promise.all(
      sqlNodes.map(node =>
        createMysqlNode(
          node,
          { name, remoteImageFieldNames },
          { createNode, store, createNodeId, cache, reporter }
        )
      )
    );
  }
}

module.exports = createMysqlNodes;
