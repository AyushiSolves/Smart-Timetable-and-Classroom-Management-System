// Fake users (our database)
let users = [
  { username: "teacher1", password: "123", role: "teacher" },
  { username: "student1", password: "123", role: "student" }
];

// Login function
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username === "teacher1" && password === "123") {
        localStorage.setItem("role", "teacher");
        localStorage.setItem("currentUser", JSON.stringify({username: "Dr. Rahul Sharma", role: "teacher"}));
        window.location.href = "teacher.html";
    }
    else if (username === "student1" && password === "123") {
        localStorage.setItem("role", "student");
        localStorage.setItem("currentUser", JSON.stringify({username: "Amit Kumar", role: "student"}));
        window.location.href = "student.html";
    }
    else {
        alert("Invalid login!");
    }
}

// Logout function
function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  window.location.href = "index.html";
}


function showSection(sectionId) {
    let sections = document.getElementsByClassName("section");
    for (let i = 0; i < sections.length; i++) {
        sections[i].classList.add("hidden");
    }
    document.getElementById(sectionId).classList.remove("hidden");

    // Update sidebar active class
    let navItems = document.querySelectorAll('.sidebar-menu li');
    navItems.forEach(item => item.classList.remove('active'));
    
    let navId = 'nav-' + sectionId;
    if(document.body.classList.contains('student-panel')) {
        let sid = sectionId.replace('student', '').toLowerCase();
        if(sid === 'dashboard') navId = 'nav-s-dashboard';
        if(sid === 'timetable') navId = 'nav-s-timetable';
        if(sid === 'notices') navId = 'nav-s-notices';
        if(sid === 'profile') navId = 'nav-s-profile';
    }

    if(document.getElementById(navId)) {
        document.getElementById(navId).classList.add('active');
    }
}

function addTimetable() {
    let day = document.getElementById("day").value;
    let time = document.getElementById("time").value;
    let subject = document.getElementById("subject").value;
    let room = document.getElementById("room").value;

    if(!time || !subject || !room) {
        alert("Please fill all fields!");
        return;
    }

    let user = JSON.parse(localStorage.getItem("currentUser"));
    let facultyName = user ? user.username : "Unknown Faculty";
    let entry = { day: day, time: time, subject: subject, room: room, faculty: facultyName, type: "core" };
    let data = localStorage.getItem("timetable");
    let timetable = data ? JSON.parse(data) : [];

    timetable.push(entry);
    localStorage.setItem("timetable", JSON.stringify(timetable));

    displayTimetable();

    document.getElementById("day").value = "Monday";
    document.getElementById("time").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("room").value = "";

    loadDashboard();
}

function displayTimetable() {
    let myTable = document.getElementById("myTable");
    let fullTable = document.getElementById("fullTable");

    if(!myTable || !fullTable) return;

    myTable.innerHTML = `<tr><th>Day</th><th>Time</th><th>Subject</th><th>Room</th><th>Action</th></tr>`;
    fullTable.innerHTML = `<tr><th>Day</th><th>Time</th><th>Subject</th><th>Faculty</th><th>Room</th></tr>`;

    let data = localStorage.getItem("timetable");
    if (!data) return;

    let timetable = JSON.parse(data);

    for (let i = 0; i < timetable.length; i++) {
        let type = timetable[i].type || "core";
        let faculty = timetable[i].faculty || "Unknown";

        let row1 = myTable.insertRow();
        row1.insertCell(0).innerHTML = timetable[i].day;
        row1.insertCell(1).innerHTML = timetable[i].time;
        row1.insertCell(2).innerHTML = timetable[i].subject;
        row1.insertCell(3).innerHTML = timetable[i].room;
        row1.insertCell(4).innerHTML = `<button class="btn btn-sm btn-danger-outline" onclick="deleteEntry(${i})"><i class='bx bx-trash'></i> Delete</button>`;

        if (type === "core") {
            let row2 = fullTable.insertRow();
            row2.insertCell(0).innerHTML = timetable[i].day;
            row2.insertCell(1).innerHTML = timetable[i].time;
            row2.insertCell(2).innerHTML = timetable[i].subject;
            row2.insertCell(3).innerHTML = `<span style="color:var(--primary); font-weight:500;">${faculty}</span>`;
            row2.insertCell(4).innerHTML = timetable[i].room;
        }
    }
}

