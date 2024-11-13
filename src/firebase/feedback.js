// src/firebase/feedback.js
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';

export const saveFeedback = async (userId, experimentType, feedbackData) => {
  try {
    const docRef = await addDoc(collection(db, 'feedback'), {
      userId,
      experimentType,
      ...feedbackData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getUserFeedback = async (userId, experimentType) => {
  try {
    const q = query(
      collection(db, 'feedback'),
      where('userId', '==', userId),
      where('experimentType', '==', experimentType)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};