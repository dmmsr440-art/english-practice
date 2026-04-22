// マイルストーン定義（設計記録に基づく）
// 各マイルストーンの目標は累計値。
// アプリ開始日からの累計で進捗を計算する。

export const PLAN_START_DATE = "2026-04-22"; // 計画開始日（Phase 0 デプロイ日）

export const MILESTONES = [
    {
        id: "M1",
        name: "M1 — 耳と口の下地",
        dueDate: "2026-07-31",
        targets: {
            studyDays: 45,
            camblyCount: 24,
            sokkanCount: 100,
            chunkCount: 50
        }
    },
    {
        id: "M2",
        name: "M2 — 会議で戦える最低ライン",
        dueDate: "2026-10-31",
        targets: {
            studyDays: 90,
            camblyCount: 48,
            sokkanCount: 250,
            chunkCount: 150
        }
    },
    {
        id: "M3",
        name: "M3 — 議論に入っていける",
        dueDate: "2027-01-31",
        targets: {
            studyDays: 135,
            camblyCount: 72,
            sokkanCount: 400,
            chunkCount: 250
        }
    },
    {
        id: "M4",
        name: "M4 — Goal達成",
        dueDate: "2027-03-31",
        targets: {
            studyDays: 165,
            camblyCount: 88,
            sokkanCount: 500,
            chunkCount: 320
        }
    }
];

// 今日時点で直近の（未達成の）マイルストーンを返す
export function getCurrentMilestone(today = new Date()) {
    const todayStr = formatDate(today);
    const upcoming = MILESTONES.find(m => m.dueDate >= todayStr);
    return upcoming || MILESTONES[MILESTONES.length - 1];
}

// YYYY-MM-DD 文字列化（ローカル）
export function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// 日数差（ceil）
export function daysBetween(fromStr, toStr) {
    const a = new Date(fromStr + "T00:00:00");
    const b = new Date(toStr + "T00:00:00");
    return Math.round((b - a) / 86400000);
}
