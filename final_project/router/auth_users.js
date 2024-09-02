const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

// Check if a user with the given username already exists
const isValid = (username) => {
	let user_duplicate_name = users.filter((user) => {
		return user.username === username;
	});

	if (user_duplicate_name.length > 0) {
		return true;
	} else {
		return false;
	}
}

const authenticatedUser = (username, password) => { //returns boolean
	let validusers = users.filter((user) => {
		return user.username === username && user.password === password;
	});

	// Return true if any valid user is found
	if (validusers.length > 0) {
		return true;
	} else {
		return false;
	}
}

// Login endpoint at /customer/login
regd_users.post('/login', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	// Check if username or password are missing
	if (!username || !password) {
		return res.status(404).json({ message: 'Error logging in: No username or password.' });
	}

	// Auth user
	if (authenticatedUser(username, password)) {
		// Generate JWT access token
		let accessToken = jwt.sign({
			data: password
		}, 'access', { expiresIn: 60 * 60 });

		// Store access token and username in session
		req.session.authorization = {
			accessToken, username
		}

		return res.status(200).send('User successfully logged in.');

	} else {
		return res.status(208).json({ message: 'Invalid login. Check username and password.' });
	}
});

// Add or update a review as auth users
// Route due to middleware _should_ be /customer/auth/review/:isbn
// In Postman, set up the Params to be 
// Key: review
// Value: The actual review to be added
regd_users.put('/auth/review/:isbn', (req, res) => {
	const isbn = req.params.isbn;
	let filtered_book = books[isbn];	

	if (filtered_book) {
		let user_review = req.query.review;
		let reviewer = req.session.authorization['username'];
	
		if (user_review) { // Is there an exisiting review?
			filtered_book['reviews'][reviewer] = user_review;
			books[isbn] = filtered_book;
		}
		res.send(`The review for book ISBN ${isbn} has been added or updated.`);

	} else {
		res.send(`Unable to find a book with ISBN ${isbn}.`);
	}	
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
