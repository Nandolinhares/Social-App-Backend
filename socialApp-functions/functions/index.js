const functions = require('firebase-functions');
const express = require('express');
const app = express();

var admin = require("firebase-admin");

var serviceAccount = require('./socialapp-9e3f3-firebase-adminsdk-hqgz5-754255531f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialapp-9e3f3.firebaseio.com"
});

const firebaseConfig = {
    apiKey: "AIzaSyBaoc15rDMlNqqW4jvNuyKj0xSZt31uPU4",
    authDomain: "socialapp-9e3f3.firebaseapp.com",
    databaseURL: "https://socialapp-9e3f3.firebaseio.com",
    projectId: "socialapp-9e3f3",
    storageBucket: "socialapp-9e3f3.appspot.com",
    messagingSenderId: "377444221031",
    appId: "1:377444221031:web:15805079c3245741"
  };

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();

app.get('/screams', (req, res) => {
    db.collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
        let screams = [];
        data.forEach((doc) => {
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
            });
        });

        return res.json(screams);
    })
    .catch((err) => console.error(err)); 
});

app.post('/scream',(req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    }; 

    db.collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({ message: `document ${doc.id} created sucessfully` });
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
});

// Boa prática http://baseurl.com/api/route...

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) {
        return true;
    } else {
        return false; 
    }
}

//SignUp route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    }

    let errors = {}; // Um objeto

    if(isEmpty(newUser.email)) {
        errors.email = 'Must not be empty';
    } else if(!isEmail(newUser.email)) {
        errors.email = 'Must be a valid email address';
    }

    if(isEmpty(newUser.password)) errors.password = 'Must not be empty';
    if(newUser.password !== newUser.confirmPassword) 
        errors.confirmPassword = 'Passwords must match';
    if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

    // Verificar se algum erro ainda está salvo no array, para continuar
    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    // Todo: Validate data
    let token, userId;
    
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists) { // Se já existir um usuário com esse handle, então retornar erro
                return res.status(400).json({ handle: 'This handle is already taken' });
            } else {
               return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken(); //Retorna o token
        })
        .then((idToken) => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };

            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'Email is already in use' });
            } else {
                return res.status(500).json({ error: err.code });
            }
        })
});

exports.api = functions.https.onRequest(app);

//TesteCommit