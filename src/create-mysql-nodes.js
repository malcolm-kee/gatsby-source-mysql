const createNodeHelpers = require('gatsby-node-helpers').default;
const pluralize = require('pluralize');
const { createBufferFileNode } = require('./create-image-file-node');

const { createNodeFactory, generateNodeId } = createNodeHelpers({
  typePrefix: 'mysql'
});

function omit(object, paths) {
  const result = {};

  Object.keys(object).forEach(key => {
    if (paths.indexOf(key) === -1) {
      result[key] = object[key];
    }
  });

  return result;
}

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

async function createMysqlNodes(
  { name, __sqlResult, idFieldName, parentName, foreignKey, imageFieldNames = [] },
  allSqlResults,
  { createNode, createNodeId, store, createParentChildLink }
) {
  const MySqlNode = createNodeFactory(name);
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
      sqlNodes.map(async node => {
        const nodeWithoutImageFields = omit(node, imageFieldNames);
        const sqlNode = MySqlNode(nodeWithoutImageFields);
        await createNode(sqlNode);

        return Promise.all(
          imageFieldNames.map(async field => {
            const image = node[field];

            const imageNode = await createBufferFileNode({
              createNodeId,
              store,
              fieldName: field,
              buffer: image,
              parentId: sqlNode.id
            });

            if (imageNode) {
              await createNode(imageNode);
              createParentChildLink({
                parent: sqlNode,
                child: imageNode
              });
            }
          })
        );
      })
    );
  }
}

module.exports = createMysqlNodes;
