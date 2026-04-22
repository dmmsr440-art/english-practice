// 瞬間英作文・一覧画面
// - 検索（日本語・英訳）
// - 絞り込み（全て / フラグ付き）
// - タップで練習画面へ、編集・削除は後続Stepで
// - 練習開始ボタン（通常 / フラグ付きのみ）

import { listSokkanExamples, toggleSokkanFlag } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { startPractice } from "./sokkan-practice.js";
import { openSokkanQuickAdd } from "./sokkan-quick-add.js";
import { openSokkanEdit } from "./sokkan-edit.js";

let allExamples = [];
let currentFilter = "all"; // "all" | "flag"
let currentSearch = "";
let listInitialized = false;

export async function openSokkanList() {
    showScreen("screen-sokkan-list");
    await reloadAndRender();
}

export function initSokkanListScreen() {
    if (listInitialized) return;

    document.getElementById("btn-back-from-sokkan-list").addEventListener("click", () => {
        showScreen("screen-home");
    });

    // ＋ 新規登録（クイック入力画面へ）
    document.getElementById("btn-open-quick-add").addEventListener("click", () => {
        openSokkanQuickAdd();
    });

    // 検索
    const searchEl = document.getElementById("sokkan-search");
    searchEl.addEventListener("input", () => {
        currentSearch = searchEl.value.trim().toLowerCase();
        render();
    });

    // 絞り込みタブ
    document.querySelectorAll(".filter-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentFilter = tab.dataset.filter;
            render();
        });
    });

    // 練習開始
    document.getElementById("btn-start-practice-normal").addEventListener("click", () => {
        const pool = allExamples;
        if (pool.length === 0) {
            showToast("例文がありません", "error");
            return;
        }
        startPractice({ mode: "normal", examples: pool });
    });

    document.getElementById("btn-start-practice-flag").addEventListener("click", () => {
        const pool = allExamples.filter(e => e.flag);
        if (pool.length === 0) {
            showToast("🚩フラグ付きの例文がありません", "default", 3000);
            return;
        }
        startPractice({ mode: "flag", examples: pool });
    });

    listInitialized = true;
}

async function reloadAndRender() {
    try {
        allExamples = await listSokkanExamples();
    } catch (err) {
        console.error("例文の取得に失敗:", err);
        showToast("読み込みに失敗しました", "error");
        allExamples = [];
    }
    render();
}

function render() {
    const filtered = applyFilter(allExamples);

    const listEl = document.getElementById("sokkan-list");
    const emptyEl = document.getElementById("sokkan-empty");
    const countEl = document.getElementById("sokkan-count");

    countEl.textContent = `${filtered.length} / ${allExamples.length}件`;

    if (filtered.length === 0) {
        listEl.innerHTML = "";
        emptyEl.hidden = false;
        return;
    }
    emptyEl.hidden = true;

    listEl.innerHTML = filtered.map((ex) => {
        const flagClass = ex.flag ? "flag-on" : "flag-off";
        const flagIcon = ex.flag ? "🚩" : "🏳️";
        const numLabel = formatNumber(ex.number);
        return `
            <li class="sokkan-item" data-id="${ex.id}">
                <button class="sokkan-item-flag ${flagClass}" data-flag-id="${ex.id}" aria-label="フラグ切替">
                    ${flagIcon}
                </button>
                <div class="sokkan-item-body" data-practice-id="${ex.id}">
                    <div class="sokkan-item-head">
                        <span class="sokkan-num">${numLabel}</span>
                        <span class="sokkan-item-meta">
                            ${ex.practiceCount ? `練習 ${ex.practiceCount}回` : "未練習"}
                        </span>
                    </div>
                    <p class="sokkan-item-ja">${escapeHtml(ex.ja)}</p>
                    <p class="sokkan-item-en">${escapeHtml(ex.en || "（英訳未登録）")}</p>
                </div>
                <button class="sokkan-item-edit" data-edit-id="${ex.id}" aria-label="編集">
                    ✏️
                </button>
            </li>
        `;
    }).join("");

    // 各行のクリック：タップで1問練習開始
    listEl.querySelectorAll("[data-practice-id]").forEach(el => {
        el.addEventListener("click", () => {
            const id = el.dataset.practiceId;
            const ex = allExamples.find(e => e.id === id);
            if (ex) startPractice({ mode: "single", examples: [ex] });
        });
    });

    // 編集アイコン
    listEl.querySelectorAll("[data-edit-id]").forEach(el => {
        el.addEventListener("click", (evt) => {
            evt.stopPropagation();
            const id = el.dataset.editId;
            const ex = allExamples.find(x => x.id === id);
            if (ex) openSokkanEdit(ex);
        });
    });

    // フラグ切替
    listEl.querySelectorAll("[data-flag-id]").forEach(el => {
        el.addEventListener("click", async (evt) => {
            evt.stopPropagation();
            const id = el.dataset.flagId;
            const ex = allExamples.find(x => x.id === id);
            if (!ex) return;
            const newFlag = !ex.flag;
            ex.flag = newFlag; // 楽観的更新
            render();
            try {
                await toggleSokkanFlag(id, newFlag);
            } catch (err) {
                ex.flag = !newFlag;
                render();
                showToast("保存に失敗しました", "error");
            }
        });
    });
}

function applyFilter(examples) {
    let result = examples;
    if (currentFilter === "flag") {
        result = result.filter(e => e.flag);
    }
    if (currentSearch) {
        const q = currentSearch;
        result = result.filter(e => {
            const numStr = typeof e.number === "number" ? String(e.number).padStart(3, "0") : "";
            return (
                (e.ja || "").toLowerCase().includes(q) ||
                (e.en || "").toLowerCase().includes(q) ||
                numStr.includes(q)
            );
        });
    }
    return result;
}

function formatNumber(n) {
    if (typeof n !== "number") return "#---";
    return `#${String(n).padStart(3, "0")}`;
}

function escapeHtml(s) {
    return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// 一覧再読み込み（練習画面から戻ったとき用）
export async function refreshSokkanList() {
    await reloadAndRender();
}
