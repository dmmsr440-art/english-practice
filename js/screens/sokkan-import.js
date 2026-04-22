// 瞬間英作文・一括インポート画面
// - Excel (.xlsx) / CSV ファイルを読み込み、プレビュー表示
// - 列名の自動マッピング（日本語/ja/Japanese、英訳/en/English、発音/pronunciation、カテゴリ/category）
// - 確認後にFirestoreへ順次追加（通しナンバーは自動採番）
// - 空欄の英訳をAIで補完するオプション（APIキー必要）

import { addSokkanExample } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { refreshSokkanList } from "./sokkan-list.js";
import {
    generateTranslation, generatePronunciationPoints, hasGeminiApiKey
} from "../lib/gemini.js";

let initialized = false;
let parsedRows = []; // [{ja, en, pronunciation, category, _skip}]

const COL_ALIASES = {
    ja: ["日本語", "ja", "japanese", "jp", "和文"],
    en: ["英訳", "英語", "en", "english", "eng"],
    pronunciation: ["発音", "発音ポイント", "pronunciation", "pron"],
    category: ["カテゴリ", "カテゴリー", "category", "cat"]
};

export function initSokkanImportScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-import").addEventListener("click", () => {
        showScreen("screen-sokkan-list");
    });

    document.getElementById("input-import-file").addEventListener("change", handleFileSelect);
    document.getElementById("btn-confirm-import").addEventListener("click", handleConfirm);

    initialized = true;
}

export function openSokkanImport() {
    parsedRows = [];
    document.getElementById("input-import-file").value = "";
    document.getElementById("import-selected").textContent = "";
    document.getElementById("import-preview-section").hidden = true;
    document.getElementById("import-progress").textContent = "";
    document.getElementById("chk-import-ai").checked = false;
    showScreen("screen-sokkan-import");
}

async function handleFileSelect(evt) {
    const file = evt.target.files?.[0];
    if (!file) return;

    const selectedEl = document.getElementById("import-selected");
    selectedEl.textContent = `📄 ${file.name}`;

    if (typeof window.XLSX === "undefined") {
        showToast("SheetJSの読み込みを待っています。数秒後に再度お試しください", "error", 4000);
        return;
    }

    try {
        const buf = await file.arrayBuffer();
        const wb = window.XLSX.read(buf, { type: "array" });
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const raw = window.XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
        parsedRows = mapRows(raw);
        renderPreview();
    } catch (err) {
        console.error("ファイル読込失敗:", err);
        showToast("ファイルの読み込みに失敗しました", "error");
    }
}

function mapRows(rawRows) {
    if (rawRows.length === 0) return [];
    const keys = Object.keys(rawRows[0]);
    const resolve = (aliases) => keys.find(k => aliases.some(a =>
        k.trim().toLowerCase() === a.toLowerCase()
    ));
    const jaKey = resolve(COL_ALIASES.ja);
    const enKey = resolve(COL_ALIASES.en);
    const pronKey = resolve(COL_ALIASES.pronunciation);
    const catKey = resolve(COL_ALIASES.category);

    return rawRows.map(r => {
        const ja = jaKey ? String(r[jaKey] || "").trim() : "";
        return {
            ja,
            en: enKey ? String(r[enKey] || "").trim() : "",
            pronunciation: pronKey ? String(r[pronKey] || "").trim() : "",
            category: catKey ? String(r[catKey] || "").trim() : "",
            _skip: !ja
        };
    });
}

function renderPreview() {
    const section = document.getElementById("import-preview-section");
    const summary = document.getElementById("import-summary");
    const table = document.getElementById("import-table");

    const valid = parsedRows.filter(r => !r._skip).length;
    const skipped = parsedRows.length - valid;

    if (parsedRows.length === 0) {
        section.hidden = true;
        showToast("データが見つかりませんでした", "error");
        return;
    }

    summary.innerHTML = `合計 <b>${parsedRows.length}</b> 行 / 取り込み対象 <b>${valid}</b> 行${
        skipped ? ` / 日本語なしで除外 <b>${skipped}</b> 行` : ""
    }`;

    const preview = parsedRows.slice(0, 50);
    table.innerHTML = `
        <thead>
            <tr>
                <th>#</th><th>日本語</th><th>英訳</th><th>発音</th><th>カテゴリ</th>
            </tr>
        </thead>
        <tbody>
            ${preview.map((r, i) => `
                <tr class="${r._skip ? "row-skip" : ""}">
                    <td>${i + 1}</td>
                    <td>${escapeHtml(r.ja) || "<em>(空)</em>"}</td>
                    <td>${escapeHtml(r.en)}</td>
                    <td>${escapeHtml(r.pronunciation)}</td>
                    <td>${escapeHtml(r.category)}</td>
                </tr>
            `).join("")}
        </tbody>
    `;
    if (parsedRows.length > 50) {
        table.insertAdjacentHTML("beforeend", `
            <tfoot><tr><td colspan="5" style="text-align:center;color:var(--text-3)">
                …他 ${parsedRows.length - 50} 行
            </td></tr></tfoot>
        `);
    }
    section.hidden = false;
}

async function handleConfirm() {
    const validRows = parsedRows.filter(r => !r._skip);
    if (validRows.length === 0) {
        showToast("取り込む行がありません", "error");
        return;
    }

    const useAI = document.getElementById("chk-import-ai").checked;
    if (useAI && !hasGeminiApiKey()) {
        showToast("AI生成にはGemini APIキーが必要です（設定画面で登録）", "error", 4000);
        return;
    }

    const btn = document.getElementById("btn-confirm-import");
    const progressEl = document.getElementById("import-progress");
    btn.disabled = true;
    btn.textContent = "インポート中…";

    let ok = 0;
    let failed = 0;
    let aiFailed = 0;

    for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        progressEl.textContent = `${i + 1} / ${validRows.length} 件を処理中…`;

        let en = row.en;
        let pron = row.pronunciation;

        if (useAI && !en) {
            try {
                en = await generateTranslation(row.ja);
            } catch (err) {
                console.warn("AI英訳失敗:", err);
                aiFailed += 1;
            }
        }
        if (useAI && en && !pron) {
            try {
                pron = await generatePronunciationPoints(en, row.ja);
            } catch (err) {
                console.warn("AI発音失敗:", err);
                aiFailed += 1;
            }
        }

        try {
            await addSokkanExample({
                ja: row.ja,
                en,
                pronunciation: pron,
                category: row.category
            });
            ok += 1;
        } catch (err) {
            console.error("追加失敗:", err);
            failed += 1;
        }
    }

    progressEl.textContent = "";
    btn.disabled = false;
    btn.textContent = "インポートを実行";

    const msg = `✓ ${ok}件追加${failed ? ` / ❌ ${failed}件失敗` : ""}${aiFailed ? ` / AI失敗 ${aiFailed}件` : ""}`;
    showToast(msg, failed ? "error" : "success", 4000);

    if (ok > 0) {
        await refreshSokkanList();
        showScreen("screen-sokkan-list");
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
