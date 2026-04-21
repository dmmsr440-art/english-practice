// UI共通ユーティリティ
// - 画面切替
// - トースト表示
// - モーダル表示

export function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const el = document.getElementById(screenId);
    if (el) {
        el.classList.add("active");
        window.scrollTo(0, 0);
    }
}

let toastTimer = null;

export function showToast(message, type = "default", duration = 2500) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = "toast";
    if (type === "error") toast.classList.add("toast-error");
    if (type === "success") toast.classList.add("toast-success");
    toast.hidden = false;

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.hidden = true;
    }, duration);
}

export function showModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.hidden = false;
}

export function hideModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.hidden = true;
}
