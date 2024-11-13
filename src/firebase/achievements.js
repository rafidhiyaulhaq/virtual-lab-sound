// src/firebase/achievements.js
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const updateAchievements = async (userId, experimentType) => {
  try {
    const achievementsRef = doc(db, 'achievements', userId);
    const achievementsDoc = await getDoc(achievementsRef);

    const newAchievement = {
      lastUpdated: new Date().toISOString(),
      experiments: {
        [experimentType]: achievementsDoc.exists() 
          ? (achievementsDoc.data().experiments?.[experimentType] || 0) + 1 
          : 1
      }
    };

    if (achievementsDoc.exists()) {
      await updateDoc(achievementsRef, {
        [`experiments.${experimentType}`]: newAchievement.experiments[experimentType],
        lastUpdated: newAchievement.lastUpdated
      });
    } else {
      await setDoc(achievementsRef, newAchievement);
    }

    return newAchievement;
  } catch (error) {
    console.error('Error updating achievements:', error);
    throw error;
  }
};

export const getAchievements = async (userId) => {
  try {
    const achievementsRef = doc(db, 'achievements', userId);
    const achievementsDoc = await getDoc(achievementsRef);
    
    if (achievementsDoc.exists()) {
      return achievementsDoc.data();
    }
    return { experiments: {} };
  } catch (error) {
    console.error('Error getting achievements:', error);
    throw error;
  }
};