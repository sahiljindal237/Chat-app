/* eslint-disable no-unused-vars */
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const config = {
  apiKey: 'AIzaSyDPYZzqrijLhHhHK8jrtyI54KenM6a1S0k',
  authDomain: 'chat-app-3a18c.firebaseapp.com',
  projectId: 'chat-app-3a18c',
  storageBucket: 'chat-app-3a18c.appspot.com',
  messagingSenderId: '8115594213',
  appId: '1:8115594213:web:0b6246bb176cd47d7b850c',
  databaseURL:
    'https://chat-app-3a18c-default-rtdb.asia-southeast1.firebasedatabase.app/',
};

const app = firebase.initializeApp(config);
export const auth = app.auth();
export const database = app.database();
export const storage = app.storage();
