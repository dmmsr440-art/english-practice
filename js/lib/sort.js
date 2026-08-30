// 一覧の並び替え（瞬間英作文・チャンク・構文で共通利用）
// - 並び順の選択は端末ごとに localStorage へ保存（モジュール単位）
// - 「ランダム」は一覧を読み込み直したタイミングでだけシャッフルし直す
//   （フラグ切替などの再描画では順番が飛ばないように、id→順番のマップを保持）
//
// ※ 練習の出題順はこの並び替えとは独立（従来どおり毎回シャッフル）

import { normalizeFlagLevel, FLAG_LEVELS } from "./storage.js";

export const SORT_OPTIONS = [
    { value: "number-asc", label: "番号順（001→）" },
    { value: "number-desc", label: "番号順（新しい順）" },
    { value: "flag", label: "フラグ色順（🔴→🟡→🔵）" },
    { value: "practice-asc", label: "練習回数が少ない順" },
    { value: "practice-desc", label: "練習回数が多い順" },
    { value: "recent-asc", label: "ご無沙汰順（最終練習が古い）" },
    { value: "recent-desc", label: "最近練習した順" },
    { value: "random", label: "🔀 ランダム" }
];

const VALID_SORTS = SORT_OPTIONS.map(o => o.value);

// <select> に選択肢を流し込む（HTML側は空の<select>を置くだけでよい）
export function fillSortSelect(selectEl, current) {
    if (!selectEl) return;
    selectEl.innerHTML = SORT_OPTIONS
        .map(o => `<option value="${o.value}">${o.label}</option>`)
        .join("");
    selectEl.value = VALID_SORTS.includes(current) ? current : SORT_OPTIONS[0].value;
}

// 保存・読み出し（moduleKey: "sokkan" | "chunk" | "structure"）
export function loadSort(moduleKey, fallback) {
    try {
        const saved = localStorage.getItem(`sortOrder:${moduleKey}`);
        if (saved && VALID_SORTS.includes(saved)) return saved;
    } catch (err) {
        // プライベートブラウズ等でlocalStorageが使えない場合は既定値
    }
    return fallback;
}

export function saveSort(moduleKey, value) {
    try {
        localStorage.setItem(`sortOrder:${moduleKey}`, value);
    } catch (err) {
        // 保存できなくても並び替え自体は動くので無視
    }
}

// ランダム用：id → 乱数ランクのマップを作る
export function makeRandomRanks(items) {
    const map = new Map();
    items.forEach(item => map.set(item.id, Math.random()));
    return map;
}

function num(item) {
    return typeof item.number === "number" ? item.number : Infinity;
}

function practiceCount(item) {
    return typeof item.practiceCount === "number" ? item.practiceCount : 0;
}

// 最終練習日時（ミリ秒）。未練習は0＝いちばん古い扱い
function lastPracticedMillis(item) {
    const v = item.lastPracticedAt;
    if (!v) return 0;
    if (typeof v.toMillis === "function") return v.toMillis();
    const t = new Date(v).getTime();
    return Number.isNaN(t) ? 0 : t;
}

function flagRank(item) {
    return FLAG_LEVELS.indexOf(normalizeFlagLevel(item.flagLevel));
}

// 並び替えた新しい配列を返す（元配列は変更しない）
export function sortItems(items, sortKey, randomRanks) {
    const rows = [...items];
    const byNumberAsc = (a, b) => num(a) - num(b);

    switch (sortKey) {
        case "number-desc":
            rows.sort((a, b) => num(b) - num(a));
            break;
        case "flag":
            // 🔴→🟡→🔵。同じ色の中は番号順
            rows.sort((a, b) => (flagRank(a) - flagRank(b)) || byNumberAsc(a, b));
            break;
        case "practice-asc":
            rows.sort((a, b) => (practiceCount(a) - practiceCount(b)) || byNumberAsc(a, b));
            break;
        case "practice-desc":
            rows.sort((a, b) => (practiceCount(b) - practiceCount(a)) || byNumberAsc(a, b));
            break;
        case "recent-asc":
            rows.sort((a, b) => (lastPracticedMillis(a) - lastPracticedMillis(b)) || byNumberAsc(a, b));
            break;
        case "recent-desc":
            rows.sort((a, b) => (lastPracticedMillis(b) - lastPracticedMillis(a)) || byNumberAsc(a, b));
            break;
        case "random":
            rows.sort((a, b) => {
                const ra = randomRanks?.get(a.id) ?? 0;
                const rb = randomRanks?.get(b.id) ?? 0;
                return ra - rb;
            });
            break;
        case "number-asc":
        default:
            rows.sort(byNumberAsc);
            break;
    }
    return rows;
}
