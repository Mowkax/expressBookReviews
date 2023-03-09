const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const mySecretKey = "fingerprint_customer"

let users = [];

const isValid = (username, password) => { //returns boolean
  return username && password ? true : false
}

const authenticatedUser = (username, password) => { //returns boolean
  console.log(users)
  return users.some( user => user["username"] == username && user["password"] == password )
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const INVALID_CREDS_ERR = "Invalid credentials!";
  const SUCCESS_LOGIN_MSG = "Successfully logged in!";

  const { username, password } = req.body;

  //Check the validity of the credentials
  const validCredentials = authenticatedUser( username, password );
  const result = { "messages": [], "isSuccess": false };

  let token = '';

  // Generate a JWT token if the provided credentials are valid
  if( validCredentials )
  {
    token = jwt.sign( { data: username }, mySecretKey, { expiresIn : 60 * 60 } );
    
    //Initialize authorization property
    req.session.authorization = { token };

    result["messages"].push( SUCCESS_LOGIN_MSG );
    result["isSuccess"] = true;
  }
  else
  {
    result["messages"].push( INVALID_CREDS_ERR );
  }


  return res.status( result["isSuccess"] ? 200 : 403 ).json( result );

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const INVALID_ISBN_ERR = "No book with such ISBN exists!";
  const result = { "messages": [], "isSuccess": true };

  const review = req.query.review;
  const isbn = req.params.isbn;
  const user = req.user;
  
  if( !books[ isbn ] )
  {
    result["messages"].push( INVALID_ISBN_ERR );
    result["isSuccess"] = false;
  }
  // Determine whether a review needs to be updated/created 
  else
  {
    const reviewExists = books[ isbn ]["reviews"].some( entry => entry["username"] ==  user["data"] )

    reviewExists ? books[ isbn ]["reviews"].forEach( entry => {
      if( entry["username"] == user["data"] )
      {
        entry["review"] = review;
      } 
    }) : books[ isbn ]["reviews"].push( { username: user["data"], review: review } ); 
  }

  return res.status( result["isSuccess"] ? 200 : 500 ).json( result );
});

// Delete existing reviews which belong to the user currently logged in
regd_users.delete("/auth/review/:isbn", ( req, res ) => {
  const INVALID_ISBN_ERR = "No book with such ISBN exists!";
  const result = { "messages": [], "isSuccess": true };
  
  const isbn = req.params.isbn;
  const user = req.user;

  if( !books[ isbn ] )
  {
    result["messages"].push( INVALID_ISBN_ERR );
    result["isSuccess"] = false;
  }
  else
  {
    // Filter review array elements
    books[ isbn ]["reviews"] = books[ isbn ]["reviews"].filter( elem => elem["username"] != user["data"] );

  }
  
  return res.status( result["isSuccess"] ? 200 : 500 ).json( result );
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
