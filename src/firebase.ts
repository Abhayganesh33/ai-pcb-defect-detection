import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAMyq3H3EhXjOUJRIEfez2jmdQTJUeWiI0",
  authDomain: "abhiram-6c9fe.firebaseapp.com",
  databaseURL: "https://abhiram-6c9fe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "abhiram-6c9fe",
  storageBucket: "abhiram-6c9fe.firebasestorage.app",
  messagingSenderId: "600383291502",
  appId: "1:600383291502:web:432644b133a2400609267f"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
