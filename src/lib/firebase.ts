import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

export type FirebaseConfig = FirebaseOptions & {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
};

const DEFAULT_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyBoBMMMTrucrXasWD_grPdzeoBi1W_NV_E",
  authDomain: "shoe-app-1d79b.firebaseapp.com",
  projectId: "shoe-app-1d79b",
  storageBucket: "shoe-app-1d79b.firebasestorage.app",
  messagingSenderId: "896329651840",
  appId: "1:896329651840:web:630a44586be9de01663865",
  measurementId: "G-NPY6XVB7RE",
};

export function getStoredFirebaseConfig(): FirebaseConfig | null {
  return DEFAULT_CONFIG;
}

export function setStoredFirebaseConfig(_config: FirebaseConfig) {
  // no-op: config is hardcoded
}

export function clearStoredFirebaseConfig() {
  // no-op
}

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export function getDb(): Firestore {
  if (_db) return _db;
  _app = getApps()[0] ?? initializeApp(DEFAULT_CONFIG);
  _db = getFirestore(_app);
  return _db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (_storage) return _storage;
  _app = getApps()[0] ?? initializeApp(DEFAULT_CONFIG);
  _storage = getStorage(_app);
  return _storage;
}
