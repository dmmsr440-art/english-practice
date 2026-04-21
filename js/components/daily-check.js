// 日次チェックボックスコンポーネント
// - 当日分を表示
// - タップで即保存
// - 達成率プログレスバーを更新

import { getDailyCheck, toggleDailyCheck, getTodayDateKey } from "../lib/storage.js";
import { showToast } from "../lib/ui.js";

const CHECK_ITEMS = [
    { field: "shadowing", label: "🎧 シャドーイング" },
    { field: "listening", label: "📻 多聴" },
    { field: "sokkanEisakubun", label: "📝 瞬間英作文" },
    { field: "soloTalk", label: "🎤 独り言" },
    { field: "chunk", label: "🧩 チャンク学習" },
    { field: "cambly", label: "🗣️ Cambly" }
];

let todayKey = null;
let currentChecks = null;

export async function initDailyCheck() {
    todayKey = getTodayDateKey();
    currentChecks = await getDailyCheck(todayKey);

    renderDateLabel();
    renderCheckList();
    updateProgressBar();
}

function renderDateLabel() {
    const el = document.getElementById("daily-date");
    const d = new Date();
    const fmt = new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
        timeZone: "America/Chicago"
    });
    el.textContent = fmt.format(d);
}

function renderCheckList() {
    const listEl = document.getElementById("check-list");
    listEl.innerHTML = "";

    CHECK_ITEMS.forEach(item => {
        const li = document.createElement("li");
        li.className = "check-item" + (currentChecks[item.field] ? " checked" : "");
        li.dataset.field = item.field;
        li.innerHTML = `
            <div class="check-box" aria-hidden="true"></div>
            <span class="check-label">${item.label}</span>
        `;
        li.addEventListener("click", () => handleToggle(item.field, li));
        listEl.appendChild(li);
    });
}

async function handleToggle(field, li) {
    const newValue = !currentChecks[field];
    currentChecks[field] = newValue;

    // UI即時更新（楽観的更新）
    li.classList.toggle("checked", newValue);
    updateProgressBar();

    try {
        await toggleDailyCheck(todayKey, field, newValue);
    } catch (err) {
        console.error("チェック保存エラー:", err);
        // ロールバック
        currentChecks[field] = !newValue;
        li.classList.toggle("checked", !newValue);
        updateProgressBar();
        showToast("保存に失敗しました。再度お試しください", "error");
    }
}

function updateProgressBar() {
    const count = CHECK_ITEMS.reduce((sum, item) =>
        sum + (currentChecks[item.field] ? 1 : 0), 0);
    const total = CHECK_ITEMS.length;
    const percent = (count / total) * 100;

    const fillEl = document.getElementById("progress-fill");
    const textEl = document.getElementById("progress-text");

    fillEl.style.width = percent + "%";
    textEl.textContent = `${count} / ${total}`;
}
