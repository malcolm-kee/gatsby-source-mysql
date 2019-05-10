const createNodeHelpers = require('gatsby-node-helpers').default;
const pluralize = require('pluralize');

const { createNodeFactory, generateNodeId } = createNodeHelpers({
  typePrefix: 'mysql'
});

function createMysqlNodes(
  { name, __sqlResult, idFieldName, parentName, foreignKey },
  allSqlResults,
  createNode
) {
  const MySqlNode = createNodeFactory(name);
  const childEntities = allSqlResults.filter(
    ({ parentName }) => !!parentName && parentName === name
  );

  if (Array.isArray(__sqlResult)) {
    __sqlResult.forEach(result => {
      const parentField =
        parentName && foreignKey
          ? {
              [`${parentName}___NODE`]: generateNodeId(parentName, result[foreignKey])
            }
          : {};

      const childFields = childEntities.reduce(
        (
          fields,
          { name: childName, idFieldName: childIdFieldName, foreignKey, __sqlResult }
        ) =>
          Object.assign({}, fields, {
            [`${pluralize.plural(childName)}___NODE`]: __sqlResult
              .filter(child => child[foreignKey] === result[idFieldName])
              .map(child => generateNodeId(childName, child[childIdFieldName]))
          }),
        {}
      );

      const sanitizedResult = Object.assign(
        {},
        result,
        {
          id: result[idFieldName]
        },
        parentField,
        childFields
      );
      const resultNode = MySqlNode(sanitizedResult);
      createNode(resultNode);
    });
  }
}

module.exports = createMysqlNodes;
