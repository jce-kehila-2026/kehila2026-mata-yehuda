import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";

function sortByHebrewName(items, nameKey) {
  return [...items].sort((a, b) =>
    String(a[nameKey] || "").localeCompare(String(b[nameKey] || ""), "he")
  );
}

export async function getAllLanguages() {
  const snapshot = await getDocs(collection(db, "languages"));

  return sortByHebrewName(
    snapshot.docs.map((languageDoc) => ({
      id: languageDoc.id,
      name: languageDoc.data().name || "",
      is_active: languageDoc.data().is_active === true,
    })),
    "name"
  );
}

export async function createLanguage({ name }) {
  const trimmedName = String(name || "").trim();

  if (!trimmedName) {
    throw new Error("language-name-required");
  }

  const docRef = await addDoc(collection(db, "languages"), {
    name: trimmedName,
    is_active: true,
  });

  return { id: docRef.id, name: trimmedName, is_active: true };
}

export async function updateLanguage(id, { name }) {
  const trimmedName = String(name || "").trim();

  if (!trimmedName) {
    throw new Error("language-name-required");
  }

  await updateDoc(doc(db, "languages", id), {
    name: trimmedName,
  });
}

export async function setLanguageActive(id, isActive) {
  await updateDoc(doc(db, "languages", id), {
    is_active: isActive === true,
  });
}

export async function getAllHelpTypes() {
  const snapshot = await getDocs(collection(db, "helpTypes"));

  return sortByHebrewName(
    snapshot.docs.map((helpTypeDoc) => {
      const data = helpTypeDoc.data();

      return {
        id: helpTypeDoc.id,
        help_name: data.help_name || "",
        description: data.description || "",
        is_active: data.is_active === true,
      };
    }),
    "help_name"
  );
}

export async function createHelpType({ help_name, description }) {
  const trimmedName = String(help_name || "").trim();

  if (!trimmedName) {
    throw new Error("help-type-name-required");
  }

  const docRef = await addDoc(collection(db, "helpTypes"), {
    help_name: trimmedName,
    description: String(description || "").trim(),
    is_active: true,
  });

  return {
    id: docRef.id,
    help_name: trimmedName,
    description: String(description || "").trim(),
    is_active: true,
  };
}

export async function updateHelpType(id, { help_name, description }) {
  const trimmedName = String(help_name || "").trim();

  if (!trimmedName) {
    throw new Error("help-type-name-required");
  }

  await updateDoc(doc(db, "helpTypes", id), {
    help_name: trimmedName,
    description: String(description || "").trim(),
  });
}

export async function setHelpTypeActive(id, isActive) {
  await updateDoc(doc(db, "helpTypes", id), {
    is_active: isActive === true,
  });
}
