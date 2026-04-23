// シャドーイングログ画面
// - 日付・素材・時間(分)・メモを記録
// - 保存時、その日の日次チェック shadowing を自動ON
// - 最近30件の履歴を表示

import {
    addShadowingLog, listShadowingLogs, deleteShadowingLog,
    getTodayDateKey
} from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";

let initialized = false;

export function initShadowingLogScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-shadowing-log").addEventListener("click", () => {
        showScreen("screen-home");
    });

    document.getElementById("btn-save-shadowing-log").addEventListener("click", handleSave);

    initialized = true;
}

export async function openShadowingLog() {
    document.getElementById("input-shadowing-date").value = getTodayDateKey();
    document.getElementById("input-shadowing-source").value = "";
    document.getElementById("input-shadowing-minutes").value = "";
    document.getElementById("input-shadowing-memo").value = "";
    document.getElementById("shadowing-log-note").textContent = "";

    showScreen("screen-shadowing-log");
    await refreshList();
}

async function handleSave() {
    const dateKey = document.getElementById("input-shadowing-date").value;
    const source = document.getElementById("input-shadowing-source").value.trim();
    const minutes = document.getElementById("input-shadowing-minutes").value;
    const memo = document.getElementById("input-shadowing-memo").value.trim();
    const noteEl = document.getElementById("shadowing-log-note");
    const btn = document.getElementById("btn-save-shadowing-log");

    if (!dateKey) {
        showToast("日付を入力してください", "error");
        return;
    }
    if (!source && !minutes && !memo) {
        showToast("素材・時間・メモのいずれかを入力してください", "error");
        return;
    }

    btn.disabled = true;
    btn.textContent = "保存中…";
    try {
        await addShadowingLog({ dateKey, source, minutes, memo });
        noteEl.textContent = "✓ 保存しました（日次チェックも自動でON）";
        document.getElementById("input-shadowing-source").value = "";
        document.getElementById("input-shadowing-minutes").value = "";
        document.getElementById("input-shadowing-memo").value = "";
        await refreshList();
    } catch (err) {
        console.error("シャドーイングログ保存失敗:", err);
        showToast("保存に失敗しました", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "＋ 保存する";
    }
}

async function refreshList() {
    const listEl = document.getElementById("shadowing-log-list");
    listEl.innerHTML = `<p class="log-empty">読み込み中…</p>`;
    try {
        const rows = await listShadowingLogs(30);
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
                    await deleteShadowingLog(id);
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
    const src = escapeHtml(r.source || "（素材未入力）");
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
