// Function to format numbers as currency
function formatCurrency(value) {
    return `$${parseFloat(value).toFixed(2)}`;
}

// Function to evaluate arithmetic expressions
function evaluateExpression(expression) {
    try {
        // Use eval to calculate the result of the expression
        return Function(`'use strict'; return (${expression})`)();
    } catch (error) {
        console.error('Invalid expression:', expression);
        return NaN; // Return NaN for invalid expressions
    }
}

// Function to calculate the final amount
function calculateFinalAmount() {
    const basicPayInput = document.getElementById('basicPayInput');
    const cpfDeductInput = document.getElementById('cpfDeductInput');

    // Add null checks for inputs
    if (!basicPayInput || !cpfDeductInput) {
        console.error('Required input elements not found in the DOM.');
        return;
    }

    const basicPay = evaluateExpression(basicPayInput.value.replace(/[^0-9.+\-/*]/g, '')) || 0;
    const cpfDeduct = evaluateExpression(cpfDeductInput.value.replace(/[^0-9.+\-/*]/g, '')) || 0;

    console.log('Basic Pay:', basicPay);
    console.log('CPF Deduction:', cpfDeduct);

    let total = basicPay - cpfDeduct;

    document.querySelectorAll('.allocated-amount-input').forEach(input => {
        if (input.id !== 'basicPayInput' && input.id !== 'cpfDeductInput' && input.id !== 'finalSpendingInput') {
            const value = evaluateExpression(input.value.replace(/[^0-9.+\-/*]/g, '')) || 0;
            console.log('Subtracting allocated amount:', value);
            total -= value;
        }
    });

    // Ensure total is not negative
    total = Math.max(total, 0);

    console.log('Final Total:', total);

    const finalAmountInput = document.getElementById('finalSpendingInput');
    if (finalAmountInput) {
        finalAmountInput.value = formatCurrency(total);
    } else {
        console.error('Final Amount input element not found in the DOM.');
    }
}

// Function to add a new row
function addRow() {
    const tableBody = document.getElementById('payBreakdownBody');
    const finalAmountRow = document.querySelector('#payBreakdownBody tr:last-child');

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td contenteditable="true" style="font-weight: bold;">New Item</td>
        <td><input type="text" class="form-control d-inline-block allocated-amount-input" value="$0.00" style="text-align:center;font-weight:bold;" /></td>
        <td><button class="btn btn-danger btn-sm remove-row-btn">Remove</button></td>
    `;

    tableBody.insertBefore(newRow, finalAmountRow);

    // Add event listener to the new input
    newRow.querySelector('.allocated-amount-input').addEventListener('input', () => {
        calculateFinalAmount();
        saveStateToLocalStorage();
    });

    // Add event listener to the contenteditable cell
    newRow.querySelector('td[contenteditable="true"]').addEventListener('input', saveStateToLocalStorage);

    // Add event listener to the remove button
    newRow.querySelector('.remove-row-btn').addEventListener('click', () => {
        newRow.remove();
        calculateFinalAmount();
        saveStateToLocalStorage();
    });
}

// Function to format input values as currency-like numbers
function formatInputValue(input) {
    let value = parseFloat(input.value.replace(/[^0-9.-]+/g, '')) || 0;
    if (input.value.trim() === '.' || input.value.trim() === '.00') {
        value = 0; // Handle edge case for .00 or .
    }
    input.value = value.toFixed(2); // Ensure two decimal places, e.g., 6.5 -> 6.50
    calculateFinalAmount(); // Recalculate the final amount after formatting
}

// Function to save the current state to localStorage
function saveStateToLocalStorage() {
    const state = {
        basicPay: document.getElementById('basicPayInput').value,
        cpfDeduct: document.getElementById('cpfDeductInput').value,
        rows: []
    };

    document.querySelectorAll('#payBreakdownBody tr').forEach(row => {
        const item = row.cells[0]?.innerText.trim() || ''; // Ensure updated name is saved
        const amount = row.querySelector('.allocated-amount-input')?.value || '';
        const isNew = row.querySelector('.remove-row-btn') !== null; // Check if the row has a remove button
        if (item && amount) {
            state.rows.push({ item, amount, isNew });
        }
    });

    localStorage.setItem('payBreakdownState', JSON.stringify(state));
}

// Function to load the state from localStorage
function loadStateFromLocalStorage() {
    const state = JSON.parse(localStorage.getItem('payBreakdownState'));
    if (!state) return;

    document.getElementById('basicPayInput').value = state.basicPay || '';
    document.getElementById('cpfDeductInput').value = state.cpfDeduct || '';

    const tableBody = document.getElementById('payBreakdownBody');
    tableBody.innerHTML = ''; // Clear existing rows

    state.rows.forEach(row => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td contenteditable="true" style="font-weight: bold;">${row.item}</td>
            <td><input type="text" class="form-control d-inline-block allocated-amount-input" value="${row.amount}" style="text-align:center;font-weight:bold;" /></td>
            ${row.isNew ? '<td><button class="btn btn-danger btn-sm remove-row-btn">Remove</button></td>' : '<td></td>'}
        `;

        tableBody.appendChild(newRow);

        // Add event listeners to the new input
        newRow.querySelector('.allocated-amount-input').addEventListener('input', () => {
            calculateFinalAmount();
            saveStateToLocalStorage();
        });

        // Add event listener to the contenteditable cell
        newRow.querySelector('td[contenteditable="true"]').addEventListener('input', saveStateToLocalStorage);

        // Add event listener to the remove button if it exists
        const removeButton = newRow.querySelector('.remove-row-btn');
        if (removeButton) {
            removeButton.addEventListener('click', () => {
                newRow.remove();
                calculateFinalAmount();
                saveStateToLocalStorage();
            });
        }
    });

    calculateFinalAmount();
}

// Update saveStateToLocalStorage on relevant events
window.addEventListener('DOMContentLoaded', () => {
    loadStateFromLocalStorage();

    document.querySelectorAll('.allocated-amount-input').forEach(input => {
        input.addEventListener('input', () => {
            calculateFinalAmount();
            saveStateToLocalStorage();
        });
        input.addEventListener('blur', () => {
            formatInputValue(input);
            calculateFinalAmount();
            saveStateToLocalStorage();
        });
    });

    document.querySelectorAll('#payBreakdownBody tr td[contenteditable="true"]').forEach(cell => {
        cell.addEventListener('input', saveStateToLocalStorage); // Save state when cell content changes
    });

    document.getElementById('addRowBtn').addEventListener('click', () => {
        addRow();
        saveStateToLocalStorage();
    });

    document.getElementById('basicPayInput').addEventListener('input', () => {
        calculateFinalAmount();
        saveStateToLocalStorage();
    });

    document.getElementById('cpfDeductInput').addEventListener('input', () => {
        calculateFinalAmount();
        saveStateToLocalStorage();
    });
});