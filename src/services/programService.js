import {
  doc,
  getDoc,
  collection,
  getDocs
} from "firebase/firestore";

import {db} from "../config/firebase"
// programId = daycenter community
export async function getProgramBYId(programId){
// db--> programs-->programId="day_center"
 const programRef = doc(db, "programs", programId);

 const programSnapshot = await getDoc(programRef);
// if the document not exist
 if (!programSnapshot.exists()){
    return null;
 }

 return{
    id: programSnapshot.id,
    ...programSnapshot.data(),
};
}
export async function getAllPrograms() {
  const snapshot = await getDocs(
    collection(db, "programs")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
