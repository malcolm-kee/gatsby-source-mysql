const createMysqlNodes = require('./create-mysql-nodes');

describe('createMysqlNodes', () => {
  it('is a function', () => {
    expect(typeof createMysqlNodes).toBe('function');
  });

  it('will create correct nodes', () => {
    const createNode = jest.fn();
    const allSqlResults = [
      {
        name: 'city',
        idFieldName: 'ID',
        statement: 'SELECT * FROM city',
        __sqlResult: [
          { ID: 1, name: 'Kuala Lumpur' },
          { ID: 2, name: 'New York' },
          { ID: 3, name: 'London' }
        ]
      }
    ];

    createMysqlNodes(allSqlResults[0], allSqlResults, createNode);

    expect(createNode.mock.calls).toMatchSnapshot();
  });

  it('will create correct nodes for child entity in one-to-many relationship', () => {
    const createNode = jest.fn();
    const allSqlResults = [
      {
        name: 'city',
        idFieldName: 'ID',
        statement: 'SELECT * FROM city',
        __sqlResult: [
          { ID: 1, name: 'Kuala Lumpur', countryCode: 'MY' },
          { ID: 2, name: 'New York', countryCode: 'US' },
          { ID: 3, name: 'London', countryCode: 'UK' },
          { ID: 4, name: 'Chicago', countryCode: 'US' },
          { ID: 5, name: 'Penang', countryCode: 'MY' }
        ],
        parentName: 'country',
        foreignKey: 'countryCode',
        cardinality: 'OneToMany'
      },
      {
        name: 'country',
        idFieldName: 'Code',
        statement: 'SELECT * FROM country',
        __sqlResult: [
          { Code: 'MY', name: 'Malaysia' },
          { Code: 'US', name: 'United States' },
          { Code: 'UK', name: 'United Kingdom' }
        ]
      }
    ];

    createMysqlNodes(allSqlResults[0], allSqlResults, createNode);

    expect(createNode.mock.calls).toMatchSnapshot();
  });

  it('will create correct nodes for parent entity in one-to-many relationship', () => {
    const createNode = jest.fn();
    const allSqlResults = [
      {
        name: 'city',
        idFieldName: 'ID',
        statement: 'SELECT * FROM city',
        __sqlResult: [
          { ID: 1, name: 'Kuala Lumpur', countryCode: 'MY' },
          { ID: 2, name: 'New York', countryCode: 'US' },
          { ID: 3, name: 'London', countryCode: 'UK' },
          { ID: 4, name: 'Chicago', countryCode: 'US' },
          { ID: 5, name: 'Penang', countryCode: 'MY' }
        ],
        parentName: 'country',
        foreignKey: 'countryCode',
        cardinality: 'OneToMany'
      },
      {
        name: 'country',
        idFieldName: 'Code',
        statement: 'SELECT * FROM country',
        __sqlResult: [
          { Code: 'MY', name: 'Malaysia' },
          { Code: 'US', name: 'United States' },
          { Code: 'UK', name: 'United Kingdom' }
        ]
      }
    ];

    createMysqlNodes(allSqlResults[1], allSqlResults, createNode);

    expect(createNode.mock.calls).toMatchSnapshot();
  });

  it('creates correct node for child entity in one-to-one relationship', () => {
    const createNode = jest.fn();
    const allSqlResults = [
      {
        name: 'countrycapital',
        idFieldName: 'ID',
        statement: 'SELECT * FROM countrycapital',
        __sqlResult: [
          { ID: 1, name: 'Kuala Lumpur', countryCode: 'MY' },
          { ID: 2, name: 'Washington, D.C.', countryCode: 'US' },
          { ID: 3, name: 'London', countryCode: 'UK' }
        ],
        parentName: 'country',
        foreignKey: 'countryCode',
        cardinality: 'OneToOne'
      },
      {
        name: 'country',
        idFieldName: 'Code',
        statement: 'SELECT * FROM country',
        __sqlResult: [
          { Code: 'MY', name: 'Malaysia' },
          { Code: 'US', name: 'United States' },
          { Code: 'UK', name: 'United Kingdom' }
        ]
      }
    ];

    createMysqlNodes(allSqlResults[0], allSqlResults, createNode);

    expect(createNode.mock.calls).toMatchSnapshot();
  });

  it('creates correct node for parent entity in one-to-one relationship', () => {
    const createNode = jest.fn();
    const allSqlResults = [
      {
        name: 'countrycapital',
        idFieldName: 'ID',
        statement: 'SELECT * FROM countrycapital',
        __sqlResult: [
          { ID: 1, name: 'Kuala Lumpur', countryCode: 'MY' },
          { ID: 2, name: 'Washington, D.C.', countryCode: 'US' },
          { ID: 3, name: 'London', countryCode: 'UK' }
        ],
        parentName: 'country',
        foreignKey: 'countryCode',
        cardinality: 'OneToOne'
      },
      {
        name: 'country',
        idFieldName: 'Code',
        statement: 'SELECT * FROM country',
        __sqlResult: [
          { Code: 'MY', name: 'Malaysia' },
          { Code: 'US', name: 'United States' },
          { Code: 'UK', name: 'United Kingdom' }
        ]
      }
    ];

    createMysqlNodes(allSqlResults[1], allSqlResults, createNode);

    expect(createNode.mock.calls).toMatchSnapshot();
  });
});
