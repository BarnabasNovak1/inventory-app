// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrr3lz0H7u1w9c9hkXSlCsTxDXmsIIAQs",
  authDomain: "inventory-management-app-ae715.firebaseapp.com",
  projectId: "inventory-management-app-ae715",
  storageBucket: "inventory-management-app-ae715.appspot.com",
  messagingSenderId: "1002855278630",
  appId: "1:1002855278630:web:20253f79ad30d0ce775ee7",
  measurementId: "G-BSPFPCXSTH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app)

export{ firestore }