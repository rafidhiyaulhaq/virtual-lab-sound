// src/firebase/analytics.js
import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy 
} from 'firebase/firestore';

export const getUserAnalytics = async (userId) => {
  try {
    // Get experiment results
    const resultsQuery = query(
      collection(db, 'results'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const results = await getDocs(resultsQuery);

    // Get feedback data
    const feedbackQuery = query(
      collection(db, 'feedback'),
      where('userId', '==', userId)
    );
    const feedback = await getDocs(feedbackQuery);

    // Get progress data
    const progressQuery = query(
      collection(db, 'progress'),
      where('userId', '==', userId)
    );
    const progress = await getDocs(progressQuery);

    return {
      experimentCount: results.size,
      feedbackCount: feedback.size,
      experimentData: results.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })),
      feedbackData: feedback.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })),
      progressData: progress.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};