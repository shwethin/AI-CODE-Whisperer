document.addEventListener('DOMContentLoaded', () => {

    // --- Profile / Auth Logic ---
    const modal = document.getElementById('welcome-modal');
    const dashboard = document.getElementById('main-dashboard');
    const profileForm = document.getElementById('profile-form');
    const welcomeMsg = document.getElementById('welcome-message');

    function loadProfile() {
        const name = localStorage.getItem('study_agent_name');
        const age = localStorage.getItem('study_agent_age');

        if (name && age) {
            // Profile exists, show dashboard
            showDashboard(name);
        } else {
            // No profile, show modal
            modal.style.display = 'flex';
            dashboard.classList.add('hidden');
        }
    }

    function showDashboard(name) {
        modal.style.display = 'none';
        dashboard.classList.remove('hidden');
        welcomeMsg.textContent = `Welcome back, ${name}! 👋`;
    }

    // Handle Form Submit
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('user-name').value.trim();
        const ageInput = document.getElementById('user-age').value;

        if (nameInput && ageInput) {
            localStorage.setItem('study_agent_name', nameInput);
            localStorage.setItem('study_agent_age', ageInput);
            showDashboard(nameInput);
        }
    });

    // Valid global function for resetting profile
    window.resetProfile = () => {
        if (confirm("Are you sure you want to reset your profile? Data will be kept, but name/age will be asked again.")) {
            localStorage.removeItem('study_agent_name');
            localStorage.removeItem('study_agent_age');
            location.reload();
        }
    };

    // --- Tabs Logic ---
    window.switchTab = (tabName) => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.toLowerCase().includes(tabName)) {
                btn.classList.add('active');
            }
        });

        if (tabName === 'subjects') {
            document.getElementById('subject-form').classList.remove('hidden-tab');
            document.getElementById('assignment-form').classList.add('hidden-tab');
        } else if (tabName === 'assignments') {
            document.getElementById('subject-form').classList.add('hidden-tab');
            document.getElementById('assignment-form').classList.remove('hidden-tab');
        }
    };

    // --- Load Subjects ---
    function loadSubjects() {
        fetch('/api/subjects')
            .then(res => res.json())
            .then(data => {
                const select = document.getElementById('subject-select');
                select.innerHTML = '<option value="" disabled selected>Select Subject</option>';
                data.forEach(sub => {
                    const option = document.createElement('option');
                    option.value = sub.id;
                    option.textContent = sub.name;
                    select.appendChild(option);
                });
            });
    }

    // --- Form Submissions ---
    document.getElementById('subject-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        fetch('/api/subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(() => {
                alert('Subject Added!');
                e.target.reset();
                loadSubjects();
                refreshCalendarData();
            });
    });

    document.getElementById('assignment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        fetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(() => {
                alert('Assignment Added!');
                e.target.reset();
                refreshCalendarData();
            });
    });

    // --- Generate Plan (Talks to Server -> Ollama) ---
    document.getElementById('generate-btn').addEventListener('click', () => {
        const outputDiv = document.getElementById('ai-plan-output');
        const loadingDiv = document.getElementById('loading-indicator');

        // Check if we have data to plan
        if (cachedAssignments.length === 0) {
            outputDiv.textContent = "Please add some assignments first!";
            return;
        }

        outputDiv.innerHTML = '';
        loadingDiv.style.display = 'block';

        // Get profile data
        const name = localStorage.getItem('study_agent_name') || 'Student';
        const age = localStorage.getItem('study_agent_age') || 'unknown';

        // Append context to URL
        const planUrl = `/api/plan?name=${encodeURIComponent(name)}&age=${encodeURIComponent(age)}`;

        fetch(planUrl)
            .then(res => res.json())
            .then(data => {
                loadingDiv.style.display = 'none';
                if (data.plan) {
                    outputDiv.textContent = data.plan;
                } else {
                    outputDiv.textContent = "Could not generate plan.";
                }
            })
            .catch(err => {
                loadingDiv.style.display = 'none';
                outputDiv.textContent = "Error: " + err;
            });
    });

    // --- Calendar Logic ---
    let currentDate = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Store data locally for calendar rendering
    let cachedSubjects = [];
    let cachedAssignments = [];

    function renderCalendar(targetGridId = 'calendar-grid', dateObj = currentDate, isMini = false) {
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();

        if (!isMini) {
            document.getElementById('current-month-year').textContent = `${monthNames[month]} ${year}`;
        }

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayIndex = firstDay.getDay();

        const grid = document.getElementById(targetGridId);
        grid.innerHTML = '';

        // Headers (Only for main view or if desired in mini)
        if (!isMini) {
            const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            dayHeaders.forEach(d => {
                const el = document.createElement('div');
                el.className = 'calendar-day empty';
                el.style.textAlign = 'center';
                el.style.color = '#94a3b8';
                el.textContent = d;
                grid.appendChild(el);
            });
        }

        for (let i = 0; i < startDayIndex; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-day empty';
            grid.appendChild(el);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-day';

            // Highlight events
            const currentDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            let hasExam = false;
            let hasAssign = false;

            cachedSubjects.forEach(sub => {
                if (sub.exam === currentDayStr) {
                    hasExam = true;
                    if (isMini) {
                        el.classList.add('event-exam');
                        el.title = `Exam: ${sub.name}`;
                    } else {
                        const dot = document.createElement('span');
                        dot.className = 'event-marker event-exam';
                        el.appendChild(dot);
                    }
                }
            });

            cachedAssignments.forEach(ass => {
                if (ass.deadline === currentDayStr) {
                    hasAssign = true;
                    if (isMini) {
                        el.classList.add('event-assign');
                        el.title = `Due: ${ass.title}`;
                    } else {
                        const dot = document.createElement('span');
                        dot.className = 'event-marker event-assign';
                        el.appendChild(dot);
                    }
                }
            });

            if (!isMini) {
                const dayNum = document.createElement('span');
                dayNum.className = 'day-number';
                dayNum.textContent = i;
                el.appendChild(dayNum);

                // Click to view details
                el.onclick = () => showDayDetails(currentDayStr);
            }

            grid.appendChild(el);
        }
    }

    function showDayDetails(dateStr) {
        const panel = document.getElementById('calendar-day-details');
        const title = document.getElementById('selected-date-title');
        const content = document.getElementById('selected-date-content');

        panel.style.display = 'block';
        title.textContent = `Details for ${dateStr}`;
        content.innerHTML = '';

        const exams = cachedSubjects.filter(s => s.exam === dateStr);
        const assigns = cachedAssignments.filter(a => a.deadline === dateStr);

        if (exams.length === 0 && assigns.length === 0) {
            content.innerHTML = '<p class="text-muted">No events for this day.</p>';
            return;
        }

        exams.forEach(e => {
            content.innerHTML += `<div class="detail-item exam">🎓 Exam: ${e.name}</div>`;
        });

        assigns.forEach(a => {
            content.innerHTML += `<div class="detail-item assign">📝 Due: ${a.title}</div>`;
        });
    }

    function renderFullYear() {
        const container = document.getElementById('full-year-view');
        container.innerHTML = '';
        const year = currentDate.getFullYear();

        for (let m = 0; m < 12; m++) {
            const monthDiv = document.createElement('div');
            monthDiv.className = 'mini-month';

            const title = document.createElement('h4');
            title.textContent = monthNames[m];
            monthDiv.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'calendar-grid';
            grid.id = `mini-cal-${m}`;
            grid.style.gridTemplateColumns = "repeat(7, 1fr)";
            monthDiv.appendChild(grid);

            container.appendChild(monthDiv);

            // Render specific month
            const miniDate = new Date(year, m, 1);
            renderCalendar(`mini-cal-${m}`, miniDate, true);
        }
    }

    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Toggle Full Year
    let isFullYear = false;
    document.getElementById('full-year-btn').addEventListener('click', function () {
        isFullYear = !isFullYear;
        const mainGrid = document.getElementById('calendar-grid');
        const fullView = document.getElementById('full-year-view');
        const navBtns = [document.getElementById('prev-month'), document.getElementById('next-month'), document.getElementById('current-month-year')];

        if (isFullYear) {
            this.textContent = "Back to Month";
            mainGrid.style.display = 'none';
            fullView.classList.remove('hidden-tab');
            navBtns.forEach(el => el.style.display = 'none');

            // Fix full year rendering visibility
            fullView.style.display = 'grid';

            renderFullYear();
        } else {
            this.textContent = "Full Year";
            mainGrid.style.display = 'grid';
            fullView.classList.add('hidden-tab');
            fullView.style.display = 'none';

            navBtns.forEach(el => el.style.display = 'block');
            renderCalendar(); // Restore month view
        }
    });

    // --- Render Lists ---
    function renderSubjectsList(subjects) {
        const list = document.getElementById('subjects-list-ul');
        list.innerHTML = '';

        if (subjects.length === 0) {
            list.innerHTML = '<li class="empty-state">No subjects yet</li>';
            return;
        }

        subjects.forEach(sub => {
            const li = document.createElement('li');

            // Priority Tag based on difficulty
            let prioClass = 'priority-low';
            let prioText = 'Low Prio';
            if (sub.diff >= 4) { prioClass = 'priority-high'; prioText = 'High Prio'; }
            else if (sub.diff == 3) { prioClass = 'priority-med'; prioText = 'Med Prio'; }

            li.innerHTML = `
                <div>
                    <strong>${sub.name}</strong>
                    <div class="meta">Exam: ${sub.exam || 'N/A'}</div>
                </div>
                <span class="priority-tag ${prioClass}">${prioText}</span>
            `;
            list.appendChild(li);
        });
    }

    function renderAssignmentsList(assignments) {
        const list = document.getElementById('assignments-list-ul');
        list.innerHTML = '';

        if (assignments.length === 0) {
            list.innerHTML = '<li class="empty-state">No assignments yet</li>';
            return;
        }

        assignments.forEach(ass => {
            const li = document.createElement('li');

            // Priority Tag based on Deadline Proximity
            const today = new Date();
            const due = new Date(ass.deadline);
            const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

            let prioClass = 'priority-low';
            let prioText = 'Upcoming';
            if (diffDays <= 2) { prioClass = 'priority-high'; prioText = 'Urgent'; }
            else if (diffDays <= 7) { prioClass = 'priority-med'; prioText = 'This Week'; }

            li.innerHTML = `
                <div>
                    <strong>${ass.title}</strong>
                    <div class="meta">Due: ${ass.deadline} | ${ass.hours}h</div>
                </div>
                <span class="priority-tag ${prioClass}">${prioText}</span>
            `;
            list.appendChild(li);
        });
    }

    // Update fetch functions to cache data
    function refreshCalendarData() {
        Promise.all([
            fetch('/api/subjects').then(r => r.json()),
            fetch('/api/assignments').then(r => r.json())
        ]).then(([subjects, assignments]) => {
            cachedSubjects = subjects;
            cachedAssignments = assignments;

            // Update Calendar
            renderCalendar();

            // Update Lists
            renderSubjectsList(subjects);
            renderAssignmentsList(assignments);

            // Update Dropdown
            const select = document.getElementById('subject-select');
            // Save current selection if any
            const validSelection = select.value;
            select.innerHTML = '<option value="" disabled selected>Select Subject</option>';
            subjects.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.id;
                option.textContent = sub.name;
                select.appendChild(option);
            });
            if (validSelection) select.value = validSelection;
        });
    }

    // Initial Load
    // Check profile first
    loadProfile();
    refreshCalendarData();
    loadSubjects();
});
