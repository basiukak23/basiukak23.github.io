// --- Керування прогресом через localStorage ---
function saveProgress(stage, unlocked) {
    localStorage.setItem('sql_detective_stage_' + stage, unlocked);
}

function isStageUnlocked(stage) {
    if (stage === 1) return true; // Перший етап завжди доступний
    return localStorage.getItem('sql_detective_stage_' + stage) === 'true';
}

// Оновлення стану меню при завантаженні будь-якої сторінки
document.addEventListener("DOMContentLoaded", function () {
    const navStage2 = document.getElementById("nav-stage2");
    const navStage3 = document.getElementById("nav-stage3");

    if (navStage2) {
        if (isStageUnlocked(2)) {
            navStage2.disabled = false;
            navStage2.classList.remove("opacity-50", "cursor-not-allowed");
            navStage2.classList.add("text-slate-600", "font-bold", "text-blue-600");
            navStage2.innerHTML = "&#128275; Етап 2: Логіка";
            navStage2.onclick = () => window.location.href = 'stage2.html';
        }
    }

    if (navStage3) {
        if (isStageUnlocked(3)) {
            navStage3.disabled = false;
            navStage3.classList.remove("opacity-50", "cursor-not-allowed");
            navStage3.classList.add("text-slate-600", "font-bold", "text-red-600");
            navStage3.innerHTML = "&#128275; Етап 3: Фінал";
            navStage3.onclick = () => window.location.href = 'stage3.html';
        }
    }
    
    // Активний пункт меню за назвою файлу
    const currentFile = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        const href = link.getAttribute("onclick")?.match(/'([^']+)'/)?.[1] || "";
        if (currentFile.includes(href) && href !== "") {
            link.classList.add("active");
        } else if (currentFile === "index.html" && href === "intro") {
             link.classList.add("active");
        }
    });
});

// --- Логіка Етапу 1 (Вікторина) ---
const stage1Questions = [
    "1. Тип даних VARCHAR(255) використовується для зберігання цілих чисел.",
    "2. Тип даних BOOLEAN може приймати лише значення TRUE, FALSE або NULL.",
    "3. Оператор * у запиті SELECT * означає 'вибрати всі стовпці з таблиці'.",
    "4. Первинний ключ (Primary Key) може містити значення NULL.",
];
const correctAnswers = ["F", "T", "T", "F"];
let userAnswers = [null, null, null, null];

function initStage1() {
    const container = document.getElementById("quiz-container");
    if (!container) return;
    container.innerHTML = "";
    stage1Questions.forEach((q, index) => {
        const row = document.createElement("div");
        row.className = "flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 rounded border border-slate-200 gap-3";
        row.innerHTML = `
            <div class="text-sm text-slate-700 font-medium">${q}</div>
            <div class="flex gap-2 shrink-0">
                <button onclick="answerQ(${index}, 'T', this)" class="quiz-btn q-${index} px-4 py-1 text-sm rounded border border-slate-300 hover:bg-slate-200 font-bold transition-colors">T</button>
                <button onclick="answerQ(${index}, 'F', this)" class="quiz-btn q-${index} px-4 py-1 text-sm rounded border border-slate-300 hover:bg-slate-200 font-bold transition-colors">F</button>
            </div>
        `;
        container.appendChild(row);
    });
}

function answerQ(index, ans, btnElement) {
    userAnswers[index] = ans;
    document.querySelectorAll(`.q-${index}`).forEach((b) => b.classList.remove("selected", "bg-blue-600", "text-white", "border-blue-600"));
    btnElement.classList.add("selected", "bg-blue-600", "text-white", "border-blue-600");
    btnElement.classList.remove("hover:bg-slate-200");
    updatePasswordDisplay();
}

function updatePasswordDisplay() {
    const display = document.getElementById("s1-password");
    if (!display) return;
    let str = "";
    for (let i = 0; i < 4; i++) {
        str += userAnswers[i] ? userAnswers[i] : "_";
    }
    display.textContent = str;
}

function checkStage1() {
    const msg = document.getElementById("s1-message");
    if (!msg) return;
    msg.classList.remove("hidden", "bg-red-100", "text-red-700", "bg-green-100", "text-green-800");

    if (userAnswers.includes(null)) {
        msg.textContent = "Будь ласка, дайте відповідь на всі запитання.";
        msg.classList.add("bg-yellow-100", "text-yellow-800");
        return;
    }

    const isCorrect = userAnswers.every((val, index) => val === correctAnswers[index]);

    if (isCorrect) {
        msg.innerHTML = "Доступ дозволено! Запишіть цей код: <strong>DB_SECURE_99</strong>.<br>Етап 2 розблоковано!";
        msg.classList.add("bg-green-100", "text-green-800");
        saveProgress(2, true);
        // Оновити меню миттєво
        location.reload(); 
    } else {
        msg.textContent = "Доступ заборонено. Перевірте логіку (Пароль невірний).";
        msg.classList.add("bg-red-100", "text-red-700");
    }
}

