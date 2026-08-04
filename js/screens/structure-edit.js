// 構文・パラフレ・編集画面
// - 型・意味・解説・例文（複数）を編集、削除
// - 練習中に気づいた誤りをその場で直す用途

import { updateStructure, deleteStructure } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { refreshStructureList } from "./structure-list.js";

let initialized = false;
let currentId = null;
let currentNumber = null;
let exampleDrafts = []; // [{en, ja}]

export function initStructureEditScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-structure-edit").addEventListener("click", () => {
        showScreen("screen-structure-list");
    });

    document.getElementById("btn-save-structure-edit").addEventListener("click", handleSave);
    document.getElementById("btn-delete-structure-edit").addEventListener("click", handleDelete);
    document.getElementById("btn-add-structure-example").addEventListener("click", () => {
        syncDraftsFromInputs();
        exampleDrafts.push({ en: "", ja: "" });
        renderExamples();
    });

    initialized = true;
}

export function openStructureEdit(s) {
    currentId = s.id;
    currentNumber = s.number;
    document.getElementById("structure-edit-number").textContent =
        typeof s.number === "number" ? `#${String(s.number).padStart(3, "0")}` : "#---";
    document.getElementById("input-structure-pattern").value = s.pattern || "";
    document.getElementById("input-structure-meaning").value = s.meaning || "";
    document.getElementById("input-structure-note").value = s.note || "";

    exampleDrafts = (s.examples || []).map(e => ({ en: e.en || "", ja: e.ja || "" }));
    if (exampleDrafts.length === 0) exampleDrafts.push({ en: "", ja: "" });
    renderExamples();

    showScreen("screen-structure-edit");
}

function renderExamples() {
    const wrap = document.getElementById("structure-example-editors");
    wrap.innerHTML = exampleDrafts.map((e, i) => `
        <div class="structure-example-editor" data-index="${i}">
            <div class="structure-example-head">
                <span class="structure-example-num">例文 ${i + 1}</span>
                <button class="btn-text structure-example-remove" data-remove="${i}" type="button">削除</button>
            </div>
            <textarea class="settings-textarea" rows="2" data-field="en" data-index="${i}"
                placeholder="英文">${escapeHtml(e.en)}</textarea>
            <textarea class="settings-textarea" rows="2" data-field="ja" data-index="${i}"
                placeholder="日本語訳">${escapeHtml(e.ja)}</textarea>
        </div>
    `).join("");

    wrap.querySelectorAll("[data-remove]").forEach(btn => {
        btn.addEventListener("click", () => {
            syncDraftsFromInputs();
            exampleDrafts.splice(Number(btn.dataset.remove), 1);
            if (exampleDrafts.length === 0) exampleDrafts.push({ en: "", ja: "" });
            renderExamples();
        });
    });
}

// 入力欄の現在値をドラフト配列へ反映（再描画で消えないように）
function syncDraftsFromInputs() {
    document.querySelectorAll("#structure-example-editors textarea").forEach(el => {
        const i = Number(el.dataset.index);
        if (!exampleDrafts[i]) return;
        exampleDrafts[i][el.dataset.field] = el.value;
    });
}

async function handleSave() {
    if (!currentId) return;
    syncDraftsFromInputs();

    const pattern = document.getElementById("input-structure-pattern").value.trim();
    const meaning = document.getElementById("input-structure-meaning").value.trim();
    const note = document.getElementById("input-structure-note").value.trim();
    const examples = exampleDrafts
        .map(e => ({ en: (e.en || "").trim(), ja: (e.ja || "").trim() }))
        .filter(e => e.en || e.ja);

    if (!pattern) {
        showToast("型は必須です", "error");
        return;
    }

    const btn = document.getElementById("btn-save-structure-edit");
    btn.disabled = true;
    btn.textContent = "保存中…";

    try {
        await updateStructure(currentId, { pattern, meaning, note, examples });
        showToast("保存しました", "success");
        await refreshStructureList();
        showScreen("screen-structure-list");
    } catch (err) {
        console.error("構文の保存失敗:", err);
        showToast("保存に失敗しました", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "保存する";
    }
}

async function handleDelete() {
    if (!currentId) return;
    const numLabel = typeof currentNumber === "number"
        ? `#${String(currentNumber).padStart(3, "0")}`
        : "この構文";
    if (!confirm(`${numLabel} を削除します。元に戻せません。よろしいですか？`)) return;

    const btn = document.getElementById("btn-delete-structure-edit");
    btn.disabled = true;
    btn.textContent = "削除中…";

    try {
        await deleteStructure(currentId);
        showToast("削除しました", "success");
        await refreshStructureList();
        showScreen("screen-structure-list");
    } catch (err) {
        console.error("削除失敗:", err);
        showToast("削除に失敗しました", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "🗑 この構文を削除";
    }
}

function escapeHtml(s) {
    return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
