const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
const PORT = 5000;

app.use(express.json());

// Initialize session middleware with options
app.use('/customer', session({
    secret: 'fingerprint_customer', 
    resave: true,
    saveUninitialized: true
}));

// Middleware for user authentication
app.use('/customer/auth/*', function auth(req, res, next) {
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        jwt.verify(token, 'access', (err, customer) => {
            if (!err) {
                req.customer = customer;
                next();
            } else {
                return res.status(403).json({ message: 'Customer isn\'t authenticated.' });
            }
        });
    } else {
        return res.status(403).json({ message: 'Customer isn\'t logged in.' });
    }
});
 
app.use('/customer', customer_routes);
app.use('/', genl_routes);

app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
