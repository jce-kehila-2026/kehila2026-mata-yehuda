import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export async function addRequest(phone, content){
    await addDoc(collection(db,"requests"),{
        phone: phone,
        content : content,
        status: "waiting",
        date: serverTimestamp(),
    });
}