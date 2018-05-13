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
router.post('/', async (req, res, next) => {
  const { articleUrl } = req.body;
  const userId = req.user.id;
  const htmlStr = await request({ url: articleUrl }).catch(err => {
    next(err);
  });
  const publicationName = setPublicationName(htmlStr, articleUrl);
  const [publication] = await Publication.findOrCreate({
    where: {
      name: publicationName
    }
  }).catch(err => {
    next(err);
  });

  const mercuryResponse = await request(
    buildMercuryJSONRequest(articleUrl)
  ).catch(err => {
    next(err);
  });
  const mercuryArticle = JSON.parse(mercuryResponse);
  const image = reactHtmlParser(mercuryArticle.content);
  console.log(image);

  const newArticle = await Article.create({
    title: mercuryArticle.title,
    sourceUrl: mercuryArticle.url,
    content: mercuryArticle.content,
    wordCount: mercuryArticle.wordCount,
    publicationDate: mercuryArticle.publicationDate,
    userId,
    publicationId: publication.id
  }).catch(err => {
    next(err);
  });

  const associatedArticle = await Article.findOne({
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
    include: [Author, Publication]
  }).catch(err => {
    next(err);
  });

  res.status(201).json(associatedArticle);
});

// GET /api/articles/:id
router.get('/:id', (req, res, next) => {
  Article.findById(req.params.id, {
    include: [Author, Publication]
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
