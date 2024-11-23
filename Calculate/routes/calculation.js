const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');



router.post('/generate-pdf', async (req, res) => {
    const data = req.body; // Access the data sent in the body
    console.log(data);
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).send('Invalid data: JSON array is required');
        }

        // Загрузка HTML и CSS шаблонов
        const filePath = path.join(__dirname, '/pdf/template.html');
        const html = await fs.promises.readFile(filePath, 'utf8');
        const cssPath = path.join(__dirname, '/pdf/template.css');
        const css = await fs.promises.readFile(cssPath, 'utf8');

        const logoPath = path.join(__dirname, '/pdf/1.jpeg');
        const logoBase64 = await fs.promises.readFile(logoPath, 'base64');
        const logoDataUrl = `data:image/png;base64,${logoBase64}`;


        let filledHtml = html.replace('</head>', `<style>${css}</style></head>`);
        filledHtml = filledHtml.replace('{{logo}}', logoDataUrl);

        // Подготовка строк для таблицы
        let tableRows = '';
        data.forEach(row => {
            tableRows += `
                <tr>
                    <td>${row.name || ''}</td>
                    <td>${row.currency || ''}</td>
                    <td>${row.exchange || ''}</td>
                    <td>${row.price || ''}</td>
                    <td>${row.costprice || ''}</td>
                    <td>${row.sellingprice || ''}</td>
                </tr>`;
        });

        filledHtml = filledHtml.replace('{{tableRows}}', tableRows);

        // Генерация PDF с Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(filledHtml, { waitUntil: 'networkidle0' });

        try {
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm'
                }
            });
            await browser.close();

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="quotation.pdf"`,
                'Content-Length': pdfBuffer.length
            });

            res.write(pdfBuffer);
            res.end();

        } catch (pdfError) {
            console.error('Error generating PDF buffer:', pdfError);
            await browser.close();
            res.status(500).send('Failed to generate PDF');
        }

    } catch (error) {
        console.error('Error generating quotation PDF:', error);
        res.status(500).send('Server error generating quotation');
    }
});

module.exports = router;
