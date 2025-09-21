
import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "studio-5589810889-8713e",
  "appId": "1:967271201856:web:3a809f573af17cb49073a5",
  "storageBucket": "studio-5589810889-8713e.appspot.com",
  "apiKey": "AIzaSyC-579b464db6bec23bdd00001606d5c562bd3427e4defc9111a02cc8e",
  "authDomain": "studio-5589810889-8713e.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "967271201856"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
