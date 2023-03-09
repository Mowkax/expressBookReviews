const express = require('express');
const axios = require("axios");
const { isValid } = require('./auth_users.js');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ***** [START] ***** \\
// APIs implemented in an asynchronous way as functions
const getBooksAsync = async () => 
{
  const url = "http://localhost:5000/";
  const result = await axios.get( url );
  return result;
}

const getBooksByIsbnAsync = async ( isbn ) =>
{
  const url = `http://localhost:5000/isbn/${isbn}`;
  const result = await axios.get( url );
  return result;
}

const getBooksByAuthorAsync = ( author ) => {
  const bookKeys = Object.keys( books );
  
  let resultList = [];

  //Filter books by authors
  bookKeys.forEach( key => books[ key ]["author"] == author ? resultList.push( books[key] ) : null );

  return new Promise( ( resolve, reject ) => {
    setTimeout( () => { resolve( resultList ) }, 2000);
  })

}

const getBooksByTitleAsync = ( title ) => {
  const bookKeys = Object.keys( books );
  
  let resultList = [];

  //Filter books by authors
  bookKeys.forEach( key => books[ key ]["title"] == title ? resultList.push( books[key] ) : null );
  
  return new Promise( ( resolve, reject ) => {
    setTimeout( () => { resolve( resultList ) }, 2000);
  });

}

// ***** [END] ***** \\



public_users.post("/register", (req,res) => {
  const INVALID_CREDS_ERR = "Invalid username/password provided. \nUsername and password must be non - empty!";
  const USER_EXISTS_ERR = "User with such username already exists!";
  const SUCCESS_MSG = "Successfully registered!";

  const username = req.body?.username;
  const password = req.body?.password;
  const result = {"messages": [], "isSuccess": true};
  let statusCode = 200;

  const validCreds = isValid( username, password);

  if( validCreds )
  {
    const userExists = users.some( entry => entry["username"] == username );
    // Add an error message if a user with the provided username exists;
    if( userExists )
    {
      result["messages"].push( USER_EXISTS_ERR )
      result["isSuccess"] = false;
    }
    else
    {
      users.push( { username, password } );
      result["messages"].push( SUCCESS_MSG );
    }
    
  }
  else 
  {
    result["messages"].push( INVALID_CREDS_ERR );
    result["isSuccess"] = false;
  }

  statusCode = result["isSuccess"] ? statusCode : 500;
  
  return res.status( statusCode ).json( result );
  
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status( 200 ).json( books );
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  // Check if an entry for the provided key exists
  const book = books[ isbn ] ? books[ isbn ] : {};

  return res.status( 200 ).json( book )
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const bookKeys = Object.keys( books );
  
  let resultList = [];

  //Filter books by authors
  bookKeys.forEach( key => books[ key ]["author"] == author ? resultList.push( books[key] ) : null );


  return res.status( 200 ).json( resultList );
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const bookKeys = Object.keys( books );
  
  let resultList = [];

  //Filter books by authors
  bookKeys.forEach( key => books[ key ]["title"] == title ? resultList.push( books[key] ) : null );


  return res.status( 200 ).json( resultList );
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[ isbn ] ? books[ isbn ] : {};

  let result = book ? book["reviews"] : {};


  return res.status( 200 ).json( result );
});

module.exports.general = public_users;
module.exports.asyncFunctions = { getBooksAsync, getBooksByIsbnAsync, getBooksByAuthorAsync, getBooksByTitleAsync };
