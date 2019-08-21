var admin = require("firebase-admin");

var serviceAccount = require('../socialapp-9e3f3-firebase-adminsdk-hqgz5-754255531f.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://socialapp-9e3f3.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };