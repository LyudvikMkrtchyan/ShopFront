const classModal = document.querySelector('.modal');

//Opening a Dropdown
document.getElementById('search_btn').addEventListener('click', (event) => {
    const dateDropdown = document.getElementById('dateDropdown');

    if (dateDropdown.style.display === 'none' || dateDropdown.style.display === '') {
        const rect = document.getElementById('search_btn').getBoundingClientRect(); // Get button position
        dateDropdown.style.display = 'block';
        dateDropdown.style.position = 'absolute';
        dateDropdown.style.left = `${rect.left}px`; // Align dropdown horizontally with the button
        dateDropdown.style.top = `${rect.bottom}px`;
        
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
});

//Closing a Dropdown
document.addEventListener('click', (event) => {
    const dateDropdown = document.getElementById('dateDropdown');
    const dateButton = document.getElementById('search_btn');

    if (!dateDropdown.contains(event.target) && event.target !== dateButton) {
        dateDropdown.style.display = 'none'; // Hide the dropdown
    }
});

//Condirming Values for Fetch 
document.getElementById('confirmDateBtn').addEventListener('click', () => {
    const startMonth = document.getElementById('startMonthSelect').value;
    const startYear = document.getElementById('startYearSelect').value;
    const endMonth = document.getElementById('endMonthSelect').value;
    const endYear = document.getElementById('endYearSelect').value;
    
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
                row.insertCell(4).innerHTML = `
                    <a href="#"><i class="fa-solid fa-pencil" style="margin-left: 2vh; color: rgb(0, 0, 0);"></i></a>
                    <a href="#"><i class="fa-solid fa-trash" style="margin-left: 2vh; color: rgb(0, 0, 0);"></i></a>
                `;
                
                // Attach event listeners for edit and remove
                row.querySelector('.fa-pencil').addEventListener('click', handleEdit);
                row.querySelector('.fa-trash').addEventListener('click', handleRemove);
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
document.getElementById('add_table_button').addEventListener('click', async () => {
    const classModalFields = classModal ? classModal.querySelectorAll('input') : [];
    let expense;
    let reason;
    let date;

    classModalFields.forEach(field => {
        if (field.tagName === 'INPUT') {
            if (field.name === "reason") {
                reason = field.value;
            }
            if (field.name === "expense") {
                
                expense = parseInt(field.value, 10);
                console.log(typeof expense)
                
            }


            if (field.name === "date") {
                date = field.value;
            }
        }
    });

    // Ensure that all fields are filled
    

    const Data = {
        expense: expense,
        date: date,
        reason: reason
    };

    console.log(Data);

    const host = localStorage.getItem('host');
    const port = localStorage.getItem('port');
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
    
    if (!searchTerm) {
        return;
    }

    console.log('Search term =', searchTerm);

    // Get all table rows
    const tableRows = document.querySelectorAll('#OrdersTable tbody tr');
    
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
        if (rowContainsSearchTerm) {
            row.style.display = ''; // Show the row
        } else {
            row.style.display = 'none'; // Hide the row
        }
    });
}

// real-time search logic
let debounceTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(debounceTimeout); // Clear any previous timeout
    debounceTimeout = setTimeout(performSearch, 300); // Delay search by 300ms
});

// Opening a modal table to input
document.getElementById('addTaskBtn').addEventListener('click', () => {
    console.log('addTaskBtn')
    if (classModal) {
        classModal.classList.add('active');
    }
});


//opening Menu 
document.getElementById('menu_bar_icon').addEventListener('click', () => {
    document.querySelector('.for_menu_links').classList.toggle('active');
});


function handleEdit(event) {
    const row = event.target.closest('tr');
    if (!row) return;
    
    const cells = row.querySelectorAll('td:not(:last-child)'); // Select all td cells except the last one
    
    const fieldNames = ['id', 'date', 'reason', 'expense']; // Update this array based on your data structure

    // Convert each cell into an input field or dropdown
    cells.forEach((cell, index) => {
        let input;

        // Create an input field for each cell
        // if (fieldNames[index] === 'id') {
        //     // For 'id' field, just display it as text (not input)
        //     const textNode = document.createTextNode(cell.innerText); // Keep the text as it is
        //     cell.innerHTML = ''; // Clear the cell's content
        //     cell.appendChild(textNode); // Add the text node to the cell
        // } else {
            // For other fields, create an editable input
            input = document.createElement('input');
            input.type = 'text'; // Set input type to text
            input.value = cell.innerText; // Set the input's value to the cell's text content
            input.setAttribute('data-field', fieldNames[index]);

            cell.innerHTML = ''; // Clear the cell's content
            cell.appendChild(input); // Add the input field to the cell
        
    });

    const editBtn = event.target.closest('i'); // Get the closest icon element
    if (editBtn) {
        editBtn.classList.replace('fa-pencil', 'fa-save'); // Change the button icon
        editBtn.removeEventListener('click', handleEdit); // Remove the edit event listener
        editBtn.addEventListener('click', handleSave); // Add the save event listener
    }
}

async function handleSave(event) {
    const row = event.target.closest('tr');
    const cells = row.querySelectorAll('td:not(:last-child)');

    const Data = {};

    cells.forEach(cell => {
        const input = cell.querySelector('input'); // Find the input field inside the cell
        if (input) {
            const fieldName = input.getAttribute('data-field');
            Data[fieldName] = input.value; // Assign the value to the corresponding field in the Data object
        }
    });

    // Convert specific fields to appropriate types
    Data.expense = parseInt(Data.expense, 10); // Ensure expense is an integer
    Data.id = parseInt(Data.id, 10); // Convert id to number if it's a valid number

    console.log(Data); // Log the data to check the values before sending

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
            body: JSON.stringify(Data)
        });

        if (response.ok) {
            alert('Data updated successfully');
        } else {
            alert('Failed to update data');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating data');
    }
}


async function handleRemove(event) {
    const row = event.target.closest('tr');
    const idCell = row.querySelector('td:first-child'); // Assuming the ID is in the first cell of the row
    const id = parseInt(idCell.innerText, 10); // Extract the ID from the cell's innerText and parse it to an integer

    if (isNaN(id)) {
        console.error('ID is undefined or invalid. Cannot proceed with deletion.');
        return;
    }

    const host = localStorage.getItem('host');
    const port = localStorage.getItem('port');
    const command = "deleteTransferTransaction";
    const URL = `http://${host}:${port}/${command}`;
    
    const Data = {
        id: id
    };

    try {
        console.log('ID before deletion:', id); // For debugging purposes
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Data)
        });

        if (!response.ok) {
            throw new Error('Failed to delete order');
        }

        console.log('Track deleted successfully');
        row.remove(); // Remove the row from the table
    } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete track. Please try again.');
    }
}