function deleteEntry(index) {
    let data = localStorage.getItem("timetable");
    let timetable = JSON.parse(data);
    timetable.splice(index, 1);
    localStorage.setItem("timetable", JSON.stringify(timetable));
    displayTimetable();
    loadDashboard();
}

function checkClassroom() {
    let day = document.getElementById("c_day").value;
    let time = document.getElementById("c_time").value;
    let room = document.getElementById("c_room").value;

    if(!time || !room){
        alert("Please enter time and room.");
        return;
    }

    let data = localStorage.getItem("timetable");
    let conflict = false;

    if (data) {
        let timetable = JSON.parse(data);
        for (let i = 0; i < timetable.length; i++) {
            if (timetable[i].day === day && timetable[i].time === time && timetable[i].room === room) {
                conflict = true;
            }
        }
    }

    let statusEl = document.getElementById("status");
    if (conflict) {
        statusEl.innerHTML = "<span style='color:var(--danger-text)'><i class='bx bxs-error-circle'></i> Conflict Detected! Room already booked.</span>";
        document.getElementById("bookBtn").classList.add("hidden");
        document.getElementById("requestBtn").classList.remove("hidden");
    } else {
        statusEl.innerHTML = "<span style='color:var(--success-text)'><i class='bx bxs-check-circle'></i> Room is Available!</span>";
        document.getElementById("bookBtn").classList.remove("hidden");
        document.getElementById("requestBtn").classList.add("hidden");
    }
}

function bookClass() {
    let day = document.getElementById("c_day").value;
    let time = document.getElementById("c_time").value;
    let room = document.getElementById("c_room").value;

    let user = JSON.parse(localStorage.getItem("currentUser"));
    let facultyName = user ? user.username : "Unknown Faculty";
    let entry = { day: day, time: time, subject: "Booked Session", room: room, faculty: facultyName, type: "temp" };
    let data = localStorage.getItem("timetable");
    let timetable = data ? JSON.parse(data) : [];

    timetable.push(entry);
    localStorage.setItem("timetable", JSON.stringify(timetable));

    alert("Classroom booked successfully!");
    showSection('timetable');
    displayTimetable();
    loadDashboard();
}

function sendRequest() {
    let day = document.getElementById("c_day").value;
    let time = document.getElementById("c_time").value;
    let room = document.getElementById("c_room").value;

    let request = { day: day, time: time, room: room, status: "Pending" };
    let data = localStorage.getItem("requests");
    let requests = data ? JSON.parse(data) : [];

    requests.push(request);
    localStorage.setItem("requests", JSON.stringify(requests));

    alert("Contextual Request sent successfully!");
    loadDashboard();
}

function displayRequests() {
    let table = document.getElementById("requestTable");
    if(!table) return;

    table.innerHTML = `<tr><th>Day</th><th>Time</th><th>Room</th><th>Status</th><th>Action</th></tr>`;
    let data = localStorage.getItem("requests");
    if (!data) return;

    let requests = JSON.parse(data);
    for (let i = 0; i < requests.length; i++) {
        let row = table.insertRow();
        row.insertCell(0).innerHTML = requests[i].day;
        row.insertCell(1).innerHTML = requests[i].time;
        row.insertCell(2).innerHTML = requests[i].room;
        
        let badgeClass = requests[i].status === 'Pending' ? 'pending' : (requests[i].status === 'Approved' ? 'approved' : 'rejected');
        row.insertCell(3).innerHTML = `<span class="badge ${badgeClass}">${requests[i].status}</span>`;

        if (requests[i].status === "Pending") {
            row.insertCell(4).innerHTML = `
                <button class="btn btn-sm btn-success-outline" onclick="approveRequest(${i})"><i class='bx bx-check'></i></button>
                <button class="btn btn-sm btn-danger-outline" onclick="rejectRequest(${i})"><i class='bx bx-x'></i></button>
            `;
        } else {
            row.insertCell(4).innerHTML = "<span style='color:var(--text-muted); font-size:0.8rem;'>Done</span>";
        }
    }
}

