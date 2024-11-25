document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#OrdersTable tbody');
    const modal = document.querySelector('.modal');
    const addDataModal = document.getElementById('addDataModal');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    addTaskBtn.addEventListener('click', () => {
        addDataModal.style.display = 'flex';
    });
    closeModalBtn.addEventListener('click', () => {
        addDataModal.style.display = 'none';
    });

    document.getElementById('saveDataBtn').addEventListener('click', () => {
        const name = document.getElementById('modalName').value;
        const currency = document.getElementById('modalCurrency').value;
        const exchange = document.getElementById('modalExchange').value;
        const price = document.getElementById('modalPrice').value;

        const newOrder = { id: Date.now(), name, currency, exchange, price};
        addRow(newOrder);
        addDataModal.style.display = 'none';
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
            <td>${Number(sellingPrice.toFixed(2))}</td>
            <td>
                <a href="#" class="delete-btn"><i class="fa-solid fa-trash" style="margin-left: 2vh; color: rgb(0, 0, 0);"></i></a>
            </td>
        `;
        tableBody.appendChild(tr);
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
        
        const host = localStorage.getItem('host');
        const port = localStorage.getItem('port');
        console.log(host + ':' + port + ':' + host + ':' + port)
        const command = 'calculation/generate-pdf';
        const url = `http://${host}:${port}/${command}`;
        try {
            const response = await fetch(url, {
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
