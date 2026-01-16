/* Modal / Breakdown Logic */
document.addEventListener('DOMContentLoaded', function () {
    // Modal logic
    const modal = document.getElementById('addModal');
    const modalContent = document.getElementById('modalContent');
    const closeModalBtn = document.getElementById('closeModalBtn');
    function openModal(html, onSubmit) {
        modalContent.innerHTML = html;
        modal.style.display = 'flex';
        setTimeout(() => {
            const form = modalContent.querySelector('form');
            if (form) {
                form.onsubmit = function (e) {
                    e.preventDefault();
                    onSubmit(new FormData(form));
                    modal.style.display = 'none';
                };
            }
        }, 10);
    }
    closeModalBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = function (event) {
        if (event.target === modal) modal.style.display = 'none';
    };

    // Helper: parse $amount string to float
    function parseAmount(str) {
        if (!str) return 0;
        let n = str.replace(/[^0-9.\-]/g, '');
        return parseFloat(n) || 0;
    }

    // --- Allocated Amount Logic ---
    const allocatedAmountInput = document.getElementById('allocatedAmountInput');
    function getAllocatedAmount() {
        let val = allocatedAmountInput.value || "0";
        val = val.replace(/[^0-9.\-]/g, '');
        return parseFloat(val) || 0;
    }
    function saveAllocatedAmount() {
        localStorage.setItem('commitments_allocated_amount', allocatedAmountInput.value);
    }
    function loadAllocatedAmount() {
        let val = localStorage.getItem('commitments_allocated_amount');
        allocatedAmountInput.value = val !== null ? val : "0.00";
    }
    allocatedAmountInput.addEventListener('input', function () {
        saveAllocatedAmount();
        recalcTotals();
    });


    // --- Table Data Persistence ---
    function getTableData() {
        const tbody = document.querySelector('.commitments-table tbody');
        let data = [];
        let rows = Array.from(tbody.children);
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].classList.contains('category-header-row')) {
                const catName = rows[i].querySelector('.cat-name').value;
                let details = [];
                let j = i + 1;
                while (j < rows.length && rows[j].classList.contains('category-detail-row')) {
                    const tds = rows[j].children;
                    details.push({
                        desc: tds[0].textContent.trim(),
                        amount: tds[1].textContent.trim(),
                        period: tds[2].textContent.trim(),
                        checked: tds[3].querySelector('input[type="checkbox"]').checked
                    });
                    j++;
                }
                data.push({
                    category: catName,
                    details: details
                });
                i = j - 1;
            }
        }
        return data;
    }

    function setTableData(rawData) {
        // Always flatten to a flat array of {category, desc, amount, period, checked}
        let flat = [];
        if (Array.isArray(rawData)) {
            rawData.forEach(group => {
                if (group.category && group.details) {
                    group.details.forEach(detail => {
                        flat.push({
                            category: group.category,
                            desc: detail.desc,
                            amount: detail.amount,
                            period: detail.period,
                            checked: detail.checked
                        });
                    });
                } else if (group.category && group.desc !== undefined) {
                    flat.push({
                        category: group.category,
                        desc: group.desc,
                        amount: group.amount,
                        period: group.period,
                        checked: group.checked
                    });
                } else if (typeof group === "object" && !Array.isArray(group)) {
                    // If group is a grouped object (shouldn't happen, but just in case)
                    Object.entries(group).forEach(([catName, details]) => {
                        details.forEach(detail => {
                            flat.push({
                                category: catName,
                                desc: detail.desc,
                                amount: detail.amount,
                                period: detail.period,
                                checked: detail.checked
                            });
                        });
                    });
                }
            });
        } else if (rawData && typeof rawData === "object") {
            // If rawData is an object (grouped by category)
            Object.entries(rawData).forEach(([catName, details]) => {
                if (Array.isArray(details)) {
                    details.forEach(detail => {
                        flat.push({
                            category: catName,
                            desc: detail.desc,
                            amount: detail.amount,
                            period: detail.period,
                            checked: detail.checked
                        });
                    });
                }
            });
        }

        // Now group by category name
        const grouped = {};
        flat.forEach(entry => {
            if (!grouped[entry.category]) grouped[entry.category] = [];
            grouped[entry.category].push({
                desc: entry.desc,
                amount: entry.amount,
                period: entry.period,
                checked: entry.checked
            });
        });

        const tbody = document.querySelector('.commitments-table tbody');
        tbody.innerHTML = '';
        Object.entries(grouped).forEach(([catName, details]) => {
            // Category name row
            const headerTr = document.createElement('tr');
            headerTr.className = 'category-header-row table-primary';
            headerTr.setAttribute('draggable', 'true');
            headerTr.innerHTML = `
                        <td colspan="5">
                            <input value="${catName}" class="cat-name form-control-plaintext" style="font-weight:bold;" />
                        </td>
                    `;
            tbody.appendChild(headerTr);

            // Details rows
            details.forEach(detail => {
                const detailTr = document.createElement('tr');
                detailTr.className = 'category-detail-row';
                detailTr.innerHTML = `
                            <td contenteditable="true">${detail.desc}</td>
                            <td contenteditable="true">${detail.amount}</td>
                            <td contenteditable="true">${detail.period}</td>
                            <td class="text-center"><input type="checkbox" ${detail.checked ? 'checked' : ''}></td>
                            <td>
                                <button class="delete-btn btn btn-danger btn-sm" title="Delete"><i class="fa-solid fa-trash-xmark"></i></button>
                            </td>
                        `;
                tbody.appendChild(detailTr);
            });
        });
        addRowHandlers();
        recalcTotals();
        addDragAndDropHandlers();
    }

    function saveTableToLocalStorage() {
        const data = getTableData();
        localStorage.setItem('commitments_table_data', JSON.stringify(data));
    }

    function loadTableFromLocalStorage() {
        const data = localStorage.getItem('commitments_table_data');
        if (data) setTableData(JSON.parse(data));
    }

    function recalcTotals() {
        let grandTotal = 0;
        document.querySelectorAll('.commitments-table tbody tr.category-detail-row').forEach(tr => {
            const amt = parseAmount(tr.children[1].textContent);
            grandTotal += amt;
        });
        // Update grand total
        const grandTotalCell = document.getElementById('grandTotalCell');
        if (grandTotalCell) {
            grandTotalCell.textContent = '$' + grandTotal.toFixed(2);
        }
        // Update balance remaining
        const balanceCell = document.getElementById('balanceRemainingCell');
        if (balanceCell) {
            const allocated = getAllocatedAmount();
            const balance = allocated - grandTotal;
            balanceCell.textContent = '$' + balance.toFixed(2);
            if (balance < 0) {
                balanceCell.classList.add('negative-balance');
            } else {
                balanceCell.classList.remove('negative-balance');
            }
        }
    }

    function addRowHandlers() {
        // Editable fields
        document.querySelectorAll('.commitments-table td[contenteditable]').forEach((cell, idx) => {
            cell.onblur = function () {
                // If this is the "Amount" column (2nd column, index 1)
                if (cell.cellIndex === 1) {
                    let val = cell.textContent.replace(/[^0-9.\-]/g, '');
                    let num = parseFloat(val);
                    if (!isNaN(num)) {
                        cell.textContent = '$' + num.toFixed(2);
                    } else {
                        cell.textContent = '';
                    }
                }
                saveTableToLocalStorage();
                recalcTotals();
            };
            cell.onkeydown = function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    cell.blur();
                }
            };
        });
        // Category name input
        document.querySelectorAll('.cat-name').forEach(input => {
            input.onblur = saveTableToLocalStorage;
        });
        // Checkbox
        document.querySelectorAll('.commitments-table input[type="checkbox"]').forEach(cb => {
            cb.onchange = function () {
                const tr = cb.closest('tr');
                if (cb.checked) {
                    showCongratsModal("This commitment is marked as paid.");
                    tr.style.backgroundColor = "#c8e6c9";
                } else {
                    tr.style.backgroundColor = "";
                }
                saveTableToLocalStorage();
            };
            // On load, set color if already checked
            if (cb.checked) {
                cb.closest('tr').style.backgroundColor = "#c8e6c9";
            }
        });
        // Delete
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = function (e) {
                e.stopPropagation();
                const detailTr = btn.closest('tr');
                const headerTr = detailTr.previousElementSibling;
                // If previous row is header and next row is not header, just remove detail row
                // If this is the last detail row for a category, also remove header
                if (
                    headerTr &&
                    headerTr.classList.contains('category-header-row') &&
                    (!detailTr.nextElementSibling ||
                        detailTr.nextElementSibling.classList.contains('category-header-row'))
                ) {
                    headerTr.remove();
                }
                detailTr.remove();
                saveTableToLocalStorage();
                recalcTotals();
            };
        });
    }


    function showCongratsModal(message) {
        modalContent.innerHTML = `
        <div style="text-align:center;">
            <h3>🎉 Congratulations!</h3>
            <p>${message}</p>
            <button id="closeCongratsBtn" class="btn btn-success" style="margin-top:1em;">OK</button>
        </div>
    `;
        modal.style.display = 'flex';
        setTimeout(() => {
            document.getElementById('closeCongratsBtn').onclick = () => {
                modal.style.display = 'none';
            };
        }, 10);
    }

    // --- Drag and Drop Logic ---
    function addDragAndDropHandlers() {
        const headerRows = document.querySelectorAll('.commitments-table tbody tr.category-header-row');
        let dragSrc = null;

        headerRows.forEach(headerRow => {
            headerRow.addEventListener('dragstart', function (e) {
                dragSrc = headerRow;
                headerRow.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            });

            headerRow.addEventListener('dragend', function () {
                dragSrc = null;
                headerRow.style.opacity = '';
            });

            headerRow.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                headerRow.style.borderTop = '2px solid #1976d2';
            });

            headerRow.addEventListener('dragleave', function () {
                headerRow.style.borderTop = '';
            });

            headerRow.addEventListener('drop', function (e) {
                e.preventDefault();
                headerRow.style.borderTop = '';
                if (dragSrc && dragSrc !== headerRow) {
                    const tbody = headerRow.parentNode;
                    // Move header and all its detail rows
                    let srcDetailRows = [];
                    let next = dragSrc.nextElementSibling;
                    while (next && next.classList.contains('category-detail-row')) {
                        srcDetailRows.push(next);
                        next = next.nextElementSibling;
                    }
                    // Insert before target header
                    tbody.insertBefore(dragSrc, headerRow);
                    srcDetailRows.forEach(row => {
                        tbody.insertBefore(row, headerRow);
                    });
                    saveTableToLocalStorage();
                    recalcTotals();
                }
            });
        });
    }



    // --- Initial load ---
    loadAllocatedAmount();
    loadTableFromLocalStorage();
    addRowHandlers();
    addDragAndDropHandlers();
    recalcTotals();


    // Add Category Button
    document.getElementById('addCategoryBtn').onclick = function () {
        openModal(`
            <form>
                <h3 style="margin-bottom:1em;font-weight:bold;">Add Category</h3>
                <label>Category Name:<br><input class="form-control" name="cat" required style="width:100%;"></label><br><br>
                <label>Description:<br><input class="form-control" name="desc" required style="width:100%;"></label><br><br>
                <label>Amount:<br><input class="form-control" name="amount" required value="$0.00" style="width:100%;"></label><br><br>
                <label>Deduction Period:<br><input class="form-control" name="period" required value="every ..." style="width:100%;"></label><br><br>
                <label><input type="checkbox" name="checked"> Checked</label><br><br>
                <button class="btn btn-primary" type="submit">Add</button>
            </form>
        `, function (formData) {
            // Load current data, add new entry, then re-group and render
            let rawData = getTableData();
            // Flatten to array of entries for grouping
            let flat = [];
            rawData.forEach(group => {
                if (group.category && group.details) {
                    // grouped format
                    group.details.forEach(detail => {
                        flat.push({
                            category: group.category,
                            desc: detail.desc,
                            amount: detail.amount,
                            period: detail.period,
                            checked: detail.checked
                        });
                    });
                } else if (group.category && group.desc !== undefined) {
                    // flat format (single entry)
                    flat.push({
                        category: group.category,
                        desc: group.desc,
                        amount: group.amount,
                        period: group.period,
                        checked: group.checked
                    });
                } else if (group.details === undefined) {
                    // grouped object format (from setTableData's grouped object)
                    Object.entries(group).forEach(([catName, details]) => {
                        details.forEach(detail => {
                            flat.push({
                                category: catName,
                                desc: detail.desc,
                                amount: detail.amount,
                                period: detail.period,
                                checked: detail.checked
                            });
                        });
                    });
                }
            });
            // Add new entry
            flat.push({
                category: formData.get('cat'),
                desc: formData.get('desc'),
                amount: formData.get('amount'),
                period: formData.get('period'),
                checked: !!formData.get('checked')
            });
            setTableData(flat);
            saveTableToLocalStorage();
            recalcTotals();
        });
    };

    // Save on direct edits
    document.querySelectorAll('.commitments-table').forEach(table => {
        table.addEventListener('input', function (e) {
            if (e.target.matches('td[contenteditable]')) {
                recalcTotals();
                saveTableToLocalStorage();
            }
        });
    });

    // --- Export/Import Logic ---
    document.getElementById('exportBtn').onclick = function () {
        const data = {
            table: getTableData(),
            allocated: allocatedAmountInput.value
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "commitments-export.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Import button and dropdown item both trigger file input
    document.getElementById('importBtn').onclick = function () {
        document.getElementById('importFileInput').click();
    };

    document.getElementById('importFromFileBtn').onclick = function (e) {
        e.preventDefault();
        document.getElementById('importFileInput').click();
    };

    // Download sample JSON template
    document.getElementById('downloadSampleBtn').onclick = function (e) {
        e.preventDefault();
        const sampleData = {
            table: [
                {
                    category: "Monthly Bills",
                    details: [
                        { desc: "Rent", amount: "1200.00", period: "every 6th", checked: false },
                        { desc: "Utilities", amount: "150.00", period: "every 7th", checked: true }
                    ]
                },
                {
                    category: "Subscriptions",
                    details: [
                        { desc: "Streaming Service", amount: "15.99", period: "every 15th", checked: false },
                        { desc: "Cloud Storage", amount: "9.99", period: "every 19th", checked: false }
                    ]
                }
            ],
            allocated: "2000.00"
        };
        const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "sample-template.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    document.getElementById('importFileInput').onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            try {
                const data = JSON.parse(evt.target.result);
                if (data.table && data.allocated !== undefined) {
                    setTableData(data.table);
                    allocatedAmountInput.value = data.allocated;
                    saveAllocatedAmount();
                    saveTableToLocalStorage();
                    recalcTotals();
                    alert("Data imported!");
                } else {
                    alert("Invalid file format.");
                }
            } catch (err) {
                alert("Failed to import: " + err);
            }
        };
        reader.readAsText(file);
    };
});