// --- Логіка Етапу 2 (Matching Game) ---
const matchData = [
    { id: "t1", type: "term", text: "SELECT", matchId: "d1" },
    { id: "t2", type: "term", text: "WHERE", matchId: "d2" },
    { id: "t3", type: "term", text: "JOIN", matchId: "d3" },
    { id: "t4", type: "term", text: "ORDER BY", matchId: "d4" },
    { id: "t5", type: "term", text: "INSERT INTO", matchId: "d5" },
    { id: "d3", type: "def", text: "Об'єднує рядки з таблиць на основі пов'язаного стовпця", matchId: "t3" },
    { id: "d1", type: "def", text: "Вибирає дані з бази даних", matchId: "t1" },
    { id: "d5", type: "def", text: "Додає нові записи в таблицю", matchId: "t5" },
    { id: "d2", type: "def", text: "Фільтрує записи за заданою умовою", matchId: "t2" },
    { id: "d4", type: "def", text: "Сортує результуючий набір", matchId: "t4" },
];

let selectedTerm = null;
let selectedDef = null;
let matchedCount = 0;

function initStage2() {
    const termsContainer = document.getElementById("match-terms");
    const defsContainer = document.getElementById("match-defs");
    if (!termsContainer) return;

    matchData.forEach((item) => {
        const btn = document.createElement("button");
        btn.className = `match-btn p-3 text-sm text-left border border-slate-300 rounded shadow-sm hover:bg-slate-50 font-medium ${item.type === "term" ? "font-mono text-blue-700" : "text-slate-700"}`;
        btn.textContent = item.text;
        btn.onclick = () => handleMatchClick(btn, item);

        if (item.type === "term") termsContainer.appendChild(btn);
        else defsContainer.appendChild(btn);
    });
}

function handleMatchClick(btnElement, itemData) {
    if (btnElement.classList.contains("matched")) return;

    if (itemData.type === "term") {
        if (selectedTerm) selectedTerm.btn.classList.remove("selected");
        selectedTerm = { btn: btnElement, data: itemData };
    } else {
        if (selectedDef) selectedDef.btn.classList.remove("selected");
        selectedDef = { btn: btnElement, data: itemData };
    }

    btnElement.classList.add("selected");

    if (selectedTerm && selectedDef) {
        if (selectedTerm.data.matchId === selectedDef.data.id) {
            selectedTerm.btn.classList.replace("selected", "matched");
            selectedDef.btn.classList.replace("selected", "matched");
            matchedCount++;
            selectedTerm = null;
            selectedDef = null;
            if (matchedCount === 5) {
                document.getElementById("s2-message").classList.remove("hidden");
                saveProgress(3, true);
            }
        } else {
            const tBtn = selectedTerm.btn;
            const dBtn = selectedDef.btn;
            tBtn.classList.remove("selected");
            dBtn.classList.remove("selected");
            tBtn.classList.add("error");
            dBtn.classList.add("error");
            setTimeout(() => {
                tBtn.classList.remove("error");
                dBtn.classList.remove("error");
            }, 400);
            selectedTerm = null;
            selectedDef = null;
        }
    }
}

// --- Логіка Етапу 3 (SQL Термінал) ---
function executeFinalQuery() {
    const input = document.getElementById("sql-input").value.toUpperCase();
    const errorMsg = document.getElementById("final-error");
    const successMsg = document.getElementById("final-success");

    errorMsg.classList.add("hidden");
    successMsg.classList.add("hidden");

    if (!input.trim()) return;

    const hasSelect = input.includes("SELECT ACCOUNT_TO");
    const hasFrom = input.includes("FROM TRANSACTIONS");
    const hasWhere = input.includes("WHERE");
    const hasAmount = input.includes("AMOUNT > 1000000") || input.includes("AMOUNT>1000000") || input.includes("AMOUNT >= 1000000");
    const hasDate = input.includes("2026-05-01");
    const hasStatus = input.includes("SUCCESS");
    const hasAnd = input.includes("AND");

    if (hasSelect && hasFrom && hasWhere && hasAmount && hasDate && hasStatus && hasAnd) {
        successMsg.classList.remove("hidden");
    } else {
        errorMsg.classList.remove("hidden");
    }
}
