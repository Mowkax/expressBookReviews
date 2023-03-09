const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

// Import async functions for fetching the books
const { getBooksAsync, getBooksByIsbnAsync, getBooksByAuthorAsync, getBooksByTitleAsync } = require('./router/general.js').asyncFunctions;

const mySecretKey = "fingerprint_customer";

const app = express();

app.use(express.json());

app.use("/customer", session( {secret: mySecretKey, resave: true, saveUninitialized: true}) )

app.use("/customer/auth/*", function auth(req,res,next){
    
    const NO_AUTH_ERR = "User is not authenticated!";
    const NO_LOGIN_ERR = "User is not logged in!";

    const result = { "messages" : [], "isSuccess" : true}
    console.log(req.session);
    
    if( req?.session?.authorization )
    {
        let token = req.session.authorization["token"];

        jwt.verify( token, mySecretKey, ( err, user) => {
            if( !err )
            {
                req.user = user;
                next();
            }
            else
            {
                result["isSuccess"] = false;
                result["messages"].push( NO_AUTH_ERR );
            }
        })
    }
    else
    {
        result["isSuccess"] = false;
        result["messages"].push( NO_LOGIN_ERR );
    }

    return res.status( result["isSuccess"] ? 200 : 403 ).json( result );


});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen( PORT, () => console.log("Server is running") );
