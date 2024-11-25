const addDataModal = document.getElementById('addDataModal');
const addTaskBtn = document.getElementById('addTaskBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

// Open modal on button click
addTaskBtn.addEventListener('click', () => {
    addDataModal.style.display = 'flex';
});

// Close modal on button click
closeModalBtn.addEventListener('click', () => {
    addDataModal.style.display = 'none';
});

document.getElementById('menu_bar_icon').addEventListener('click', () => {
    document.querySelector('.for_menu_links').classList.toggle('active');
});


//Opening a Dropdown
document.getElementById('search_btn').addEventListener('click', (event) => {
    const dateDropdown = document.getElementById('dateDropdown');

    if (  dateDropdown.style.display = "flex") {
        console.log('Entering');
        // Populate year options dynamically
        const yearSelects = [document.getElementById('startYearSelect'), document.getElementById('endYearSelect')];
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 50;
        const endYear = currentYear + 10;

        yearSelects.forEach(yearSelect => {
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
    });
});


//Condirming Values for Fetch 
document.getElementById('confirmDateBtn').addEventListener('click', () => {
    const startMonth = document.getElementById('startMonthSelect').value;
    const startYear = document.getElementById('startYearSelect').value;
    const endMonth = document.getElementById('endMonthSelect').value;
    const endYear = document.getElementById('endYearSelect').value;

    console.log('Fetch', startMonth, startYear, endMonth, endYear);
    
    if (!startMonth || !startYear) {
        alert('Please select both start month and year.');
        return;
    }

    // Create startDate and endDate
    let startDate = `${startYear}-${startMonth}`; // Default to the first day of the start month
    let endDate = `${endYear}-${endMonth}`; // Default to the first day of the end month

    // If no end date is provided, use the startDate as the end date
    if (!endMonth || !endYear) {
        endDate = startDate;
    }

    const Data = {
        startDate: startDate,
        endDate: endDate
    };

    console.log('Selected Start Date:', startDate, 'End Date:', endDate);

    const host = localStorage.getItem('host');
    const port = localStorage.getItem('port');
    const command = 'getTransferTransactionsByInterval';
    const URL = `http://${host}:${port}/${command}`;

    try {
        fetch(URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            dateDropdown.style.display = "none";
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data);
            const tableBody = document.getElementById("OrdersTable").getElementsByTagName("tbody")[0];
            tableBody.innerHTML = "";  // Clear any existing rows

            data.transactions.forEach(item => {
                const row = tableBody.insertRow();
                row.insertCell(0).textContent = parseInt(item.id, 10);
                row.insertCell(1).textContent = item.date;
                row.insertCell(2).textContent = item.reason;
                row.insertCell(3).textContent = parseInt(item.expense, 10);
            });

            // Update total price (if applicable)
            document.querySelector('.total-price').textContent = data.total;
        });
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching data');
    }
});


//Add the new one
document.getElementById('saveDataBtn').addEventListener('click', async () => {
    const date = document.getElementById('modalDate').value;
    const reason = document.getElementById('modalReason').value.trim();
    const expense = document.getElementById('modalExpense').value.trim();
    

    const Data = {
        expense: parseInt(expense, 10),
        date: date,
        reason: reason
    };

    console.log(Data);

    const host = localStorage.getItem('host');
    const port = localStorage.getItem('port');
    console.log(host, port);
    const command = "addTransferTransaction";
    const URL = `http://${host}:${port}/${command}`;

    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Data)
        });

        if (response.ok) {
            alert('Data added successfully');
            addDataModal.style.display = 'none';
        } else {
            alert('Data not added successfully');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding data');
    }
});

//search 
async function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();

    // Get all table rows
    const tableRows = document.querySelectorAll('#OrdersTable tbody tr');

    if (!searchTerm) {
        // If search term is empty, show all rows
        tableRows.forEach(row => {
            row.style.display = ''; // Reset to default display
        });
        return;
    }

    console.log('Search term =', searchTerm);

    tableRows.forEach(row => {
        const cells = row.getElementsByTagName('td'); // Get all cells in the row

        let rowContainsSearchTerm = false;

        // Loop through each cell in the row and check if it contains the search term
        for (let cell of cells) {
            if (cell.innerText.toLowerCase().includes(searchTerm)) {
                rowContainsSearchTerm = true;
                break; // Stop checking further cells if a match is found
            }
        }

        // Show or hide the row based on whether it contains the search term
        row.style.display = rowContainsSearchTerm ? '' : 'none';
    });
}


