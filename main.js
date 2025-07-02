document.getElementById('examForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const subject = document.getElementById('subject').value;
    const level = document.getElementById('level').value;
    const amount = document.getElementById('amount').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "กำลังสร้างข้อสอบ กรุณารอสักครู่...";

    // ใช้ Gemini 2.0 Flash API และ API Key ที่ให้มา
    const API_KEY = "AIzaSyAccW1TSXJ3Iw4cY3ugIkibnWN4rb8m9V0";
    const prompt = `สร้างข้อสอบวิชา${subject} สำหรับระดับ${level} จำนวน ${amount} ข้อ พร้อมตัวเลือกและเฉลย`;

    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            const examText = data.candidates[0].content.parts[0].text;
            resultDiv.innerHTML = `<pre>${examText}</pre>`;

            // --- เพิ่มบันทึกข้อมูลข้อสอบลง localStorage พร้อมชื่อผู้ใช้ ---
            const examHistory = JSON.parse(localStorage.getItem('examHistory') || '[]');
            examHistory.push({
                username: localStorage.getItem('currentUser') || '',
                subject,
                level,
                amount,
                exam: examText,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('examHistory', JSON.stringify(examHistory));
            // --- จบส่วนเพิ่ม ---
        } else {
            resultDiv.innerHTML = "ไม่สามารถสร้างข้อสอบได้ กรุณาลองใหม่";
        }
    } catch (err) {
        resultDiv.innerHTML = "เกิดข้อผิดพลาด: " + err.message;
    }
});

// ====== Simple "database" functions using localStorage ======

// เพิ่มผู้ใช้ใหม่
function addUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
}

// ตรวจสอบผู้ใช้ (login)
function checkUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.some(u => u.username === username && u.password === password);
}

// ดึงข้อมูลผู้ใช้ทั้งหมด
function getAllUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// เพิ่มประวัติข้อสอบ
function addExamHistory(entry) {
    const examHistory = JSON.parse(localStorage.getItem('examHistory') || '[]');
    examHistory.push(entry);
    localStorage.setItem('examHistory', JSON.stringify(examHistory));
}

// ดึงประวัติข้อสอบทั้งหมด
function getExamHistory() {
    return JSON.parse(localStorage.getItem('examHistory') || '[]');
}

// ดึงประวัติข้อสอบของผู้ใช้คนเดียว
function getExamHistoryByUser(username) {
    return getExamHistory().filter(e => e.username === username);
}

// ====== End database functions ======