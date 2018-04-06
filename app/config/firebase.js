import * as firebase from 'firebase';
import 'firebase/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyAuFLKp-auhYOpzOyerwIF6jar6bITZf1Q",
    authDomain: "tiecon-pune.firebaseapp.com",
    databaseURL: "https://tiecon-pune.firebaseio.com",
    projectId: "tiecon-pune",
    storageBucket: "tiecon-pune.appspot.com",
    messagingSenderId: "1055109214488"
});
export const firestoreDB = firebase.firestore();

export default firebase;