const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const auditUtils = require('../utils/auditUtils');

const router = express.Router();

// Audit
router.post('/', async (req, res) => {
    try {
      console.log(req);
      
        const { url } = req.body;
        const hostname = auditUtils.extractHostname(url);
        if (!hostname) return res.status(400).json({ error: 'Invalid URL' });

        const { default: lighthouse } = await import('lighthouse');
        const { launch } = await import('chrome-launcher');
        const chrome = await launch({ chromeFlags: ['--headless'] });
        const options = { port: chrome.port, output: 'html', logLevel: 'info' };
        const result = await lighthouse(url, options);

        const reportHtml = result.report;
        const totalBytes = result.lhr.audits['total-byte-weight'].numericValue;
        const performanceScore = Math.round(result.lhr.categories.performance.score * 100);
        const green = await auditUtils.isGreenHost(hostname);

        let co2e = 0;
        let carbonRating = 'N/A';

        // Call the Website Carbon API, with a specific try...catch block
        try {
            const carbonApiUrl = `https://api.websitecarbon.com/data?bytes=${totalBytes}&green=${green ? 1 : 0}`;
            const carbonApiResponse = await axios.get(carbonApiUrl);
            const carbonData = carbonApiResponse.data;

            co2e = carbonData.gco2e;
            carbonRating = carbonData.rating;
        } catch (apiError) {
            console.error('Failed to fetch data from Website Carbon API. Using fallback values:', apiError);
            // Fallback values in case of API failure
            co2e = null;
            carbonRating = 'N/A';
        }

        // Hardcoded scores for demonstration, you can adjust as needed
        const co2Score = co2e !== null && co2e < 0.5 ? 100 : co2e !== null && co2e < 1 ? 70 : 40;
        const greenScore = Math.round(
            (performanceScore * 0.4) +
            (green ? 100 * 0.3 : 0) +
            (co2Score * 0.3)
        );

        // Get suggestions based on page weight
        const suggestions = auditUtils.getSuggestions(totalBytes);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const htmlPath = `report/html/report-${timestamp}.html`;
        const pdfPath = `report/pdf/report-${timestamp}.pdf`;

        // Map suggestions to list items for display
        const suggestionsHtml = suggestions.map(suggestion => `<li>${suggestion}</li>`).join('');

        const customHtml = `
      <html>
      <head>
        <title>Audit Report</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body {
            font-family: sans-serif;
            padding: 2rem;
            max-width: 900px;
            margin: 0 auto;
            text-align: center;
          }
          h1, h2, p, ul {
            text-align: left;
          }
          canvas {
            max-width: 800px;
            margin: 0 auto;
          }
          .lighthouse-container {
            text-align: left;
            margin: 0 auto;
            margin-top: 50px;
          }
          .lh-header-container {
            position: relative !important;
          }
          .lh-root {
            padding-top: 0 !important;
          }
          /* Prevent breaking inside score circles and related elements */
          .lh-audit__score,
          .lh-score__circle,
          .lh-audit__header,
          .lh-audit {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        <h1>Website Carbon & Performance Audit</h1>
        <p><strong>URL:</strong> ${url}</p>
        <p><strong>Green Hosting:</strong> ${green ? 'Yes 🌿' : 'No ❌'}</p>
        <p><strong>Total Page Weight:</strong> ${(totalBytes / 1024).toFixed(2)} KB</p>
        <p><strong>Estimated CO₂ per Pageview:</strong> ${co2e !== null ? co2e.toFixed(2) + ' grams' : 'N/A'}</p>
        <p><strong>Carbon Rating:</strong> ${carbonRating}</p>
        
        <h2>🌿 Green Score: ${greenScore}/100</h2>
        <p><strong>Performance Score:</strong> ${performanceScore}</p>
        
        <h2>Recommendations for Improving Carbon Footprint:</h2>
        <ul>
          ${suggestionsHtml}
        </ul>

        <canvas id="auditChart" width="800" height="400"></canvas>

        <script>
          const ctx = document.getElementById('auditChart').getContext('2d');
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Performance', 'Green Hosting', 'CO₂ Score'],
              datasets: [{
                label: 'Audit Metrics',
                data: [${performanceScore}, ${green ? 100 : 0}, ${co2Score}],
                backgroundColor: ['#4caf50', '#2196f3', '#f44336']
              }]
            },
            options: {
              scales: {
                y: { beginAtZero: true, max: 100 }
              }
            }
          });
        </script>
        
        <hr>
        <h2>Lighthouse Report</h2>
        <div class="lighthouse-container">
          ${reportHtml}
        </div>
      </body>
      </html>
    `;

        fs.writeFileSync(htmlPath, customHtml);

        try {
            const browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            await page.setContent(customHtml, { waitUntil: 'networkidle0' });

            await page.pdf({
                path: pdfPath,
                format: 'A4',
                printBackground: true,
                margin: { top: '20mm', bottom: '20mm', left: '10mm', right: '10mm' }
            });

            await browser.close();

            res.json({ htmlPath: '/' + htmlPath, pdfPath: '/' + pdfPath });
        } catch (err) {
            console.error('PDF generation failed:', err);
            res.status(500).json({ error: 'PDF generation failed' });
        }
    } catch (error) {
        console.error('Audit failed:', error);
        res.status(500).json({ error: 'Audit failed' });

    }
});

module.exports = router;