// real-time search logic
let debounceTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(debounceTimeout); // Clear any previous timeout
    debounceTimeout = setTimeout(performSearch, 300); // Delay search by 300ms
});




let currentRow; // To store the row that's being edited

// Event delegation: Attach event listener to tbody, then filter for rows
document.querySelector('#OrdersTable tbody').addEventListener('click', function(event) {
    const row = event.target.closest('tr'); // Find the closest <tr> ancestor of the clicked target
    if (row) {
        handleRowClick(row); // Pass the clicked row to the handler directly
    }
});

// Function to handle row click and open the modal
function handleRowClick(row) {
    currentRow = row; // Directly assign the clicked row to currentRow
    const cells = currentRow.querySelectorAll('td'); // Get all the cells of the clicked row

    // Extract data from the row cells
    const rowData = Array.from(cells).map(cell => cell.innerText);

    console.log('Row Data:', rowData); // Log data to debug what's being extracted

    if (rowData.length < 4) {
        console.error('Data is missing in row cells');
        return;
    }

    // Set the modal content using extracted row data
    const modalContent = `
        <p><strong>ID:</strong> <span id="Id">${rowData[0]}</span></p>
        <p><strong>Date:</strong> <input type="text" id="Date" value="${rowData[1]}" /></p>
        <p><strong>Reason:</strong> <input type="text" id="Reason" value="${rowData[2]}" /></p>
        <p><strong>Expense:</strong> <input type="text" id="Expense" value="${rowData[3]}" /></p>
    `;

    // Set the content inside the modal
    document.getElementById('modalData').innerHTML = modalContent;

    // Show the modal
    const modal = document.getElementById('rowModal');
    modal.style.display = 'block';

    // Attach event listeners for Save and Delete buttons
    document.getElementById('saveModalBtn').addEventListener('click', handleSave);
    document.getElementById('deleteModalBtn').addEventListener('click', handleDelete);

}






// Function to save the edited data
// Function to save the edited data
async function handleSave() {
    // Get the values from the modal
    const id = document.getElementById('Id').innerText; // ID is a span, so innerText
    const date = document.getElementById('Date').value; // Should be a string
    const reason = document.getElementById('Reason').value; // Should be a string
    const expense = document.getElementById('Expense').value; // Should be a number

    // Log the values to ensure they are being captured correctly
    console.log('Modal values:', { id, date, reason, expense });

    // Check if the fields have valid values before proceeding
    if (!date || !reason || isNaN(expense)) {
        alert('Please ensure all fields are filled out correctly.');
        return;
    }

    // Prepare the data to be updated
    const updatedData = {
        id: parseInt(id, 10), // Ensure ID is an integer
        date: date,
        reason: reason,
        expense: parseFloat(expense) // Ensure expense is a number (decimal)
    };

    console.log('Updated data:', updatedData); // Check what data you're sending

    // Make the API request to save the updated data
    const host = localStorage.getItem('host');
    const port = localStorage.getItem('port');
    const command = "updateTransferTransaction";
    const URL = `http://${host}:${port}/${command}`;

    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            // Update the row in the table with the new data
            const cells = currentRow.querySelectorAll('td');
            cells[0].innerText = updatedData.id; // Update ID cell
            cells[1].innerText = updatedData.date; // Update Date cell
            cells[2].innerText = updatedData.reason; // Update Reason cell
            cells[3].innerText = updatedData.expense; // Update Expense cell

            alert('Data updated successfully');
        } else {
            alert('Failed to update data');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating data');
    }

    // Optionally, close the modal
    closeModal(); // Close the modal after saving
}




// Function to delete the row
async function handleDelete() {
    const id = document.getElementById('Id').innerText;

    const host = localStorage.getItem('host');
    const port = localStorage.getItem('port');
    const command = "deleteTransferTransaction";
    const URL = `http://${host}:${port}/${command}`;
    
    const Data = { id: parseInt(id, 10) };

    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Data)
        });

        if (response.ok) {
            // Remove the row from the table
            currentRow.remove();
            alert('Row deleted successfully');
        } else {
            alert('Failed to delete row');
        }
    } catch (error) {
        console.error('Error deleting row:', error);
        alert('An error occurred while deleting row');
    }

    closeModal(); // Close the modal after deletion
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('rowModal');
    modal.style.display = 'none';

    // Remove event listeners when modal is closed to avoid multiple bindings
    document.getElementById('saveModalBtn').removeEventListener('click', handleSave);
    document.getElementById('deleteModalBtn').removeEventListener('click', handleDelete);
}

// Close modal when clicking "Close" button
document.getElementById('closeModalBtn').addEventListener('click', closeModal);






