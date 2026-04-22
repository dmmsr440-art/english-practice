// Firestoreデータアクセスの抽象化
// - プロフィール（Why/Goal/設定）
// - 日次チェック
// - Whyの最終閲覧日時

import {
    db, auth,
    doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc,
    collection, query, where, orderBy, getDocs,
    writeBatch, increment,
    serverTimestamp
} from "./firebase.js";
import { SEED_SOKKAN } from "../data/seed-sokkan.js";

// 現在のユーザーIDを取得（未ログインならnull）
export function getUid() {
    return auth.currentUser?.uid || null;
}

// --- プロフィール操作 ---

export async function getProfile() {
    const uid = getUid();
    if (!uid) return null;

    const ref = doc(db, "users", uid, "meta", "profile");
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}

export async function ensureProfile(user) {
    const uid = user.uid;
    const ref = doc(db, "users", uid, "meta", "profile");
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        // 初期データ作成
        await setDoc(ref, {
            email: user.email || "",
            displayName: user.displayName || "",
            createdAt: serverTimestamp(),
            whyStatement: DEFAULT_WHY,
            goalStatement: DEFAULT_GOAL,
            lastWhyViewedAt: null,
            sokkanSeeded: false
        });
    }

    // 瞬間英作文の初回シード投入（未実施なら）
    const profile = (await getDoc(ref)).data();
    if (!profile.sokkanSeeded) {
        try {
            await seedSokkanExamples(uid);
            await updateDoc(ref, { sokkanSeeded: true });
            profile.sokkanSeeded = true;
        } catch (err) {
            console.warn("瞬間英作文シード失敗（次回再試行）:", err);
        }
    }

    return profile;
}

export async function saveWhyStatement(text) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, "meta", "profile");
    await updateDoc(ref, { whyStatement: text });
}

export async function saveGoalStatement(text) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, "meta", "profile");
    await updateDoc(ref, { goalStatement: text });
}

export async function markWhyViewed() {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, "meta", "profile");
    await updateDoc(ref, { lastWhyViewedAt: serverTimestamp() });
}

// --- 日次チェック操作 ---

// 日付をYYYY-MM-DD形式で取得（アメリカ中部時間基準）
export function getTodayDateKey(timezone = "America/Chicago") {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
    return fmt.format(now); // "YYYY-MM-DD"
}

const DEFAULT_CHECKS = {
    shadowing: false,
    listening: false,
    sokkanEisakubun: false,
    soloTalk: false,
    chunk: false,
    cambly: false
};

export async function getDailyCheck(dateKey) {
    const uid = getUid();
    if (!uid) return { ...DEFAULT_CHECKS };
    const ref = doc(db, "users", uid, "dailyChecks", dateKey);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { ...DEFAULT_CHECKS };
    return { ...DEFAULT_CHECKS, ...snap.data() };
}

export async function toggleDailyCheck(dateKey, field, value) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, "dailyChecks", dateKey);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, {
            ...DEFAULT_CHECKS,
            [field]: value,
            checkedAt: serverTimestamp()
        });
    } else {
        await updateDoc(ref, {
            [field]: value,
            checkedAt: serverTimestamp()
        });
    }
}

// --- Whyを今日見たかどうか判定 ---

export function isWhyViewedToday(lastWhyViewedAt, timezone = "America/Chicago") {
    if (!lastWhyViewedAt) return false;
    const lastDate = lastWhyViewedAt.toDate
        ? lastWhyViewedAt.toDate()
        : new Date(lastWhyViewedAt);

    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric", month: "2-digit", day: "2-digit"
    });
    return fmt.format(lastDate) === fmt.format(new Date());
}

// --- 瞬間英作文（sokkanExamples）操作 ---

function sokkanColRef(uid) {
    return collection(db, "users", uid, "sokkanExamples");
}