function updateCommitmentsBlur() {
    const container = document.querySelector('.commitments-container');
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (scrollLeft > 2) {
        container.classList.add('has-left-blur');
    } else {
        container.classList.remove('has-left-blur');
    }
    if (scrollLeft < maxScroll - 2) {
        container.classList.add('has-right-blur');
    } else {
        container.classList.remove('has-right-blur');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.commitments-container');
    if (container) {
        container.addEventListener('scroll', updateCommitmentsBlur);
        window.addEventListener('resize', updateCommitmentsBlur);
        // Initial check
        setTimeout(updateCommitmentsBlur, 100);
    }
});

// Auto-resize allocated amount input
document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('allocatedAmountInput');
    if (input) {
        function resizeInput() {
            input.style.width = '1px'; // reset to shrink if needed
            input.style.width = (input.value.length + 2) + 'ch';
        }
        input.addEventListener('input', resizeInput);
        resizeInput(); // initial sizing
    }
});


// Only allow closing modal via the X button
document.addEventListener('DOMContentLoaded', function () {
    const modalOverlay = document.querySelector('.modal-overlay');
    const closeBtn = document.querySelector('.modal-box .close-btn'); // Adjust selector as needed

    // Prevent click on overlay from closing modal
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) {
                // Do nothing
                e.stopPropagation();
            }
        });
    }

    // Prevent Escape key from closing modal
    document.addEventListener('keydown', function (e) {
        if (modalOverlay && modalOverlay.style.display !== 'none' && e.key === 'Escape') {
            e.preventDefault();
        }
    });

    // Only close on X button
    if (closeBtn && modalOverlay) {
        closeBtn.addEventListener('click', function () {
            modalOverlay.style.display = 'none';
        });
    }
});