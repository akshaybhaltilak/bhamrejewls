import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, onValue, remove, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAC8nPOXJ6JJnotoILjntknSgzEBbfVwlU",
  authDomain: "bhamaregoldcatlog.firebaseapp.com",
  projectId: "bhamaregoldcatlog",
  storageBucket: "bhamaregoldcatlog.appspot.com",
  messagingSenderId: "582727392547",
  appId: "1:582727392547:web:23efa8d2f079e581f90096",
  databaseURL: "https://bhamaregoldcatlog-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

export { database, ref, push, set, onValue, remove, update, storage, storageRef, uploadBytes, getDownloadURL };