// 日次チェックボックスコンポーネント
// - 当日分を表示（最大3日前まで遡って記録可能）
// - タップで即保存
// - 達成率プログレスバーを更新

import { getDailyCheck, toggleDailyCheck, getTodayDateKey, addDaysKey } from "../lib/storage.js";
import { showToast } from "../lib/ui.js";

const CHECK_ITEMS = [
    { field: "shadowing", label: "🎧 シャドーイング" },
    { field: "listening", label: "📻 多聴" },
    { field: "sokkanEisakubun", label: "📝 瞬間英作文" },
    { field: "soloTalk", label: "🎤 独り言" },
    { field: "chunk", label: "🧩 チャンク学習" },
    { field: "cambly", label: "🗣️ Cambly" }
];

const MAX_BACK_DAYS = 3;

let baseDateKey = null;   // 今日の日付キー（固定）
let dayOffset = 0;        // 0=今日, -1=昨日, -2=一昨日, -3=3日前
let currentChecks = null;
let navInitialized = false;

function getViewingDateKey() {
    return addDaysKey(baseDateKey, dayOffset);
}

export async function initDailyCheck() {
    baseDateKey = getTodayDateKey();
    dayOffset = 0;

    if (!navInitialized) {
        document.getElementById("btn-date-prev").addEventListener("click", () => navigateDay(-1));
        document.getElementById("btn-date-next").addEventListener("click", () => navigateDay(+1));
        navInitialized = true;
    }

    await loadAndRender();
}

async function navigateDay(delta) {
    const newOffset = dayOffset + delta;
    if (newOffset > 0 || newOffset < -MAX_BACK_DAYS) return;
    dayOffset = newOffset;
    await loadAndRender();
}

async function loadAndRender() {
    const dateKey = getViewingDateKey();
    currentChecks = await getDailyCheck(dateKey);
    renderTitle();
    renderDateLabel(dateKey);
    renderNavButtons();
    renderCheckList();
    updateProgressBar();
}

function renderTitle() {
    const el = document.getElementById("daily-check-title");
    if (!el) return;
    if (dayOffset === 0) {
        el.textContent = "📅 今日のチェック";
    } else if (dayOffset === -1) {
        el.textContent = "📅 昨日のチェック";
    } else {
        el.textContent = `📅 ${Math.abs(dayOffset)}日前のチェック`;
    }
}

function renderDateLabel(dateKey) {
    const el = document.getElementById("daily-date");
    const d = new Date(dateKey + "T00:00:00");
    const fmt = new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short"
    });
    el.textContent = fmt.format(d);
}

function renderNavButtons() {
    const prevBtn = document.getElementById("btn-date-prev");
    const nextBtn = document.getElementById("btn-date-next");
    prevBtn.disabled = (dayOffset <= -MAX_BACK_DAYS);
    nextBtn.disabled = (dayOffset >= 0);
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

    li.classList.toggle("checked", newValue);
    updateProgressBar();

    const dateKey = getViewingDateKey();
    try {
        await toggleDailyCheck(dateKey, field, newValue);
    } catch (err) {
        console.error("チェック保存エラー:", err);
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

    document.getElementById("progress-fill").style.width = percent + "%";
    document.getElementById("progress-text").textContent = `${count} / ${total}`;
}
