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
            sokkanSeeded: false,
            sokkanNumbersBackfilled: false
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

    // 通しナンバーの一回限りバックフィル（既に番号があれば自動でno-op）
    if (!profile.sokkanNumbersBackfilled) {
        try {
            await backfillSokkanNumbers(uid);
            await updateDoc(ref, { sokkanNumbersBackfilled: true });
            profile.sokkanNumbersBackfilled = true;
        } catch (err) {
            console.warn("通しナンバーのバックフィル失敗（次回再試行）:", err);
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

// --- Gemini APIキー ---

export async function saveGeminiApiKey(key) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, "meta", "profile");
    await updateDoc(ref, { geminiApiKey: key || "" });
}

export async function getGeminiApiKey() {
    const profile = await getProfile();
    return profile?.geminiApiKey || "";
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

// 全例文取得（通しナンバー昇順。未付番は末尾にcreatedAt順で並べる）
export async function listSokkanExamples() {
    const uid = getUid();
    if (!uid) return [];
    const snap = await getDocs(sokkanColRef(uid));
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => {
        const na = typeof a.number === "number" ? a.number : -Infinity;
        const nb = typeof b.number === "number" ? b.number : -Infinity;
        if (na !== nb) return nb - na;
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return tb - ta;
    });
    return rows;
}

// 次に使う通しナンバー（現状の最大 +1）
export async function getNextSokkanNumber() {
    const uid = getUid();
    if (!uid) return 1;
    const snap = await getDocs(sokkanColRef(uid));
    let maxNum = 0;
    snap.forEach(d => {
        const n = d.data().number;
        if (typeof n === "number" && n > maxNum) maxNum = n;
    });
    return maxNum + 1;
}

// 例文を1件追加（通しナンバーは自動採番：現状の最大+1）
export async function addSokkanExample(data) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const number = await getNextSokkanNumber();
    const payload = {
        ja: data.ja || "",
        en: data.en || "",
        pronunciation: data.pronunciation || "",
        category: data.category || "",
        flag: !!data.flag,
        number,
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
// SEED_SOKKAN は i01〜i34 の順。配列index+1 を通しナンバーに使う。
async function seedSokkanExamples(uid) {
    const existing = await getDocs(sokkanColRef(uid));
    const existingLegacyIds = new Set();
    existing.forEach(d => {
        const v = d.data().legacyId;
        if (v) existingLegacyIds.add(v);
    });

    const toSeed = SEED_SOKKAN
        .map((s, i) => ({ ...s, seedNumber: i + 1 }))
        .filter(s => !existingLegacyIds.has(s.legacyId));
    if (toSeed.length === 0) return;

    const batch = writeBatch(db);
    toSeed.forEach(s => {
        const ref = doc(sokkanColRef(uid));
        batch.set(ref, {
            ja: s.jp,
            en: s.en,
            pronunciation: s.pronunciation,
            category: "",
            flag: false,
            number: s.seedNumber,
            practiceCount: 0,
            lastPracticedAt: null,
            legacyId: s.legacyId,
            createdAt: serverTimestamp()
        });
    });
    await batch.commit();
}

// 通しナンバーが未付与のドキュメントに連番を割り振る（既存データの救済）
// - 既に number がある docs の最大値を求め、未付与docsに max+1, max+2, ... を付与
// - 並び順は legacyId 昇順 → createdAt 昇順
async function backfillSokkanNumbers(uid) {
    const snap = await getDocs(sokkanColRef(uid));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    let maxNum = 0;
    all.forEach(d => {
        if (typeof d.number === "number" && d.number > maxNum) maxNum = d.number;
    });

    const missing = all.filter(d => typeof d.number !== "number");
    if (missing.length === 0) return;

    missing.sort((a, b) => {
        const la = a.legacyId || "";
        const lb = b.legacyId || "";
        if (la && lb && la !== lb) return la.localeCompare(lb);
        if (la && !lb) return -1;
        if (!la && lb) return 1;
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return ta - tb;
    });

    const batch = writeBatch(db);
    missing.forEach((d, i) => {
        const ref = doc(db, "users", uid, "sokkanExamples", d.id);
        batch.update(ref, { number: maxNum + i + 1 });
    });
    await batch.commit();
}

// --- ダッシュボード用：日次チェック範囲取得・カウント ---

// YYYY-MM-DD形式のキーを加減算
export function addDaysKey(dateKey, days) {
    const d = new Date(dateKey + "T00:00:00");
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// 日次チェックを期間指定で取得（全件を取って期間フィルタ、小規模想定）
export async function listDailyChecks(fromKey, toKey) {
    const uid = getUid();
    if (!uid) return [];
    const snap = await getDocs(collection(db, "users", uid, "dailyChecks"));
    const rows = [];
    snap.forEach(d => {
        const key = d.id;
        if (key >= fromKey && key <= toKey) {
            rows.push({ dateKey: key, ...DEFAULT_CHECKS, ...d.data() });
        }
    });
    rows.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    return rows;
}

export async function countSokkanExamples() {
    const uid = getUid();
    if (!uid) return 0;
    const snap = await getDocs(sokkanColRef(uid));
    return snap.size;
}

export async function countChunks() {
    const uid = getUid();
    if (!uid) return 0;
    const snap = await getDocs(chunkColRef(uid));
    return snap.size;
}

// 週次メモの保存・取得（key: YYYY-Www 形式、例: 2026-W17）
export async function saveWeeklyNote(weekKey, text) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, "weeklyNotes", weekKey);
    await setDoc(ref, { text, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getWeeklyNote(weekKey) {
    const uid = getUid();
    if (!uid) return "";
    const ref = doc(db, "users", uid, "weeklyNotes", weekKey);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data().text || "") : "";
}

// --- チャンク学習（chunks）操作 ---

function chunkColRef(uid) {
    return collection(db, "users", uid, "chunks");
}

export async function listChunks() {
    const uid = getUid();
    if (!uid) return [];
    const snap = await getDocs(chunkColRef(uid));
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => {
        const na = typeof a.number === "number" ? a.number : -Infinity;
        const nb = typeof b.number === "number" ? b.number : -Infinity;
        if (na !== nb) return nb - na;
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return tb - ta;
    });
    return rows;
}

async function getNextChunkNumber(uid) {
    const snap = await getDocs(chunkColRef(uid));
    let maxNum = 0;
    snap.forEach(d => {
        const n = d.data().number;
        if (typeof n === "number" && n > maxNum) maxNum = n;
    });
    return maxNum + 1;
}

export async function addChunk(data) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const number = await getNextChunkNumber(uid);
    const payload = {
        chunk: data.chunk || "",
        meaning: data.meaning || "",
        example: data.example || "",
        source: data.source || "",
        scene: data.scene || "",
        flag: !!data.flag,
        number,
        practiceCount: 0,
        lastPracticedAt: null,
        createdAt: serverTimestamp()
    };
    const ref = await addDoc(chunkColRef(uid), payload);
    return ref.id;
}

