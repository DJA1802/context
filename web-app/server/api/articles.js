const router = require('express').Router();
const request = require('request-promise-native');
const { Article, Author, Publication } = require('../db/models');
const { setPublicationName, buildMercuryJSONRequest } = require('../utils');

// GET /api/articles
router.get('/', (req, res, next) => {
  const userId = req.user ? req.user.id : null;
  if (userId) {
    Article.findAll({
      attributes: [
        'id',
        'title',
        'sourceUrl',
        'status',
        'wordCount',
        'status',
        'createdAt'
      ],
      where: { userId },
      include: [{ model: Author }, { model: Publication }]
    })
      .then(articles => res.json(articles))
      .catch(next);
  }
});

// POST /api/articles
router.post('/', (req, res, next) => {
  const { articleUrl } = req.body;
  const userId = req.user.id;

  request({ url: articleUrl }, (htmlErr, htmlRes, htmlStr) => {
    if (htmlErr) console.log(htmlErr);
    const publicationName = setPublicationName(htmlStr, articleUrl);
    return Publication.findOrCreate({
      where: {
        name: publicationName
      }
    }).then(([publication]) => {
      request(
        buildMercuryJSONRequest(articleUrl),
        (apiErr, apiRes, apiBody) => {
          const data = JSON.parse(apiBody);
          if (data.message === 'Internal server error') {
            throw new Error('Article unable to be parsed');
          }

          Article.create({
            title: data.title,
            sourceUrl: data.url,
            content: data.content,
            wordCount: data.wordCount,
            publicationDate: data.publicationDate,
            userId,
            publicationId: publication.id
          })
            .then(newArticle =>
              Article.findOne({
                where: { id: newArticle.id },
                attributes: [
                  'id',
                  'title',
                  'sourceUrl',
                  'status',
                  'wordCount',
                  'status',
                  'createdAt'
                ],
                include: [{ model: Author }, { model: Publication }]
              })
            )
            .then(newArticle => res.status(201).json(newArticle))
            .catch(next);
        }
      ).catch(next);
    });
  });
});

// GET /api/articles/:id
router.get('/:id', (req, res, next) => {
  Article.findById(req.params.id, {
    include: [{ model: Author }, { model: Publication }]
  })
    .then(article => res.json(article))
    .catch(next);
});

router.put('/:id', (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  Article.update(
    { status },
    {
      where: { id },
      returning: true,
      plain: true
    }
  )
    .then(article => res.json(article))
    .catch(next);
});

router.delete('/:id', (req, res, next) => {
  Article.findById(req.params.id)
    .then(article => article.destroy())
    .then(() => res.sendStatus(204))
    .catch(next);
});

module.exports = router;
