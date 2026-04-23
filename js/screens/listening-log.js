// 多聴ログ画面
// - 日付・聞いたもの・時間(分)・印象メモを記録
// - 保存時、その日の日次チェック listening を自動ON
// - 最近30件の履歴を表示

import {
    addListeningLog, listListeningLogs, deleteListeningLog,
    getTodayDateKey
} from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";

let initialized = false;

export function initListeningLogScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-listening-log").addEventListener("click", () => {
        showScreen("screen-home");
    });

    document.getElementById("btn-save-listening-log").addEventListener("click", handleSave);

    initialized = true;
}

export async function openListeningLog() {
    document.getElementById("input-listening-date").value = getTodayDateKey();
    document.getElementById("input-listening-source").value = "";
    document.getElementById("input-listening-minutes").value = "";
    document.getElementById("input-listening-memo").value = "";
    document.getElementById("listening-log-note").textContent = "";

    showScreen("screen-listening-log");
    await refreshList();
}

async function handleSave() {
    const dateKey = document.getElementById("input-listening-date").value;
    const source = document.getElementById("input-listening-source").value.trim();
    const minutes = document.getElementById("input-listening-minutes").value;
    const memo = document.getElementById("input-listening-memo").value.trim();
    const noteEl = document.getElementById("listening-log-note");
    const btn = document.getElementById("btn-save-listening-log");

    if (!dateKey) {
        showToast("日付を入力してください", "error");
        return;
    }
    if (!source && !minutes && !memo) {
        showToast("ソース・時間・メモのいずれかを入力してください", "error");
        return;
    }

    btn.disabled = true;
    btn.textContent = "保存中…";
    try {
        await addListeningLog({ dateKey, source, minutes, memo });
        noteEl.textContent = "✓ 保存しました（日次チェックも自動でON）";
        document.getElementById("input-listening-source").value = "";
        document.getElementById("input-listening-minutes").value = "";
        document.getElementById("input-listening-memo").value = "";
        await refreshList();
    } catch (err) {
        console.error("多聴ログ保存失敗:", err);
        showToast("保存に失敗しました", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "＋ 保存する";
    }
}

async function refreshList() {
    const listEl = document.getElementById("listening-log-list");
    listEl.innerHTML = `<p class="log-empty">読み込み中…</p>`;
    try {
        const rows = await listListeningLogs(30);
        if (rows.length === 0) {
            listEl.innerHTML = `<p class="log-empty">まだ記録がありません</p>`;
            return;
        }
        listEl.innerHTML = rows.map(r => renderRow(r)).join("");
        listEl.querySelectorAll(".log-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                if (!confirm("この記録を削除しますか？")) return;
                try {
                    await deleteListeningLog(id);
                    await refreshList();
                } catch (err) {
                    console.error(err);
                    showToast("削除に失敗しました", "error");
                }
            });
        });
    } catch (err) {
        console.error("一覧読込失敗:", err);
        listEl.innerHTML = `<p class="log-empty">読み込みに失敗しました</p>`;
    }
}

function renderRow(r) {
    const mins = r.minutes ? `${r.minutes}分` : "";
    const src = escapeHtml(r.source || "（ソース未入力）");
    const memo = r.memo ? `<p class="log-memo">${escapeHtml(r.memo)}</p>` : "";
    return `
        <div class="log-row">
            <div class="log-head">
                <span class="log-date">${r.dateKey}</span>
                <span class="log-mins">${mins}</span>
                <button class="log-delete" data-id="${r.id}" title="削除">✕</button>
            </div>
            <div class="log-source">${src}</div>
            ${memo}
        </div>
    `;
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
