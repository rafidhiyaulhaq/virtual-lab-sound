// src/firebase/results.js
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';

export const saveExperimentResult = async (userId, experimentType, data) => {
  try {
    const docRef = await addDoc(collection(db, 'results'), {
      userId,
      experimentType,
      data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getUserResults = async (userId) => {
  try {
    const q = query(collection(db, 'results'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};