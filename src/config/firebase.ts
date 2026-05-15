import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB7fyiKPxVQINgpp16_d__-cXthoHhunuM",
  authDomain: "ideief.firebaseapp.com",
  projectId: "ideief",
   messagingSenderId: "301800921832",
  appId: "1:301800921832:web:787b9e1ab244851875075d",
  storageBucket: "ideief.appspot.com",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
