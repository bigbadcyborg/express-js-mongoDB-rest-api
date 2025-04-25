// Express.js
// Author: Russell Sullivan
// Description: Express.js REST API for tracking library books using MongoDB Atlas
// Date Last Modified: 4/23/2025

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// mongoDB Atlas connection-string
const mongoURI = "mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.l80qzx1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// attempt to connect to mongoDB Atla using connection-string
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });



// define Book schema + model
//   note: 
//		'required: true' tells Mongoose to throw validation err if save occurs w/ no id
//		'unique: true' on the schema path tells Mongoose that no duplicate ids are allowed
//		Schemas centralize all field rules
//		Model allows for static CRUD functions to be called
const BookSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true },
  title:     String,
  author:    String,
  publisher: String,
  isbn:      String,
  avail:     Boolean,
  who:       String,
  due:       String
});
const Book = mongoose.model('Book', BookSchema);


app.use(express.json());
//CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// helper to summarize
function summarize(docs) {
  return docs.map(d => ({ id: d.id, title: d.title }));
}


// ╔══════════════════════════════════════════════════════╗
// ║     		GET /books[?avail=true|false]		      ║
// ╚══════════════════════════════════════════════════════╝
//   note: async(req, res) ensures await is as well this function returning a promise.
app.get('/books', async (req, res) => {
  const { avail } = req.query;
  let filter = {};
  if (avail === 'true' || avail === 'false') filter.avail = avail === 'true';
  const docs = await Book.find(filter);
  return res.json(summarize(docs));
});


// ╔══════════════════════════════════════════════════════╗
// ║     			  GET /books/:id					  ║
// ╚══════════════════════════════════════════════════════╝
app.get('/books/:id', async (req, res) => {
  const doc = await Book.findOne({ id: req.params.id });
  if (!doc) return res.status(404).json({ error: 'Book not found' });
  return res.json(doc);
});


// ╔══════════════════════════════════════════════════════╗
// ║   POST /books/:id/:title/:author/:publisher/:isbn    ║
// ╚══════════════════════════════════════════════════════╝
app.post('/books/:id/:title/:author/:publisher/:isbn', async (req, res) => {
  const { id, title, author, publisher, isbn } = req.params;
  if (!id) return res.status(400).json({ error: 'Missing id in URL' });
  if (await Book.exists({ id })) {
    return res.status(403).json({ error: `Book with id ${id} already exists` });
  }
  const newBook = new Book({ id, title, author, publisher, isbn, avail: true, who: null, due: null });
  await newBook.save();
  return res.status(201).json({ message: `Book ${id} created`, book: newBook });
});


// ╔══════════════════════════════════════════════════════╗
// ║PUT /books/:id[?avail=…|?title=…|…] or with JSON body ║
// ╚══════════════════════════════════════════════════════╝
app.put('/books/:id', async (req, res) => {
  const doc = await Book.findOne({ id: req.params.id });
  if (!doc) return res.status(404).json({ error: 'Book not found' });

  const allowed = ['avail', 'title', 'author', 'publisher', 'isbn', 'who', 'due'];
  const queries = Object.keys(req.query);
  const invalid = queries.filter(k => !allowed.includes(k));
  if (invalid.length) {
    return res.status(400).json({ error: `Invalid field(s): ${invalid.join(', ')}` });
  }
  // apply query updates
  for (let key of queries) {
    let val = req.query[key];
    if (key === 'avail') val = val === 'true';
    doc[key] = val;
  }
  // if no query params, merge JSON body
  if (queries.length === 0) {
    Object.assign(doc, req.body);
  }
  await doc.save();
  return res.json({ message: `Book ${doc.id} updated`, book: doc });
});


// ╔══════════════════════════════════════════════════════╗
// ║     		     DELETE /books/:id		     	      ║
// ╚══════════════════════════════════════════════════════╝
app.delete('/books/:id', async (req, res) => {
  const result = await Book.deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) {
    return res.sendStatus(204);
  }
  return res.json({ message: `Book with id ${req.params.id} deleted` });
});



// start server listener
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
