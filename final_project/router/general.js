const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post('/register', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (username && password) {
		if (!isValid(username)) {
			users.push({ "username": username, "password": password });
			return res.status(200).json({ message: 'User successfully registered.' });
		} else {
			return res.status(404).json({ message: 'A user with that username already exists.' });
		}
	}
	// Error is username or password is missing
	return res.status(404).json({ message: 'Unable to register user.' });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
	res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
	const isbn = req.params.isbn;
	let book = books[isbn];

	if (book) {
		res.send(book);
	} else {
		res.send(`Can't find a book with the ISBN "${isbn}".`);
	}	
 });
	
// Get book details based on author
public_users.get('/author/:author', (req, res) => {
	const author = req.params.author;
	let books_by_author = [];
	let isbns = Object.keys(books);

	isbns.forEach((isbn) => {
		if(books[isbn]["author"] === author) {
			books_by_author.push({
				"isbn": isbn,
                "title": books[isbn]["title"],
                "reviews": books[isbn]["reviews"]
			});
		}
	});
	res.send(JSON.stringify({books_by_author}, null, 4));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
	const title = req.params.title;
	let books_by_title = [];
	let isbns = Object.keys(books);

	isbns.forEach((isbn) => {
		if(books[isbn]["title"] === title) {
			books_by_title.push({
                isbn: isbn,
                author: books[isbn]["author"],
                reviews: books[isbn]["reviews"],
            });
		}	
	});
	res.send(JSON.stringify({books_by_title}, null, 4));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
	const isbn = req.params.isbn;
    let book = books[isbn];

    if (book) {
        res.send(book);
    } else {
        res.send(`Can't find reviews for a book with the ISBN "${isbn}".`);
    }	
});

module.exports.general = public_users;
