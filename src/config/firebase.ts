import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey:"AIzaSyB7fyiKPxVQINgpp16_d__-cXthoHhunuM",
  authDomain:"ideief.firebaseapp.com",
  projectId:"ideief",
  storageBucket:"ideief.firebasestorage.appspot.com",
   messagingSenderId: "301800921832",
  appId: "1:301800921832:web:787b9e1ab244851875075d"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);