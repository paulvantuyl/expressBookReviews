const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();
const PORT = 5000;

let baseURL = `http://127.0.0.1:${PORT}/`;


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
// Non-promise router
// public_users.get('/', (req, res) => {
// 	res.send(JSON.stringify(books, null, 4));
// });

// Promise-based router
public_users.get('/', (req, res) => {
	(new Promise((resolve, reject) => {
		try {
			const data = res.send(JSON.stringify(books, null, 4));
			resolve(data);
			console.log('Promise for task 10 resolved.');
		} catch(error) {
			reject(error);
		}
	}));
});

// Get book details based on ISBN
// Non-promise router
// public_users.get('/isbn/:isbn', (req, res) => {
// 	const isbn = req.params.isbn;
// 	let filtered_book = books[isbn];

// 	if (filtered_book) {
// 		res.send(filtered_book);
// 	} else {
// 		res.send(`Can't find a book with the ISBN "${isbn}".`);
// 	}
//  });

// Promise-based ISBN router
// has the code for getting the book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', (req, res) => {
	(new Promise((resolve, reject) => {
		const isbn = req.params.isbn;
		let filtered_book = books[isbn];

		try {
			if (filtered_book) {
				const data = res.send(filtered_book);
				resolve (data);
			} else if (!filtered_book) {
				const unfound = res.status(400).send(`Can't find a book with the ISBN "${isbn}".`);
				resolve (unfound);
			}
			console.log('Promise for task 11 resolved.');
		} catch (error) {
			reject(error);
		}		
	}));
});
	
// Get book details based on author
// Non-promise router
// public_users.get('/author/:author', (req, res) => {
// 	const author = req.params.author;
// 	let books_by_author = [];
// 	let isbns = Object.keys(books);

// 	isbns.forEach((isbn) => {
// 		if(books[isbn]["author"] === author) {
// 			books_by_author.push({
// 				"isbn": isbn,
//                 "title": books[isbn]["title"],
//                 "reviews": books[isbn]["reviews"]
// 			});
// 		}
// 	});
// 	res.send(JSON.stringify({books_by_author}, null, 4));
// });

// Promise-based author router
public_users.get('/author/:author', (req, res) => {
	(new Promise((resolve, reject) => {
		const author = req.params.author;
		let books_by_author = [];
		let isbns = Object.keys(books);

		try {
			isbns.forEach((isbn) => {
				// var for the author in db/json
				let author_match = books[isbn]["author"];
				
				// match db to req param
				if (author_match === author) {
					books_by_author.push({
						"isbn": isbn,
						"title": books[isbn]["title"],
						"reviews": books[isbn]["reviews"]
					});
					// If the new array has results, send response
					if (books_by_author.length >= 1) {
						const data = res.send(JSON.stringify({books_by_author}, null, 4));
						resolve (data);
					}
				} 
			});

			// If the new array has no results, send 404
			if (books_by_author.length < 1) {
                const unfound = res
                    .status(404)
                    .send(`Can't find any books by "${author}".`);
                resolve(unfound);
            }
		} catch (error) {
			reject (error);
		}
	}));
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
    let filtered_book = books[isbn];
	var count = Object.keys(filtered_book['reviews']).length;

    if (count >= 1) {
        res.send(filtered_book['reviews']);
    } else {
        res.send(`Can't find any reviews for a book with the ISBN "${isbn}".`);
    }	
});

module.exports.general = public_users;
module.exports.port = PORT;
