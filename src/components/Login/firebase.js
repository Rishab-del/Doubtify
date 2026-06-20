import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDFO6fD8VgMk8Vx33aLUZUdotno-r7NJM4",
  authDomain: "doubtify-492613.firebaseapp.com",
  projectId: "doubtify-492613",
  storageBucket: "doubtify-492613.firebasestorage.app",
  messagingSenderId: "970249565317",
  appId: "1:970249565317:web:b30db4ca0166b6c4b965ec",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider =
  new GoogleAuthProvider();