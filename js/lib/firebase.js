// Firebase 初期化と共通関数
// Firebase SDK v10.x を CDN から ESM で読み込む

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { firebaseConfig } from "../config/firebase-config.js";

// Firebase 初期化
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// オフライン対応（Firestoreのオフラインキャッシュを有効化）
try {
    await enableIndexedDbPersistence(db);
} catch (err) {
    if (err.code === "failed-precondition") {
        console.warn("Firestore persistence: 複数タブで開いているため無効化");
    } else if (err.code === "unimplemented") {
        console.warn("Firestore persistence: このブラウザは非対応");
    }
}

// Google 認証プロバイダ
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// --- 認証系のエクスポート ---

export async function signInWithGoogle() {
    try {
        // モバイルの一部環境ではポップアップがブロックされるためリダイレクトも検討可
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("ログインエラー:", error);
        throw error;
    }
}

export async function signOutUser() {
    return await signOut(auth);
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// リダイレクト後の結果を取得（モバイルでpopupが使えない場合用）
export async function handleRedirectResult() {
    try {
        const result = await getRedirectResult(auth);
        return result?.user || null;
    } catch (error) {
        console.error("リダイレクト結果取得エラー:", error);
        return null;
    }
}

// --- Firestore 共通関数 ---

export {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp
};
