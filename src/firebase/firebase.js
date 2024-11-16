import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAuD5tlbLZ6_SJwSsj-0Kz-_HrFySXo9Nw",
  authDomain: "virtual-lab-sound.firebaseapp.com",
  projectId: "virtual-lab-sound",
  storageBucket: "virtual-lab-sound.firebasestorage.app",
  messagingSenderId: "15955842519",
  appId: "1:15955842519:web:97ff57fd2a2232778b2792",
  measurementId: "G-DG205S2Y44"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});

export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export { auth };
export default app;