// 構文・パラフレ・一覧画面
// - ATSU「表現・構文厳選120選」を通しナンバー順に表示
// - フラグ色（赤/黄/青）・カテゴリ（初級/中上級/表現①〜③）で絞り込み
// - タップで1構文の型の反復練習、✏️で編集
// - 「型の反復練習」と「AIパラフレ練習」の2つの練習モードを起動

import {
    listStructures, setStructureFlagLevel,
    STRUCTURE_CATEGORY_LABELS,
    FLAG_ICONS, normalizeFlagLevel, nextFlagLevel
} from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { startStructurePractice } from "./structure-practice.js";
import { startStructurePara } from "./structure-para.js";
import { openStructureEdit } from "./structure-edit.js";

let allStructures = [];
let currentFilter = "all"; // "all" | "flag-赤黄青" | "cat-カテゴリ"
let currentSearch = "";
let listInitialized = false;

export async function openStructureList() {
    showScreen("screen-structure-list");
    await reloadAndRender();
}

export function initStructureListScreen() {
    if (listInitialized) return;

    document.getElementById("btn-back-from-structure-list").addEventListener("click", () => {
        showScreen("screen-home");
    });

    const searchEl = document.getElementById("structure-search");
    searchEl.addEventListener("input", () => {
        currentSearch = searchEl.value.trim().toLowerCase();
        render();
    });

    document.querySelectorAll("#structure-filter-tabs .filter-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll("#structure-filter-tabs .filter-tab")
                .forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentFilter = tab.dataset.filter;
            render();
        });
    });

    document.getElementById("btn-start-structure-practice").addEventListener("click", () => {
        const pool = applyFilter(allStructures);
        if (pool.length === 0) {
            showToast("該当する構文がありません", "error");
            return;
        }
        startStructurePractice({ mode: "normal", structures: pool });
    });

    document.getElementById("btn-start-structure-para").addEventListener("click", () => {
        const pool = applyFilter(allStructures);
        if (pool.length === 0) {
            showToast("該当する構文がありません", "error");
            return;
        }
        startStructurePara({ structures: pool });
    });

    listInitialized = true;
}

async function reloadAndRender() {
    try {
        allStructures = await listStructures();
    } catch (err) {
        console.error("構文取得失敗:", err);
        showToast("読み込みに失敗しました", "error");
        allStructures = [];
    }
    render();
}

function render() {
    const filtered = applyFilter(allStructures);
    const listEl = document.getElementById("structure-list");
    const emptyEl = document.getElementById("structure-empty");
    const countEl = document.getElementById("structure-count");

    countEl.textContent = `${filtered.length} / ${allStructures.length}件`;
    updateTabCounts();

    if (filtered.length === 0) {
        listEl.innerHTML = "";
        emptyEl.hidden = false;
        return;
    }
    emptyEl.hidden = true;

    listEl.innerHTML = filtered.map((s) => {
        const level = normalizeFlagLevel(s.flagLevel);
        const catLabel = STRUCTURE_CATEGORY_LABELS[s.category] || "";
        const exCount = (s.examples || []).length;
        return `
            <li class="sokkan-item" data-id="${s.id}">
                <button class="sokkan-item-flag flag-${level}" data-flag-id="${s.id}" aria-label="フラグ切替">
                    ${FLAG_ICONS[level]}
                </button>
                <div class="sokkan-item-body" data-practice-id="${s.id}">
                    <div class="sokkan-item-head">
                        <span class="sokkan-num">${formatNumber(s.number)}</span>
                        ${catLabel ? `<span class="item-cat-badge">${escapeHtml(catLabel)}</span>` : ""}
                        <span class="sokkan-item-meta">
                            例文${exCount}・${s.practiceCount ? `練習 ${s.practiceCount}回` : "未練習"}
                        </span>
                    </div>
                    <p class="sokkan-item-ja">${escapeHtml(s.pattern)}</p>
                    <p class="sokkan-item-en">${escapeHtml(s.meaning || "")}</p>
                </div>
                <button class="sokkan-item-edit" data-edit-id="${s.id}" aria-label="編集">
                    ✏️
                </button>
            </li>
        `;
    }).join("");

    listEl.querySelectorAll("[data-practice-id]").forEach(el => {
        el.addEventListener("click", () => {
            const s = allStructures.find(x => x.id === el.dataset.practiceId);
            if (s) startStructurePractice({ mode: "single", structures: [s] });
        });
    });

    listEl.querySelectorAll("[data-edit-id]").forEach(el => {
        el.addEventListener("click", (evt) => {
            evt.stopPropagation();
            const s = allStructures.find(x => x.id === el.dataset.editId);
            if (s) openStructureEdit(s);
        });
    });

    // フラグ循環切替（赤→黄→青→赤）
    listEl.querySelectorAll("[data-flag-id]").forEach(el => {
        el.addEventListener("click", async (evt) => {
            evt.stopPropagation();
            const id = el.dataset.flagId;
            const s = allStructures.find(x => x.id === id);
            if (!s) return;
            const prevLevel = normalizeFlagLevel(s.flagLevel);
            const newLevel = nextFlagLevel(prevLevel);
            s.flagLevel = newLevel;
            render();
            try {
                await setStructureFlagLevel(id, newLevel);
            } catch (err) {
                s.flagLevel = prevLevel;
                render();
                showToast("保存に失敗しました", "error");
            }
        });
    });
}

function countForFilter(filterKey) {
    if (filterKey === "all") return allStructures.length;
    if (filterKey.startsWith("flag-")) {
        const color = filterKey.slice(5);
        return allStructures.filter(s => normalizeFlagLevel(s.flagLevel) === color).length;
    }
    if (filterKey.startsWith("cat-")) {
        const cat = filterKey.slice(4);
        return allStructures.filter(s => s.category === cat).length;
    }
    return 0;
}

function updateTabCounts() {
    document.querySelectorAll("#structure-filter-tabs .filter-tab").forEach(tab => {
        let badge = tab.querySelector(".tab-count");
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "tab-count";
            tab.appendChild(badge);
        }
        badge.textContent = countForFilter(tab.dataset.filter);
    });
}

function applyFilter(structures) {
    let result = structures;
    if (currentFilter.startsWith("flag-")) {
        const color = currentFilter.slice(5);
        result = result.filter(s => normalizeFlagLevel(s.flagLevel) === color);
    } else if (currentFilter.startsWith("cat-")) {
        const cat = currentFilter.slice(4);
        result = result.filter(s => s.category === cat);
    }
    if (currentSearch) {
        const q = currentSearch;
        result = result.filter(s => {
            const numStr = typeof s.number === "number" ? String(s.number).padStart(3, "0") : "";
            const exText = (s.examples || []).map(e => `${e.en} ${e.ja}`).join(" ");
            return (
                (s.pattern || "").toLowerCase().includes(q) ||
                (s.meaning || "").toLowerCase().includes(q) ||
                (s.note || "").toLowerCase().includes(q) ||
                exText.toLowerCase().includes(q) ||
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

export async function refreshStructureList() {
    await reloadAndRender();
}
