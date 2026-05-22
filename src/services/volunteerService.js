import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

export const getHelpTypes = async () => {
  try {
    const helpTypesCollection = collection(db, "helpTypes");
    const snapshot = await getDocs(helpTypesCollection);

    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((helpType) => helpType.isActive === true);
  } catch (error) {
    console.error("Error getting help types:", error);
    return [];
  }
};

export const getLanguages = async () => {
  try {
    const languagesCollection = collection(db, "languages");
    const snapshot = await getDocs(languagesCollection);

    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((language) => language.isActive === true);
  } catch (error) {
    console.error("Error getting languages:", error);
    return [];
  }
};

export const getVolunteerData = async (volunteerId) => {
  try {
    const volunteerRef = doc(db, "volunteers", volunteerId);
    const snapshot = await getDoc(volunteerRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting volunteer data:", error);
    return null;
  }
};

export const saveVolunteerData = async (volunteerId, volunteerData) => {
  try {
    const volunteerRef = doc(db, "volunteers", volunteerId);

    await setDoc(volunteerRef, volunteerData, { merge: true });

    console.log("Volunteer data saved successfully");
  } catch (error) {
    console.error("Error saving volunteer data:", error);
  }
};