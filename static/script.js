document.addEventListener('DOMContentLoaded', () => {
    // --- Tabs Logic ---
    window.switchTab = (tabName) => {
        // Update Buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.toLowerCase().includes(tabName)) {
                btn.classList.add('active');
            }
        });

        // Show/Hide Forms
        if (tabName === 'subjects') {
            document.getElementById('subject-form').classList.remove('hidden-tab');
            document.getElementById('assignment-form').classList.add('hidden-tab');
        } else {
            document.getElementById('subject-form').classList.add('hidden-tab');
            document.getElementById('assignment-form').classList.remove('hidden-tab');
        }
    };

    // --- Chart.js Placeholder ---
    const ctx = document.getElementById('dailyPieChart').getContext('2d');

    // Initial empty chart or Placeholder data
    const myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Study', 'Assignments', 'Free Time'],
            datasets: [{
                data: [0, 0, 100], // Start with all free time visually or empty
                backgroundColor: [
                    '#8b5cf6', // Violet
                    '#ec4899', // Pink
                    '#334155'  // Slate (Empty/Free)
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: {
                            family: 'Outfit'
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });

    // --- Load Subjects for Select Dropdown ---
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
                loadSubjects(); // Refresh list
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
            });
    });

    document.getElementById('generate-btn').addEventListener('click', () => {
        fetch('/api/plan')
            .then(res => res.json())
            .then(data => {
                // Update text list
                const list = document.getElementById('schedule-items');
                list.innerHTML = '';

                if (data.schedule.length === 0) {
                    list.innerHTML = '<li class="empty-state">No urgent tasks! Enjoy your free time.</li>';
                } else {
                    data.schedule.forEach(item => {
                        const li = document.createElement('li');
                        li.style.padding = '0.5rem';
                        li.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                        li.textContent = `${item.hours}h - ${item.note}`;
                        list.appendChild(li);
                    });
                }

                // Update Chart
                const summary = data.summary;
                myChart.data.datasets[0].data = [
                    summary.study_hours,
                    0,
                    summary.free_hours
                ];
                myChart.update();
            });
    });

    // Initial Load
    loadSubjects();
});
