// Why展開トグルコンポーネント
// - デフォルトは折りたたみ（プレビュー非表示）
// - 1日1回、まだ見ていない時はバッジでリマインド
// - 展開時に lastWhyViewedAt を更新

import { markWhyViewed, isWhyViewedToday } from "../lib/storage.js";

let currentWhyText = "";
let whyViewedToday = false;

export function initWhyToggle(profile) {
    currentWhyText = profile.whyStatement || "";
    whyViewedToday = isWhyViewedToday(profile.lastWhyViewedAt);

    const textEl = document.getElementById("why-text");
    const badgeEl = document.getElementById("why-badge");
    const toggleBtn = document.getElementById("btn-toggle-why");

    textEl.textContent = currentWhyText;

    // バッジ表示判定（まだ今日見ていない場合）
    if (!whyViewedToday) {
        badgeEl.hidden = false;
    } else {
        badgeEl.hidden = true;
    }

    toggleBtn.addEventListener("click", toggleWhy);
}

export function isWhyOpen() {
    const content = document.getElementById("why-content");
    return !content.hidden;
}

export function openWhy() {
    const content = document.getElementById("why-content");
    const arrow = document.getElementById("why-arrow");
    const badge = document.getElementById("why-badge");

    content.hidden = false;
    arrow.classList.add("open");
    arrow.textContent = "▲";

    // まだ今日見ていない場合は記録
    if (!whyViewedToday) {
        whyViewedToday = true;
        badge.hidden = true;
        markWhyViewed().catch(err => {
            console.error("Why閲覧記録エラー:", err);
        });
    }
}

export function closeWhy() {
    const content = document.getElementById("why-content");
    const arrow = document.getElementById("why-arrow");
    content.hidden = true;
    arrow.classList.remove("open");
    arrow.textContent = "▼";
}

function toggleWhy() {
    if (isWhyOpen()) {
        closeWhy();
    } else {
        openWhy();
    }
}

export function refreshWhyText(newText) {
    currentWhyText = newText;
    const textEl = document.getElementById("why-text");
    if (textEl) textEl.textContent = newText;
}

export function isWhyViewedTodayFlag() {
    return whyViewedToday;
}
