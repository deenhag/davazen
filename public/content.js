/**
 * This script runs on the UYAP case list page to scrape case data.
 */
function scrapeData() {
  // UYAP uses a specific class for its main data table.
  const table = document.querySelector('table.rich-table');
  if (!table) {
    console.warn("DavaZen Extension: UYAP dava tablosu bulunamadı.");
    return [];
  }
  const rows = table.querySelectorAll('tbody tr');
  const data = [];
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    // Ensure the row has enough cells to prevent errors
    if (cells.length >= 5) {
      const caseData = {
        courtName: cells[0]?.innerText.trim() || '',
        fileNumber: cells[1]?.innerText.trim() || '',
        parties: cells[2]?.innerText.trim() || '',
        tarafAdi: cells[3]?.innerText.trim() || '',
        caseStatus: cells[4]?.innerText.trim() || '',
      };
      data.push(caseData);
    }
  });
  return data;
}
// Scrape the data as soon as the script is injected.
const scrapedData = scrapeData();
// If data was found, send it to the background script.
if (scrapedData.length > 0) {
  chrome.runtime.sendMessage({ action: "sendData", data: scrapedData }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("DavaZen Extension: Veri gönderilirken hata oluştu:", chrome.runtime.lastError.message);
    } else {
      console.log("DavaZen Extension: Veriler başarıyla gönderildi.", response);
    }
  });
}