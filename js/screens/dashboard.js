// 進捗ダッシュボード画面
// - 今週のサマリー：学習日数 + メソッド実施率
// - 直近8週の学習日数推移（Chart.js）
// - 累計・マイルストーン進捗

import {
    listDailyChecks, countSokkanExamples, countChunks,
    getTodayDateKey, saveWeeklyNote, getWeeklyNote,
    addDaysKey
} from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { MILESTONES, getCurrentMilestone, PLAN_START_DATE, formatDate, daysBetween } from "../lib/milestones.js";

let initialized = false;
let chartInstance = null;

const METHODS = [
    { key: "shadowing", label: "シャドーイング" },
    { key: "listening", label: "多聴" },
    { key: "sokkanEisakubun", label: "瞬間英作文" },
    { key: "soloTalk", label: "独り言" },
    { key: "chunk", label: "チャンク学習" },
    { key: "cambly", label: "Cambly" }
];

export function initDashboardScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-dashboard").addEventListener("click", () => {
        showScreen("screen-home");
    });

    document.getElementById("btn-save-weekly-note").addEventListener("click", handleSaveNote);

    initialized = true;
}

export async function openDashboard() {
    showScreen("screen-dashboard");
    await loadAll();
}

async function loadAll() {
    const statusEl = document.getElementById("dashboard-status");
    statusEl.textContent = "読み込み中…";
    try {
        const today = getTodayDateKey();
        const weekStart = addDaysKey(today, -6);
        const chartStart = addDaysKey(today, -55); // 直近8週

        const [weekChecks, trendChecks, sokkanTotal, chunkTotal, allChecks] = await Promise.all([
            listDailyChecks(weekStart, today),
            listDailyChecks(chartStart, today),
            countSokkanExamples(),
            countChunks(),
            // 全期間のチェックは累計計算に必要
            listDailyChecks(PLAN_START_DATE, today)
        ]);

        renderWeeklySummary(weekStart, today, weekChecks);
        renderTrendChart(chartStart, today, trendChecks);
        renderMilestone(allChecks, sokkanTotal, chunkTotal);
        renderTotals(allChecks, sokkanTotal, chunkTotal);

        const weekKey = getWeekKey(today);
        const existingNote = await getWeeklyNote(weekKey);
        document.getElementById("input-weekly-note").value = existingNote;

        statusEl.textContent = "";
    } catch (err) {
        console.error("ダッシュボード読込失敗:", err);
        statusEl.textContent = "読み込みに失敗しました";
        showToast("読み込みに失敗しました", "error");
    }
}

function renderWeeklySummary(fromKey, toKey, checks) {
    const rangeEl = document.getElementById("week-range");
    rangeEl.textContent = `${formatJP(fromKey)} 〜 ${formatJP(toKey)}`;

    const byDate = new Map(checks.map(c => [c.dateKey, c]));
    const days = [];
    for (let k = fromKey; k <= toKey; k = addDaysKey(k, 1)) days.push(k);

    const studyDays = days.filter(k => hasAnyCheck(byDate.get(k))).length;
    document.getElementById("week-study-days").textContent = `${studyDays} / 7日`;
    document.getElementById("week-study-days-bar").style.width = `${(studyDays / 7) * 100}%`;

    const methodListEl = document.getElementById("week-method-list");
    methodListEl.innerHTML = METHODS.map(m => {
        const count = days.filter(k => !!byDate.get(k)?.[m.key]).length;
        const pct = Math.round((count / 7) * 100);
        return `
            <div class="method-row">
                <span class="method-label">${m.label}</span>
                <div class="method-bar-wrap">
                    <div class="method-bar" style="width:${pct}%"></div>
                </div>
                <span class="method-count">${count}/7</span>
            </div>
        `;
    }).join("");
}

