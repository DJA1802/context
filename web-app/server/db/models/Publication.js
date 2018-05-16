const Sequelize = require('sequelize');
const db = require('../db');

const Publication = db.define('publication', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  }
});

Publication.getDistinctForUser = function (userId) {
  return db
    .query(
      `SELECT COUNT(DISTINCT publications.id)::integer FROM publications INNER JOIN articles on publications.id = articles."publicationId" INNER JOIN users ON articles."userId" = users.id WHERE users.id = ${userId}`
    )
    .then(data => data[0][0].count);
};

Publication.groupByArticleCount = function (userId) {
  return db
    .query(
      `SELECT publications.name AS "publication", COUNT(articles.id)::integer AS "articles" FROM publications INNER JOIN articles on publications.id = articles."publicationId" INNER JOIN users ON articles."userId" = users.id WHERE users.id = ${userId} GROUP BY publications.name ORDER BY "articles" DESC`
    )
    .then(data => data[0]);
};

module.exports = Publication;
