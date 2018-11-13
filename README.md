# gatsby-source-mysql

[![version](https://img.shields.io/npm/v/gatsby-source-mysql.svg)](https://www.npmjs.com/package/gatsby-source-mysql) ![license](https://img.shields.io/npm/l/gatsby-source-mysql.svg)

Source plugin for pulling data into Gatsby from MySQL database.

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-mysql`,
      options: {
        connectionDetails: {
          host: 'localhost',
          user: 'db-username',
          password: 'db-password',
          database: 'world'
        },
        query: 'SELECT * FROM city',
        idFieldName: 'ID'
      }
    }
    // ... other plugins
  ]
};
```

### multiple queries

When you have multiple queries, include the plugins multiple times with different `typePrefix`.

```javascript
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-mysql',
      options: {
        connectionDetails: {
          host: 'localhost',
          user: 'malcolm',
          password: 'password',
          database: 'world'
        },
        query: 'SELECT * FROM city',
        idFieldName: 'ID',
        typePrefix: 'City'
      }
    },
    {
      resolve: 'gatsby-source-mysql',
      options: {
        connectionDetails: {
          host: 'localhost',
          user: 'malcolm',
          password: 'password',
          database: 'world'
        },
        query: 'SELECT * FROM country',
        idFieldName: 'Code',
        typePrefix: 'Country'
      }
    }
    // ... other plugins
  ]
};
```

## Plugin options

As this plugin is a wrapper of the popular [`mysql`](https://www.npmjs.com/package/mysql) library, the options are based on the library.

- **connectionDetails** (required): options when establishing the connection. Refer to [`mysql` connection options](https://www.npmjs.com/package/mysql#connection-options)
- **query** (required): the SQL query statement to be executed.
- **idFieldName** (required): column that is unique for each record. This column must be included in the `query`.
- **typePrefix** (optional): the prefix of the data source in the GraphQL schema. Default to `MySql`.

## How to query your data using GraphQL

The GraphQL type would be follow the format of `all<typePrefix>Results`.

Below is a sample query, however, it is probably different from yours as it would dependent on your configuration and your SQL query results.

Use [GraphiQL](https://www.gatsbyjs.org/docs/introducing-graphiql/) to explore the available fields.

```graphql
query {
  allCountryResults {
    edges {
      node {
        Code
        Name
        Population
      }
    }
  }
}
```