function approveRequest(index) {
    let data = localStorage.getItem("requests");
    let requests = JSON.parse(data);
    requests[index].status = "Approved";
    localStorage.setItem("requests", JSON.stringify(requests));
    displayRequests();
    loadDashboard(); 
}

function rejectRequest(index) {
    let data = localStorage.getItem("requests");
    let requests = JSON.parse(data);
    requests[index].status = "Rejected";
    localStorage.setItem("requests", JSON.stringify(requests));
    displayRequests();
    loadDashboard(); 
}

function addNotice() {
    let title = document.getElementById("noticeTitle").value;
    let desc = document.getElementById("noticeDesc").value;

    if(!title || !desc) return;

    let notice = { title: title, desc: desc, date: new Date().toLocaleDateString('en-GB') };
    let data = localStorage.getItem("notices");
    let notices = data ? JSON.parse(data) : [];

    notices.push(notice);
    localStorage.setItem("notices", JSON.stringify(notices));

    document.getElementById("noticeTitle").value = "";
    document.getElementById("noticeDesc").value = "";

    displayNotices();
    loadDashboard(); // Refresh counts
}

function displayNotices() {
    let container = document.getElementById("noticeTable");
    if(!container) return;
    
    container.innerHTML = "";
    let data = localStorage.getItem("notices");
    if (!data) return;

    let notices = JSON.parse(data);
    for (let i = 0; i < notices.length; i++) {
        let div = document.createElement("div");
        div.className = "list-item align-start";
        div.innerHTML = `
            <div class="list-icon blue"><i class='bx bx-info-circle'></i></div>
            <div class="list-content">
                <p>${notices[i].title}</p>
                <small>${notices[i].desc} <br> <i class='bx bx-calendar'></i> ${notices[i].date || 'Just now'}</small>
            </div>
            <div class="list-actions">
                <button class="btn btn-sm btn-outline" onclick="deleteNotice(${i})"><i class='bx bx-trash'></i> Delete</button>
            </div>
        `;
        container.appendChild(div);
    }
}

function deleteNotice(index) {
    let data = localStorage.getItem("notices");
    let notices = JSON.parse(data);
    notices.splice(index, 1);
    localStorage.setItem("notices", JSON.stringify(notices));
    displayNotices();
    loadDashboard();
}

function openNotices() {
    showSection('notices');
    displayNotices();
}

function loadProfile() {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    if(!user) return;

    let un = document.getElementById("p_username");
    let un2 = document.getElementById("p_username2");
    let topName = document.getElementById("top_name");

    if(un) un.innerHTML = user.username;
    if(un2) un2.innerHTML = user.username;
    if(topName) topName.innerHTML = user.username;

    let timetable = JSON.parse(localStorage.getItem("timetable")) || [];
    let requests = JSON.parse(localStorage.getItem("requests")) || [];
    let notices = JSON.parse(localStorage.getItem("notices")) || [];

    if(document.getElementById("statClasses")) document.getElementById("statClasses").innerHTML = timetable.length;
    if(document.getElementById("statRooms")) document.getElementById("statRooms").innerHTML = timetable.length;
    if(document.getElementById("statRequests")) document.getElementById("statRequests").innerHTML = requests.length;
    if(document.getElementById("statNotices")) document.getElementById("statNotices").innerHTML = notices.length;
}

function openProfile() {
    showSection('profile');
    loadProfile();
}

