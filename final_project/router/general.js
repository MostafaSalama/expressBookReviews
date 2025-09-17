const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  // Check if user already exists
  if (isValid(username)) {
    return res.status(409).json({message: "User already exists!"});
  }
  
  // Register new user
  users.push({"username": username, "password": password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const booksByAuthor = {};
  
  // Search through all books for matching author
  for (let isbn in books) {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      booksByAuthor[isbn] = books[isbn];
    }
  }
  
  if (Object.keys(booksByAuthor).length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({message: "No books found by this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const booksByTitle = {};
  
  // Search through all books for matching title
  for (let isbn in books) {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      booksByTitle[isbn] = books[isbn];
    }
  }
  
  if (Object.keys(booksByTitle).length > 0) {
    return res.status(200).json(booksByTitle);
  } else {
    return res.status(404).json({message: "No books found with this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

// Task 10: Get all books using async callback function
function getAllBooks(callback) {
  setTimeout(() => {
    callback(null, books);
  }, 1000); // Simulate async operation
}

public_users.get('/async/books', function (req, res) {
  getAllBooks((err, books) => {
    if (err) {
      return res.status(500).json({message: "Error fetching books"});
    }
    return res.status(200).json(books);
  });
});

// Task 11: Search by ISBN using Promises
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error("Book not found"));
      }
    }, 1000); // Simulate async operation
  });
}

public_users.get('/async/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  getBookByISBN(isbn)
    .then(book => {
      return res.status(200).json(book);
    })
    .catch(err => {
      return res.status(404).json({message: err.message});
    });
});

// Task 12: Search by Author using async/await
async function getBooksByAuthor(author) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const booksByAuthor = {};
      for (let isbn in books) {
        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
          booksByAuthor[isbn] = books[isbn];
        }
      }
      resolve(booksByAuthor);
    }, 1000); // Simulate async operation
  });
}

public_users.get('/async/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const booksByAuthor = await getBooksByAuthor(author);
    
    if (Object.keys(booksByAuthor).length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      return res.status(404).json({message: "No books found by this author"});
    }
  } catch (error) {
    return res.status(500).json({message: "Error fetching books by author"});
  }
});

// Task 13: Search by Title using async/await
async function getBooksByTitle(title) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const booksByTitle = {};
      for (let isbn in books) {
        if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
          booksByTitle[isbn] = books[isbn];
        }
      }
      resolve(booksByTitle);
    }, 1000); // Simulate async operation
  });
}

public_users.get('/async/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const booksByTitle = await getBooksByTitle(title);
    
    if (Object.keys(booksByTitle).length > 0) {
      return res.status(200).json(booksByTitle);
    } else {
      return res.status(404).json({message: "No books found with this title"});
    }
  } catch (error) {
    return res.status(500).json({message: "Error fetching books by title"});
  }
});

module.exports.general = public_users;