// 全例文取得（createdAt降順）
export async function listSokkanExamples() {
    const uid = getUid();
    if (!uid) return [];
    const q = query(sokkanColRef(uid), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 例文を1件追加
export async function addSokkanExample(data) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const payload = {
        ja: data.ja || "",
        en: data.en || "",
        pronunciation: data.pronunciation || "",
        category: data.category || "",
        flag: !!data.flag,
        practiceCount: 0,
        lastPracticedAt: null,
        createdAt: serverTimestamp(),
        ...(data.legacyId ? { legacyId: data.legacyId } : {})
    };
    const ref = await addDoc(sokkanColRef(uid), payload);
    return ref.id;
}

// 例文更新（部分）
export async function updateSokkanExample(id, patch) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, "sokkanExamples", id);
    await updateDoc(ref, patch);
}

// フラグON/OFFトグル
export async function toggleSokkanFlag(id, flag) {
    return updateSokkanExample(id, { flag: !!flag });
}

// 練習回数を1増やし、lastPracticedAtを更新
export async function recordSokkanPractice(id) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, "sokkanExamples", id);
    await updateDoc(ref, {
        practiceCount: increment(1),
        lastPracticedAt: serverTimestamp()
    });
}

// 例文削除
export async function deleteSokkanExample(id) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, "sokkanExamples", id);
    await deleteDoc(ref);
}

// 初回シード：legacyIdがまだFirestoreに無い分だけを投入
async function seedSokkanExamples(uid) {
    // 既存のlegacyIdを取得
    const existing = await getDocs(sokkanColRef(uid));
    const existingLegacyIds = new Set();
    existing.forEach(d => {
        const v = d.data().legacyId;
        if (v) existingLegacyIds.add(v);
    });

    const toSeed = SEED_SOKKAN.filter(s => !existingLegacyIds.has(s.legacyId));
    if (toSeed.length === 0) return;

    // バッチで投入（500件制限あるが34件なので1バッチで十分）
    const batch = writeBatch(db);
    toSeed.forEach(s => {
        const ref = doc(sokkanColRef(uid)); // auto-ID
        batch.set(ref, {
            ja: s.jp,
            en: s.en,
            pronunciation: s.pronunciation,
            category: "",
            flag: false,
            practiceCount: 0,
            lastPracticedAt: null,
            legacyId: s.legacyId,
            createdAt: serverTimestamp()
        });
    });
    await batch.commit();
}

// --- デフォルト値 ---

export const DEFAULT_WHY = `今の私は、悔しい。

会議でネイティブ同士の議論が加速した瞬間、何を話しているのかすら分からなくなる。話についていけない。意見を言う以前の問題だ。ただ画面を見つめ、置いていかれる自分がいる。

雑談で皆が笑っている。何がおかしいのかが分からない。愛想笑いでごまかす。一緒に笑えない。一緒に話せない。同じチームなのに、自分だけがその場にいないような感覚。

この疎外感を、もう終わりにする。

1年後、私は議論の渦中にいる。聞き取れる。ついていける。そして自分の言葉で切り込める。雑談でも自然に笑い、自分からも返せる。チームの一員として、同じ空気を吸って、同じ温度で、そこにいる。

この1年は、言い訳しない。逃げない。
あの悔しさを、全部燃料にして走り切る。`;

export const DEFAULT_GOAL = `【機能目標】
ネイティブ複数人のディスカッションや雑談で、話の流れを把握できる。字幕や確認に頼らず、大意をリアルタイムで掴める。

【行動目標】
自分の立場から、自分の考えを、適切なタイミングで全員の前で堂々と発言できる。ランチの雑談でも、周囲の雑音の中で会話に自然に加われる。

【感情目標】
議論や雑談の中で生まれる感情——笑い、驚き、怒り、共感——をチームと一緒に感じ、共有できている。同じ空気の中に、自分もちゃんといる。

【ストレッチゴール】
英語で話すことへの心理的な壁が消え、「完璧じゃなくてもいい、まず言ってみよう」と自然に思える自分になっている。`;
