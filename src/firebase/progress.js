// src/firebase/progress.js
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

export const updateProgress = async (userId, experimentType) => {
  try {
    const progressRef = doc(db, 'progress', userId);
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists()) {
      const data = progressDoc.data();
      await updateDoc(progressRef, {
        [`${experimentType}Count`]: increment(1),
        totalExperiments: increment(1),
        lastUpdated: new Date().toISOString()
      });
    } else {
      await setDoc(progressRef, {
        [`${experimentType}Count`]: 1,
        totalExperiments: 1,
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

export const getProgress = async (userId) => {
  try {
    const progressRef = doc(db, 'progress', userId);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      return progressDoc.data();
    }
    return {
      waveGeneratorCount: 0,
      soundAnalysisCount: 0,
      dopplerEffectCount: 0,
      totalExperiments: 0
    };
  } catch (error) {
    console.error('Error getting progress:', error);
    throw error;
  }
};