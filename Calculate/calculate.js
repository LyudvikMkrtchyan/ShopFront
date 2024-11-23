document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#OrdersTable tbody');
    const modal = document.querySelector('.modal');
    const saveOrderBtn = document.getElementById('add_table_button');

    document.getElementById('addTaskBtn').addEventListener('click', () => {
        modal.classList.add('active');
    });

    saveOrderBtn.addEventListener('click', () => {
        const classModalFields = modal ? modal.querySelectorAll('input, select') : [];

        let name, currency, exchange, price, costprice, sellingprice;

        classModalFields.forEach(field => {
            if (field.tagName === 'INPUT') {
                switch (field.name) {
                    case "name":
                        name = field.value;
                        break;
                    case "exchange":
                        exchange = field.value;
                        break;
                    case "price":
                        price = field.value;
                        break;
                    case "costprice":
                        costprice = field.value;
                        break;
                    case "sellingprice":
                        sellingprice = field.value;
                        break;
                }
            } else if (field.tagName === 'SELECT') {
                if (field.name === "currency") {
                    currency = field.options[field.selectedIndex].value;
                }
            }
        });

        const newOrder = { id: Date.now(), name, currency, exchange, price, costprice, sellingprice };
        addRow(newOrder);
        modal.classList.remove('active');
        clearModalFields();
    });

    function addRow(order) {
        const costPrice = order.exchange * order.price * 1.5;
        const sellingPrice = (costPrice * 2) * 1.1;
        const tr = document.createElement('tr');
        tr.dataset.id = order.id;
        tr.innerHTML = `
            <td>${order.name}</td>
            <td>${order.currency}</td>
            <td>${order.exchange}</td>
            <td>${order.price}</td>
            <td>${costPrice}</td>
            <td>${sellingPrice}</td>
            <td>
                <a href="#" class="delete-btn"><i class="fa-solid fa-trash" style="margin-left: 2vh; color: rgb(0, 0, 0);"></i></a>
            </td>
        `;
        tableBody.appendChild(tr);
    }

    function deleteRow(row, order) {
        row.remove();
    }

    function clearModalFields() {
        const modalFields = modal ? modal.querySelectorAll('input, select') : [];
        modalFields.forEach(field => {
            if (field.tagName === 'INPUT') {
                field.value = '';
            } else if (field.tagName === 'SELECT') {
                field.selectedIndex = 0;
            }
        });
    }

    tableBody.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            const row = e.target.closest('tr');
            row.remove();
        }
    });

    document.getElementById('gen_pdf').addEventListener('click', () => createPdfFile());

    async function createPdfFile() {
        // Get the data from the table
        const tableRows = Array.from(tableBody.rows).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                name: cells[0].innerText,
                currency: cells[1].innerText,
                exchange: cells[2].innerText,
                price: cells[3].innerText,
                costprice: cells[4].innerText,
                sellingprice: cells[5].innerText
            };
        });

        try {
            const response = await fetch('http://localhost:3003/calculation/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  // Correct content type for JSON
                },
                body: JSON.stringify(tableRows)  // Send the table row data as JSON
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            const pdfUrl = URL.createObjectURL(blob);

            console.log('PDF generated and stored in variable:', pdfUrl);

            // Optional: Use this to create a downloadable link for the PDF
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'generated_invoice.pdf';  // Set a default name for the PDF
            link.click();

        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }
});