function loadDashboard() {
    let timetable = JSON.parse(localStorage.getItem("timetable")) || [];
    let today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    let todayData = timetable.filter(t => t.day === today);

    let requests = JSON.parse(localStorage.getItem("requests")) || [];
    let notices = JSON.parse(localStorage.getItem("notices")) || [];

    if(document.getElementById("todayClasses")) document.getElementById("todayClasses").innerHTML = todayData.length;
    
    let pending = requests.filter(r => r.status === "Pending");
    if(document.getElementById("pendingRequests")) document.getElementById("pendingRequests").innerHTML = pending.length;
    
    if(document.getElementById("totalNotices")) document.getElementById("totalNotices").innerHTML = notices.length;
    if(document.getElementById("top-notif-count")) document.getElementById("top-notif-count").innerHTML = notices.length + pending.length;

    let table = document.getElementById("todayTable");
    if(table) {
        table.innerHTML = `<tr><th>Time</th><th>Subject</th><th>Room</th><th>Status</th></tr>`;
        for (let i = 0; i < todayData.length; i++) {
            let row = table.insertRow();
            row.insertCell(0).innerHTML = todayData[i].time;
            row.insertCell(1).innerHTML = todayData[i].subject;
            row.insertCell(2).innerHTML = todayData[i].room;
            let status = (i === 0) ? "Completed" : (i === 1 ? "Current" : "Upcoming");
            let badgeCls = status.toLowerCase();
            row.insertCell(3).innerHTML = `<span class="badge ${badgeCls}">${status}</span>`;
        }
    }

    let topReqs = document.querySelector(".request-list");
    if(topReqs && requests.length > 0) {
        topReqs.innerHTML = "";
        let count = 0;
        for(let i=requests.length-1; i>=0 && count<3; i--){
            if(requests[i].status !== 'Pending') continue;
            count++;
            let div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                 <div class="list-icon purple"><i class='bx bx-user'></i></div>
                 <div class="list-content">
                    <p>Request for Room ${requests[i].room}</p>
                    <small>${requests[i].day} | ${requests[i].time}</small>
                 </div>
            `;
            topReqs.appendChild(div);
        }
    }

    let rcNotice = document.getElementById("recentNotices");
    if(rcNotice && notices.length > 0) {
        rcNotice.innerHTML = "";
        let limit = Math.min(3, notices.length);
        for(let i=notices.length-1; i>=notices.length-limit; i--) {
            let div = document.createElement("div");
            div.className = "list-item";
            div.innerHTML = `
                <div class="list-icon orange"><i class='bx bxs-bell'></i></div>
                <div class="list-content">
                    <p>${notices[i].title}</p>
                    <small>${notices[i].date || 'Recent'}</small>
                </div>
            `;
            rcNotice.appendChild(div);
        }
    }
}

function openDashboard() {
    showSection('dashboard');
    loadDashboard();
}

function toggleEdit() {
    let form = document.getElementById("editForm");
    if (form.classList.contains("hidden")) {
        form.classList.remove("hidden");
    } else {
        form.classList.add("hidden");
    }
}

function saveProfile() {
    let name = document.getElementById("editName").value;
    let user = JSON.parse(localStorage.getItem("currentUser"));
    if (name !== "" && user) {
        user.username = name;
        localStorage.setItem("currentUser", JSON.stringify(user));
        loadProfile(); // refresh UI
    }
    toggleEdit();
}

function changePassword() {
    let newPass = prompt("Enter new password:");
    if (newPass) {
        alert("Password changed successfully!");
    }
}

// ============ STUDENT LOGIC ============
function openStudentDashboard() {
    showSection("studentDashboard");
    loadStudentDashboard();
}

function openStudentTimetable() {
    showSection("studentTimetable");
    loadStudentTimetable();
}

function openStudentNotices() {
    showSection("studentNotices");
    loadStudentNotices();
}

function openStudentProfile() {
    showSection("studentProfile");
    
    let user = JSON.parse(localStorage.getItem("currentUser"));
    if(user && document.getElementById('s_name')) {
        document.getElementById('s_name').innerText = user.username;
    }
}

function loadStudentDashboard() {
    let timetable = JSON.parse(localStorage.getItem("timetable")) || [];
    let notices = JSON.parse(localStorage.getItem("notices")) || [];
    let today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    let todayData = timetable.filter(t => (t.day || "").toLowerCase() === today.toLowerCase());

    if(document.getElementById("s_todayClasses")) document.getElementById("s_todayClasses").innerText = todayData.length;
    // Derive subjects count
    let subjects = new Set();
    timetable.forEach(t => subjects.add(t.subject));
    if(document.getElementById("s_subjects")) document.getElementById("s_subjects").innerText = subjects.size;
    if(document.getElementById("s_notices")) document.getElementById("s_notices").innerText = notices.length;

    let user = JSON.parse(localStorage.getItem("currentUser"));
    if(user && document.getElementById('top_s_name')) document.getElementById('top_s_name').innerText = user.username;

    let table = document.getElementById("s_todayTable");
    if(table) {
        table.innerHTML = `<tr><th>Time</th><th>Subject</th><th>Faculty</th><th>Room</th></tr>`;
        if (todayData.length === 0) {
            table.innerHTML += `<tr><td colspan="4" style="text-align:center;">No classes today 🎉</td></tr>`;
        } else {
            todayData.forEach(item => {
                let row = table.insertRow();
                let faculty = item.faculty || "Unknown";
                row.insertCell(0).innerText = item.time;
                row.insertCell(1).innerText = item.subject;
                row.insertCell(2).innerText = faculty;
                row.insertCell(3).innerText = item.room;
            });
        }
    }
}

function loadStudentTimetable() {
    let timetable = JSON.parse(localStorage.getItem("timetable")) || [];
    let table = document.getElementById("s_fullTable");
    if(table) {
        table.innerHTML = `<tr><th>Day</th><th>Time</th><th>Subject</th><th>Faculty</th><th>Room</th></tr>`;
        
        let coreTimetable = timetable.filter(t => (t.type || "core") === "core");
        
        if (coreTimetable.length === 0) {
            table.innerHTML += `<tr><td colspan="5" style="text-align:center;">No timetable published yet.</td></tr>`;
        } else {
            coreTimetable.forEach(item => {
                let row = table.insertRow();
                let faculty = item.faculty || "Unknown";
                row.insertCell(0).innerText = item.day;
                row.insertCell(1).innerText = item.time;
                row.insertCell(2).innerText = item.subject;
                row.insertCell(3).innerText = faculty;
                row.insertCell(4).innerText = item.room;
            });
        }
    }
}

function loadStudentNotices() {
    let container = document.getElementById("s_noticeList");
    if(!container) return;
    
    container.innerHTML = "";
    let data = localStorage.getItem("notices");
    if (!data) return;

    let notices = JSON.parse(data);
    for (let i = 0; i < notices.length; i++) {
        let div = document.createElement("div");
        div.className = "list-item align-start";
        div.style.background = "#f8fafc";
        div.style.padding = "1rem";
        div.style.borderRadius = "8px";
        div.innerHTML = `
            <div class="list-icon ${i%2==0 ? 'purple' : 'orange'}"><i class='bx bxs-megaphone'></i></div>
            <div class="list-content">
                <p>${notices[i].title} <span class="badge completed" style="margin-left: 0.5rem;">New</span></p>
                <small>${notices[i].desc} | ${notices[i].date || 'Recent'}</small>
            </div>
        `;
        container.appendChild(div);
    }
}

window.onload = function () {
    let role = localStorage.getItem("role");

    // Attempt to hydrate basic UI first before redirection logic
    if (document.body.classList.contains("teacher-panel")) {
        loadProfile();
        loadDashboard();
    }

    if (document.body.classList.contains("login-page")) {
        if (role === "teacher") { window.location.href = "teacher.html"; return; } 
        else if (role === "student") { window.location.href = "student.html"; return; }
        return; 
    }

    if (!role) {
        window.location.href = "index.html";
        return;
    }

    if (document.body.classList.contains("student-panel")) {
        if (role !== "student") {
            alert("Access denied!");
            window.location.href = "index.html";
            return;
        }
        openStudentDashboard(); 
    }

    if (document.body.classList.contains("teacher-panel")) {
        if (role !== "teacher") {
            alert("Access denied!");
            window.location.href = "index.html";
            return;
        }
    }
};
