const functions = require('firebase-functions');

const { getAllScreams, postOneScream } = require('./handlers/scream');
const { signup, login } = require('./handlers/users');
const FBAuth = require('./util/fbAuth');

const express = require('express');
const app = express();

// SignUp route
app.post('/signup', signup);

// Login Route
app.post('/login', login);

// Scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream); //MiddleWare

// Boa prática http://baseurl.com/api/route...

exports.api = functions.https.onRequest(app);

//TesteCommit