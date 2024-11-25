document.getElementById('search_btn').addEventListener('click', (event) => {
    const dateDropdown = document.getElementById('dateDropdown');

    if (dateDropdown.style.display = "flex") {
    

        // Populate year options dynamically
        const yearSelects = [document.getElementById('startYearSelect'), document.getElementById('endYearSelect')];
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 50;
        const endYear = currentYear + 10;

        yearSelects.forEach(yearSelect => {
            yearSelect.innerHTML = ''; // Clear existing options to avoid duplicates
            for (let year = startYear; year <= endYear; year++) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            }
        });
    } else {
        dateDropdown.style.display = 'none';
    }
    event.stopPropagation();
    window.addEventListener("click", (event) => {
        const dateDropdown = document.getElementById('dateDropdown');
        if (event.target === dateDropdown) {
            dateDropdown.style.display = 'none'; // Hide the dropdown
        }
    }); // Prevent click event from propagating further
});

// Closing the dropdown
document.addEventListener('click', (event) => {
    const dateDropdown = document.getElementById('dateDropdown');
    if (!dateDropdown.contains(event.target) && event.target.id !== 'search_btn') {
        dateDropdown.style.display = 'none'; // Hide the dropdown
    }
});

// Get date range data
function getDateRangeData() {
    const startMonth = document.getElementById('startMonthSelect').value;
    const startYear = document.getElementById('startYearSelect').value;
    const endMonth = document.getElementById('endMonthSelect').value;
    const endYear = document.getElementById('endYearSelect').value;

    if (!startMonth || !startYear) {
        alert('Please select both start month and year.');
        return null;
    }

    let startDate = `${startYear}-${startMonth}`;
    let endDate = endMonth && endYear ? `${endYear}-${endMonth}` : startDate;

    return { startDate, endDate };
}

// Modal and table logic
const modal = document.getElementById('tableModal');
const closeModalBtn = document.querySelector('.close-btn');
const transactionTableBody = document.querySelector('#transactionTable tbody');

document.getElementById('withTrans').addEventListener('click', async () => {
    const Data = getDateRangeData();
    if (!Data) return; // Stop if input is invalid

    console.log('Request Data:', Data);

    const host = localStorage.getItem('host');
    const port = localStorage.getItem('port');
    console.log(host + ':' + port + ':' + host + ':' + port)
    const command = 'getFinanceReporteByTransfer';
    const URL = `http://${host}:${port}/${command}`;

    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Data)
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        console.log('Data received:', data);

        // Clear previous rows
        transactionTableBody.innerHTML = '';

        // Populate rows
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.bankTotal}</td>
                <td>${data.cashTotal}</td>
                <td>${data.transferTotal}</td>
                <td>${data.additationTotal}</td>
                <td>${data.total}</td>
            `;
            transactionTableBody.appendChild(row);
        

        // Display the modal
        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching data');
    }
});

document.getElementById('outTrans').addEventListener('click', async () => {
    const Data = getDateRangeData();
    if (!Data) return; // Stop if input is invalid

    console.log('Request Data:', Data);

    const host = localStorage.getItem('host');
    const port = localStorage.getItem('port');
    console.log("aaaaaa");
    console.log(host + ':' + port + ':' + host + ':' + port)
    const command = 'getFinanceReporteWithoutTransfer';
    const URL = `http://${host}:${port}/${command}`;

    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Data)
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        console.log('Data received:', data);

        // Remove the 3rd <th> from the header
        const tableHeaderRow = document.querySelector('#transactionTable thead tr');
        if (tableHeaderRow && tableHeaderRow.children.length >= 3) {
            tableHeaderRow.children[2].style.display = 'none';
        }

        // Clear previous rows
        transactionTableBody.innerHTML = '';

        // Populate rows
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.bankTotal}</td>
            <td>${data.cashTotal}</td>
            <td>${data.additationTotal}</td>
            <td>${data.total}</td>
        `;
        transactionTableBody.appendChild(row);

        // Display the modal
        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching data');
    }
});


// Close modal logic
// Close modal logic
closeModalBtn.addEventListener('click', () => {
    // Hide modal
    modal.style.display = 'none';

    // Show the 3rd <th> again
    const tableHeaderRow = document.querySelector('#transactionTable thead tr');
    if (tableHeaderRow && tableHeaderRow.children.length >= 3) {
        tableHeaderRow.children[2].style.display = ''; // Reset display to default
    }

    // Show the 3rd <td> in each row again
    const tableRows = document.querySelectorAll('#transactionTable tbody tr');
    tableRows.forEach(row => {
        if (row.children.length >= 3) {
            row.children[2].style.display = ''; // Reset display to default
        }
    });
});


window.addEventListener('load', () => {
    const modal = document.getElementById('tableModal');
    modal.style.display = 'none'; // Hide modal by default on page load
});

document.getElementById('menu_bar_icon').addEventListener('click', () => {
    document.querySelector('.for_menu_links').classList.toggle('active');
});