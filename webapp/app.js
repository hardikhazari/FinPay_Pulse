document.addEventListener('DOMContentLoaded', () => {
    
    // Shared Chart Colors
    const chartColors = {
        'Champions': '#4ade80',
        'Loyal Customers': '#60a5fa',
        'At-Risk': '#facc15',
        'New Users': '#c084fc',
        'Dormant': '#f87171',
        'Unknown': '#cbd5e1'
    };

    // Setup Navigation & User Data
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userEmailDisplay && logoutBtn) {
        if (sessionStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = 'index.html';
        }
        userEmailDisplay.textContent = sessionStorage.getItem('userEmail');
        
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userEmail');
            window.location.href = 'index.html';
        });
    }

    // Login Page Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        if (sessionStorage.getItem('isLoggedIn') === 'true') {
            window.location.href = 'dashboard.html';
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMessage');

            try {
                const response = await fetch('http://localhost:3050/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (result.success) {
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('userEmail', email);
                    window.location.href = 'dashboard.html';
                } else {
                    errorMsg.textContent = result.message || 'Invalid email or password.';
                }
            } catch (err) {
                errorMsg.textContent = 'Server connection failed.';
                console.error(err);
            }
        });
    }

    // Dashboard Page Logic (Data Table)
    const dataTable = document.getElementById('dataTable');
    if (dataTable) {
        let allData = [];
        let filteredData = [];
        let headers = [];
        let currentPage = 1;
        const rowsPerPage = 50;

        fetch('http://localhost:3050/api/segments')
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    headers = Object.keys(data[0]);
                    renderHeaders();
                    allData = data.map(obj => Object.values(obj));
                    filteredData = [...allData];
                    renderTable();
                }
            })
            .catch(err => {
                document.getElementById('tableBody').innerHTML = `<tr><td colspan="10" style="color: red; text-align: center;">Failed to load data.</td></tr>`;
            });

        function renderHeaders() {
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header.replace(/_/g, ' ').toUpperCase();
                tr.appendChild(th);
            });
            document.querySelector('#dataTable thead').innerHTML = '';
            document.querySelector('#dataTable thead').appendChild(tr);
        }

        function renderTable() {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';
            
            const startIdx = (currentPage - 1) * rowsPerPage;
            const endIdx = Math.min(startIdx + rowsPerPage, filteredData.length);
            
            for (let i = startIdx; i < endIdx; i++) {
                const rowData = filteredData[i];
                const tr = document.createElement('tr');
                
                rowData.forEach((cell, index) => {
                    const td = document.createElement('td');
                    if (headers[index] === 'segment') {
                        const span = document.createElement('span');
                        span.className = 'segment-badge ' + getBadgeClass(cell);
                        span.textContent = cell;
                        td.appendChild(span);
                    } else if (headers[index] === 'customer_id') {
                        const a = document.createElement('a');
                        a.className = 'customer-link';
                        a.textContent = cell;
                        a.onclick = () => openTransactionModal(cell);
                        td.appendChild(a);
                    } else if (typeof cell === 'number' && !Number.isInteger(cell)) {
                        td.textContent = cell.toFixed(2);
                    } else {
                        td.textContent = cell;
                    }
                    tr.appendChild(td);
                });
                
                tbody.appendChild(tr);
            }
            updatePagination();
        }

        // Transaction Modal Logic
        const modal = document.getElementById('transactionModal');
        const closeModal = document.getElementById('closeModal');
        
        if (closeModal) {
            closeModal.onclick = () => { modal.style.display = "none"; };
            window.onclick = (e) => { if (e.target == modal) { modal.style.display = "none"; } };
        }

        function openTransactionModal(customerId) {
            document.getElementById('modalCustomerTitle').textContent = `Transactions for ${customerId}`;
            document.getElementById('txTableBody').innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading transactions...</td></tr>';
            modal.style.display = "block";

            fetch(`http://localhost:3050/api/transactions/${customerId}`)
                .then(res => res.json())
                .then(data => {
                    const txBody = document.getElementById('txTableBody');
                    txBody.innerHTML = '';
                    if (data.length === 0) {
                        txBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No transactions found.</td></tr>';
                        return;
                    }
                    data.forEach(tx => {
                        const tr = document.createElement('tr');
                        const dateObj = new Date(tx.transaction_date);
                        const formattedDate = dateObj.toLocaleDateString();
                        tr.innerHTML = `
                            <td>${formattedDate}</td>
                            <td>${tx.transaction_type}</td>
                            <td>$${Number(tx.amount).toFixed(2)}</td>
                            <td>${tx.payment_method || '-'}</td>
                            <td>${tx.status}</td>
                        `;
                        txBody.appendChild(tr);
                    });
                })
                .catch(err => {
                    document.getElementById('txTableBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Failed to load transactions.</td></tr>';
                });
        }

        function getBadgeClass(segment) {
            if (!segment) return '';
            const seg = String(segment).toLowerCase();
            if (seg.includes('champion')) return 'segment-champions';
            if (seg.includes('loyal')) return 'segment-loyal';
            if (seg.includes('risk')) return 'segment-at-risk';
            if (seg.includes('new')) return 'segment-new';
            if (seg.includes('dormant')) return 'segment-dormant';
            return '';
        }

        function updatePagination() {
            const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
            document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages} (${filteredData.length} records)`;
            document.getElementById('prevBtn').disabled = currentPage === 1;
            document.getElementById('nextBtn').disabled = currentPage === totalPages;
        }

        document.getElementById('prevBtn').addEventListener('click', () => {
            if (currentPage > 1) { currentPage--; renderTable(); }
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
            if (currentPage < totalPages) { currentPage++; renderTable(); }
        });

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                if (!term) {
                    filteredData = [...allData];
                } else {
                    filteredData = allData.filter(row => row.some(cell => String(cell).toLowerCase().includes(term)));
                }
                currentPage = 1;
                renderTable();
            });
        }
    }

    // Analytics Page Logic (Charts)
    const distributionChartCanvas = document.getElementById('distributionChart');
    if (distributionChartCanvas) {
        // Fetch Distribution
        fetch('http://localhost:3050/api/analytics/distribution')
            .then(res => res.json())
            .then(data => {
                const labels = data.map(d => d.segment);
                const values = data.map(d => d.count);
                const bgColors = labels.map(l => chartColors[l] || chartColors['Unknown']);

                new Chart(distributionChartCanvas, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: values,
                            backgroundColor: bgColors,
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            });

        // Fetch Revenue
        const revenueChartCanvas = document.getElementById('revenueChart');
        fetch('http://localhost:3050/api/analytics/revenue')
            .then(res => res.json())
            .then(data => {
                const labels = data.map(d => d.segment);
                const values = data.map(d => d.avg_revenue);
                const bgColors = labels.map(l => chartColors[l] || chartColors['Unknown']);

                new Chart(revenueChartCanvas, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Avg Revenue ($)',
                            data: values,
                            backgroundColor: bgColors,
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            });
    }

    // More Analytics Page Logic
    if (document.getElementById('failureRateChart')) {
        const bgColors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6'];

        // 1. Failure Rate Chart
        fetch('http://localhost:3050/api/analytics/failure-rate')
            .then(res => res.json())
            .then(data => {
                const labels = data.map(d => d.payment_method);
                const values = data.map(d => d.failure_rate);
                new Chart(document.getElementById('failureRateChart'), {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Failure Rate (%)',
                            data: values,
                            backgroundColor: '#f43f5e',
                            borderRadius: 4
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            });

        // 2. Average Spend per Segment
        fetch('http://localhost:3050/api/analytics/avg-spend-segment')
            .then(res => res.json())
            .then(data => {
                const labels = data.map(d => d.segment);
                const values = data.map(d => d.avg_amount);
                const colors = labels.map(l => chartColors[l] || '#cbd5e1');
                new Chart(document.getElementById('avgSpendChart'), {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Average Spend ($)',
                            data: values,
                            backgroundColor: colors,
                            borderRadius: 4
                        }]
                    },
                    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
                });
            });

        // 3. Top Revenue Geographies
        fetch('http://localhost:3050/api/analytics/revenue-geo')
            .then(res => res.json())
            .then(data => {
                const labels = data.map(d => d.city);
                const values = data.map(d => d.total_revenue);
                new Chart(document.getElementById('revenueGeoChart'), {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Total Revenue ($)',
                            data: values,
                            backgroundColor: '#10b981',
                            borderRadius: 4
                        }]
                    },
                    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
                });
            });

        // 4. Payment Method by Segment (Stacked Bar)
        fetch('http://localhost:3050/api/analytics/method-segment')
            .then(res => res.json())
            .then(data => {
                // Transform flat data to grouped data
                const segments = [...new Set(data.map(d => d.segment))];
                const methods = [...new Set(data.map(d => d.payment_method))];
                
                const datasets = methods.map((method, i) => {
                    const methodData = segments.map(seg => {
                        const row = data.find(d => d.segment === seg && d.payment_method === method);
                        return row ? row.tx_count : 0;
                    });
                    return {
                        label: method,
                        data: methodData,
                        backgroundColor: bgColors[i % bgColors.length]
                    };
                });

                new Chart(document.getElementById('methodSegmentChart'), {
                    type: 'bar',
                    data: { labels: segments, datasets: datasets },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: { x: { stacked: true }, y: { stacked: true } }
                    }
                });
            });

        // 5. Transaction Type by Device (Radar)
        fetch('http://localhost:3050/api/analytics/type-device')
            .then(res => res.json())
            .then(data => {
                const types = [...new Set(data.map(d => d.transaction_type))];
                const devices = [...new Set(data.map(d => d.device_used))];
                
                const datasets = devices.map((device, i) => {
                    const devData = types.map(t => {
                        const row = data.find(d => d.device_used === device && d.transaction_type === t);
                        return row ? row.tx_count : 0;
                    });
                    const color = i === 0 ? 'rgba(59, 130, 246, 0.5)' : (i === 1 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)');
                    const border = i === 0 ? '#3b82f6' : (i === 1 ? '#10b981' : '#f43f5e');
                    return {
                        label: device,
                        data: devData,
                        backgroundColor: color,
                        borderColor: border,
                        pointBackgroundColor: border
                    };
                });

                new Chart(document.getElementById('typeDeviceChart'), {
                    type: 'radar',
                    data: { labels: types, datasets: datasets },
                    options: { 
                        responsive: true, 
                        maintainAspectRatio: false,
                        scales: { 
                            r: { 
                                beginAtZero: true, 
                                min: 0,
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.3)',
                                    lineWidth: 1.5
                                },
                                angleLines: {
                                    color: 'rgba(0, 0, 0, 0.3)',
                                    lineWidth: 1.5
                                },
                                pointLabels: {
                                    font: { weight: '600' },
                                    color: '#1a202c'
                                }
                            } 
                        }
                    }
                });
            });

        // 6. Updated Time Chart
        fetch('http://localhost:3050/api/analytics/time')
            .then(res => res.json())
            .then(data => {
                const labels = data.map(d => d.month);
                const values = data.map(d => d.count);
                new Chart(document.getElementById('timeChart'), {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Transactions',
                            data: values,
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.2)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
            });
    }
});
