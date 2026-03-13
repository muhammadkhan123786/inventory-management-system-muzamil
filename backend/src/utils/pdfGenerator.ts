import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';

export const generatePdfFromTemplate = async (templateName: string, data: any): Promise<Buffer> => {
  let browser;
  try {  
    const filePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
    if (!await fs.pathExists(filePath)) {
      throw new Error(`Template file not found at ${filePath}`);
    }

    const htmlContent = await fs.readFile(filePath, 'utf-8');
    const template = handlebars.compile(htmlContent);
    const finalHtml = template(data);

    console.log("[PDF] Launching Puppeteer...");
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    // Use 'domcontentloaded' - it's the fastest and least likely to hang
    await page.setContent(finalHtml, { waitUntil: 'domcontentloaded' });

    console.log("[PDF] Printing PDF...");
    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    console.log("[PDF] Done!");
    return Buffer.from(pdfUint8Array);
  } catch (error) {
    console.error("[PDF] Utility Error:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};