function renderTrendChart(fromKey, toKey, checks) {
    const canvas = document.getElementById("trend-chart");
    if (!canvas || typeof window.Chart === "undefined") return;

    const byDate = new Map(checks.map(c => [c.dateKey, c]));

    // 週ごとに集約（7日単位）
    const labels = [];
    const values = [];
    for (let weekEnd = toKey; weekEnd > fromKey; weekEnd = addDaysKey(weekEnd, -7)) {
        const weekStart = addDaysKey(weekEnd, -6);
        let count = 0;
        for (let k = weekStart; k <= weekEnd; k = addDaysKey(k, 1)) {
            if (hasAnyCheck(byDate.get(k))) count += 1;
        }
        labels.unshift(`${formatShort(weekStart)}〜`);
        values.unshift(count);
    }

    if (chartInstance) chartInstance.destroy();
    chartInstance = new window.Chart(canvas.getContext("2d"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "学習日数",
                data: values,
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59,130,246,0.15)",
                tension: 0.3,
                fill: true,
                pointBackgroundColor: "#3B82F6",
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 7,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderMilestone(allChecks, sokkanTotal, chunkTotal) {
    const milestone = getCurrentMilestone();
    const today = getTodayDateKey();
    const remaining = daysBetween(today, milestone.dueDate);

    document.getElementById("milestone-name").textContent = milestone.name;
    document.getElementById("milestone-due").textContent = milestone.dueDate;
    document.getElementById("milestone-remaining").textContent =
        remaining > 0 ? `残り ${remaining}日` : (remaining === 0 ? "今日が期日！" : "期日を過ぎています");

    const studyDays = allChecks.filter(c => hasAnyCheck(c)).length;
    const camblyCount = allChecks.filter(c => !!c.cambly).length;

    const items = [
        { label: "学習日数", current: studyDays, target: milestone.targets.studyDays, unit: "日" },
        { label: "Cambly累計", current: camblyCount, target: milestone.targets.camblyCount, unit: "回" },
        { label: "瞬間英作文", current: sokkanTotal, target: milestone.targets.sokkanCount, unit: "件" },
        { label: "チャンク登録", current: chunkTotal, target: milestone.targets.chunkCount, unit: "件" }
    ];

    document.getElementById("milestone-progress-list").innerHTML = items.map(it => {
        const pct = Math.min(100, Math.round((it.current / it.target) * 100));
        const reached = it.current >= it.target;
        return `
            <div class="milestone-row ${reached ? "reached" : ""}">
                <div class="milestone-head">
                    <span class="milestone-label">${it.label}</span>
                    <span class="milestone-num">${it.current} / ${it.target}${it.unit}${reached ? " ✓" : ""}</span>
                </div>
                <div class="milestone-bar-wrap">
                    <div class="milestone-bar" style="width:${pct}%"></div>
                </div>
            </div>
        `;
    }).join("");
}

function renderTotals(allChecks, sokkanTotal, chunkTotal) {
    const studyDays = allChecks.filter(c => hasAnyCheck(c)).length;
    const camblyCount = allChecks.filter(c => !!c.cambly).length;
    document.getElementById("total-study-days").textContent = `${studyDays}日`;
    document.getElementById("total-cambly").textContent = `${camblyCount}回`;
    document.getElementById("total-sokkan").textContent = `${sokkanTotal}件`;
    document.getElementById("total-chunks").textContent = `${chunkTotal}件`;
}

async function handleSaveNote() {
    const text = document.getElementById("input-weekly-note").value.trim();
    const weekKey = getWeekKey(getTodayDateKey());
    const btn = document.getElementById("btn-save-weekly-note");
    btn.disabled = true;
    btn.textContent = "保存中…";
    try {
        await saveWeeklyNote(weekKey, text);
        showToast("今週のメモを保存しました", "success");
    } catch (err) {
        console.error(err);
        showToast("保存に失敗しました", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "メモを保存";
    }
}

// ---- ヘルパー ----

function hasAnyCheck(c) {
    if (!c) return false;
    return METHODS.some(m => !!c[m.key]);
}

// ISO週番号（YYYY-Www）
function getWeekKey(dateKey) {
    const d = new Date(dateKey + "T00:00:00");
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNum = 1 + Math.ceil((firstThursday - target) / 604800000);
    const year = new Date(d.valueOf()).getFullYear();
    return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

function formatJP(dateKey) {
    const [, m, d] = dateKey.split("-");
    return `${Number(m)}/${Number(d)}`;
}

function formatShort(dateKey) {
    const [, m, d] = dateKey.split("-");
    return `${Number(m)}/${Number(d)}`;
}
