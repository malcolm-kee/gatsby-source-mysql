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
        queries: [
          {
            statement: 'SELECT * FROM country',
            idFieldName: 'Code',
            name: 'country'
          }
        ]
      }
    }
    // ... other plugins
  ]
};
```

And then you can query via GraphQL with the type `allMysql<Name>` where `<Name>` is the `name` for your query.

Below is a sample query, however, it is probably different from yours as it would dependent on your configuration and your SQL query results.

Use [GraphiQL](https://www.gatsbyjs.org/docs/introducing-graphiql/) to explore the available fields.

```graphql
query {
  allMysqlCountry {
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

### Multiple Queries

When you have multiple queries, add another item in the `queries` option with different `name`.

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
        queries: [
          {
            statement: 'SELECT * FROM country',
            idFieldName: 'Code',
            name: 'country'
          },
          {
            statement: 'SELECT * FROM city',
            idFieldName: 'ID',
            name: 'city'
          }
        ]
      }
    }
    // ... other plugins
  ]
};
```

### Joining Queries

It's possible to join the results of the queries by providing `parentName`, `foreignKey`, and `cardinality` to the query object.

> Currently only one-to-one and one-to-many relationship are supported. If you have a use case for many-to-many relationship, [raise an issue][raise-issue], and I'll look into it.

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
        queries: [
          {
            statement: 'SELECT * FROM country',
            idFieldName: 'Code',
            name: 'country'
          },
          {
            statement: 'SELECT * FROM city',
            idFieldName: 'ID',
            name: 'city',
            parentName: 'country',
            foreignKey: 'CountryCode',
            cardinality: 'OneToMany'
          }
        ]
      }
    }
    // ... other plugins
  ]
};
```

In the example above, `country` and `city` is one-to-many relationship (one country to multiple cities), and they are joined with `country.Code = city.CountryCode`.

With the configuration above, you can query a country joined with all the related cities with

```graphql
query {
  allMysqlCountry {
    edges {
      node {
        Code
        Name
        Population
        cities {
          Name
        }
      }
    }
  }
}
```

It also works the other way, i.e. you can query the country when getting the city

```graphql
query {
  allMysqlCity {
    edges {
      node {
        Name
        country {
          Name
        }
      }
    }
  }
}
```

### Process Image in Remote URL

It's possible to process image whose url is saved in your table by provide `remoteImageFieldNames` to the query object.

> Note that only `png`, `jpg`, `jpeg`, `bmp`, and `tiff` images are supported due to the limitation of [`sharp`][sharp].

Assume you have a `staff` table with its `picture` column storing remote url of image.

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
          database: 'sakila'
        },
        queries: [
          {
            statement: 'SELECT * FROM staff',
            idFieldName: 'staff_id',
            name: 'staff',
            remoteImageFieldNames: ['picture']
          }
        ]
      }
    }
    // ... other plugins
  ]
};
```

With the configuration above, you can use `gatsby-image` like below:

```jsx
import { useStaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';
import React from 'react';

const StaffImages = () => {
  const data = useStaticQuery(graphql`
    {
      allMysqlStaff {
        edges {
          node {
            childFile {
              childImageSharp {
                fixed(width: 100, height: 100) {
                  ...GatsbyImageSharpFixed
                }
              }
            }
          }
        }
      }
    }
  `);

  const imageData = data.allMysqlStaff.edges
    .filter(edge => edge.node.childFile !== null)
    .map(edge => edge.node.childFile.childImageSharp.fixed);

  return (
    <>
      {imageData.map((imageData, index) => (
        <Img fixed={imageData} key={index} />
      ))}
    </>
  );
};
```

For more options other than `GatsbyImageSharpFixed`, refer to documentation of [`gatsby-image`][gatsby-image].

### Process Image Saved as Blob

It's possible to process image saved as Blob in your database by provide `imageFieldNames` to the query object.

> Note that only `png`, `jpg`, `jpeg`, `bmp`, and `tiff` images are supported due to the limitation of [`sharp`][sharp].

Assume you have a `staff` table with its `picture` column storing png image as Blob.

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
          database: 'sakila'
        },
        queries: [
          {
            statement: 'SELECT * FROM staff',
            idFieldName: 'staff_id',
            name: 'staff',
            imageFieldNames: ['picture']
          }
        ]
      }
    }
    // ... other plugins
  ]
};
```

With the configuration above, you can use `gatsby-image` like below:

```jsx
import { useStaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';
import React from 'react';

const StaffImages = () => {
  const data = useStaticQuery(graphql`
    {
      allMysqlStaff {
        edges {
          node {
            childMysqlImage {
              childImageSharp {
                fixed(width: 100, height: 100) {
                  ...GatsbyImageSharpFixed
                }
              }
            }
          }
        }
      }
    }
  `);

  const imageData = data.allMysqlStaff.edges
    .filter(edge => edge.node.childMysqlImage !== null)
    .map(edge => edge.node.childMysqlImage.childImageSharp.fixed);

  return (
    <>
      {imageData.map((imageData, index) => (
        <Img fixed={imageData} key={index} />
      ))}
    </>
  );
};
```

For more options other than `GatsbyImageSharpFixed`, refer to documentation of [`gatsby-image`][gatsby-image].

## Plugin options

- **connectionDetails** (required): options when establishing the connection. Refer to [`mysql` connection options](https://www.npmjs.com/package/mysql#connection-options)
- **queries** (required): an array of object for your query. Each object could have the following fields:

| Field             | Required? | Description                                                                                                                                                                                |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `statement`       | Required  | the SQL query statement to be executed. Stored procedures are supported, e.g. `'CALL myProcedureThatReturnsResult(1, 1)'`                                                                  |
| `idFieldName`     | Required  | column that is unique for each record. This column must be returned by the `statement`.                                                                                                    |
| `name`            | Required  | name for the query. Will impact the value for the graphql type                                                                                                                             |
| `parentName`      | Optional  | name for the parent entity. In a one-to-many relationship, this field should be specified on the child entity (entity with many records).                                                  |
| `foreignKey`      | Optional  | foreign key to join the parent entity.                                                                                                                                                     |
| `cardinality`     | Optional  | the relationship between the parent and this entity. Possible values: `"OneToMany"`, `"OneToOne"`. Default to `"OneToMany"`. (Note: many-to-many relationship is currently not supported.) |
| `imageFieldNames` | Optional  | columns that store image Blob.                                                                                                                                                             |

[raise-issue]: https://github.com/malcolm-kee/gatsby-source-mysql/issues/new
[gatsby-image]: https://www.gatsbyjs.org/packages/gatsby-image/#gatsby-transformer-sharp
[sharp]: https://github.com/lovell/sharp
