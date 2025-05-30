require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var createError = require('http-errors');
const Logger = require('./utils/logger');
const cors = require('cors');

var app = express();

var indexRouter = require('./routes/index');
var articlesRouter = require('./routes/articles');
var productsRouter = require('./routes/products');
var commentsRouter = require('./routes/comments');
var documentsRouter = require('./routes/documents');

app.use(Logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
app.use('/articles', articlesRouter);
app.use('/products', productsRouter);
app.use('/articles/:articleId/comments', commentsRouter);
app.use('/products/:productId/comments', commentsRouter);
app.use('/documents', documentsRouter);


app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; 
  
  res.status(err.status || 500).send('ERROR: ' + err.message);
});

module.exports = app;