export async function updateChunk(id, patch) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, "chunks", id);
    await updateDoc(ref, patch);
}

export async function toggleChunkFlag(id, flag) {
    return updateChunk(id, { flag: !!flag });
}

export async function recordChunkPractice(id) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, "chunks", id);
    await updateDoc(ref, {
        practiceCount: increment(1),
        lastPracticedAt: serverTimestamp()
    });
}

export async function deleteChunk(id) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, "chunks", id);
    await deleteDoc(ref);
}

// --- ログ系（シャドーイング・多聴） ---
// ミニマム設計：日付・素材/ソース・分数・メモのみ。保存時は該当の日次チェックも自動ON。

function logColRef(uid, kind) {
    // kind: "shadowingLogs" | "listeningLogs"
    return collection(db, "users", uid, kind);
}

async function addLogEntry(kind, checkField, data) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const dateKey = data.dateKey || getTodayDateKey();
    const payload = {
        dateKey,
        source: (data.source || "").trim(),
        minutes: Number(data.minutes) || 0,
        memo: (data.memo || "").trim(),
        createdAt: serverTimestamp()
    };
    const ref = await addDoc(logColRef(uid, kind), payload);
    // 該当日のチェックも自動ON（既にONでも冪等）
    try {
        await toggleDailyCheck(dateKey, checkField, true);
    } catch (err) {
        console.warn("日次チェック自動更新失敗:", err);
    }
    return ref.id;
}

async function listLogs(kind, limit = 30) {
    const uid = getUid();
    if (!uid) return [];
    const snap = await getDocs(logColRef(uid, kind));
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => {
        if (a.dateKey !== b.dateKey) return b.dateKey.localeCompare(a.dateKey);
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return tb - ta;
    });
    return rows.slice(0, limit);
}

async function deleteLogEntry(kind, id) {
    const uid = getUid();
    if (!uid) throw new Error("未ログイン");
    const ref = doc(db, "users", uid, kind, id);
    await deleteDoc(ref);
}

export const addShadowingLog = (data) => addLogEntry("shadowingLogs", "shadowing", data);
export const listShadowingLogs = (limit) => listLogs("shadowingLogs", limit);
export const deleteShadowingLog = (id) => deleteLogEntry("shadowingLogs", id);

export const addListeningLog = (data) => addLogEntry("listeningLogs", "listening", data);
export const listListeningLogs = (limit) => listLogs("listeningLogs", limit);
export const deleteListeningLog = (id) => deleteLogEntry("listeningLogs", id);

// --- 学習ストリーク・空白日数 ---

const STUDY_CHECK_FIELDS = ["shadowing", "listening", "sokkanEisakubun", "soloTalk", "chunk", "cambly"];

// 連続学習日数（streak）と連続空白日数（gap）を返す
// streak: 今日含む連続学習日数（今日まだ何もしてない場合は0）
// gap: 昨日から遡った連続空白日数
export async function getStudyStats(timezone = "America/Chicago") {
    const todayKey = getTodayDateKey(timezone);
    const fromKey = addDaysKey(todayKey, -30);
    const rows = await listDailyChecks(fromKey, todayKey);
    const rowMap = {};
    rows.forEach(r => { rowMap[r.dateKey] = r; });

    const isActive = (key) => {
        const row = rowMap[key];
        return row && STUDY_CHECK_FIELDS.some(f => row[f] === true);
    };

    // 空白日数（昨日から遡って、何も記録がない日が何日続いているか）
    let gap = 0;
    for (let i = 1; i <= 30; i++) {
        const key = addDaysKey(todayKey, -i);
        if (!isActive(key)) gap++;
        else break;
    }

    // ストリーク（今日から遡って、連続して学習している日数）
    let streak = 0;
    for (let i = 0; i <= 30; i++) {
        const key = addDaysKey(todayKey, -i);
        if (isActive(key)) streak++;
        else break;
    }

    return { streak, gap };
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
