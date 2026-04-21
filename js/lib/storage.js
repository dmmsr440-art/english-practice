// Firestoreデータアクセスの抽象化
// - プロフィール（Why/Goal/設定）
// - 日次チェック
// - Whyの最終閲覧日時

import {
    db, auth,
    doc, getDoc, setDoc, updateDoc,
    serverTimestamp
} from "./firebase.js";

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
            lastWhyViewedAt: null
        });
        return (await getDoc(ref)).data();
    }
    return snap.data();
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
