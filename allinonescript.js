// ==========================================
// 1. ระบบดาวน์โหลด YouTube (อัปเดตแก้ปัญหาเชื่อมต่อเซิร์ฟเวอร์ไม่ได้)
// ==========================================
async function downloadYT() {
    const link = document.getElementById('ytLink').value;
    const format = document.getElementById('ytFormat').value;
    const widget = document.getElementById('download-widget');

    if (!link.includes('youtube.com') && !link.includes('youtu.be')) {
        alert('กรุณาใส่ลิ้งก์ YouTube ให้ถูกต้องครับ');
        return;
    }
    
    // แสดงข้อความสถานะระหว่างรอ
    widget.innerHTML = "<p style='color:#f39c12; margin-top:15px;'>⏳ กำลังประมวลผลไฟล์และเชื่อมต่อเซิร์ฟเวอร์... (อาจใช้เวลาสักครู่)</p>";

    let requestBody = { url: link, vQuality: "1080", isAudioOnly: false, aFormat: "mp3" };

    if (format === "4k") {
        requestBody.vQuality = "2160";
    } else if (format === "mp3_128" || format === "mp3_320") {
        requestBody.isAudioOnly = true; requestBody.aFormat = "mp3";
    } else if (format === "wav") {
        requestBody.isAudioOnly = true; requestBody.aFormat = "wav";
    }

    // รายชื่อเซิร์ฟเวอร์และ Proxy สำรอง (สลับอัตโนมัติหากอันแรกติดบล็อก CORS)
    const apiEndpoints = [
        'https://co.wuk.sh/api/json',
        'https://api.cobalt.tools/api/json',
        'https://corsproxy.io/?' + encodeURIComponent('https://co.wuk.sh/api/json')
    ];

    let successData = null;

    // ลูปเพื่อทดลองยิง API ไปทีละเซิร์ฟเวอร์
    for (let api of apiEndpoints) {
        try {
            const response = await fetch(api, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            
            if (response.ok) {
                successData = await response.json();
                break; // ถ้ายิงสำเร็จ ให้ออกจากลูปทันที
            }
        } catch (error) {
            console.warn(`เชื่อมต่อ ${api} ไม่สำเร็จ กำลังสลับไปเซิร์ฟเวอร์สำรอง...`);
        }
    }

    // ตรวจสอบและแสดงผลลัพธ์
    if (successData) {
        if (successData.status === "stream" || successData.status === "redirect" || successData.url) {
            const downloadUrl = successData.url;
            widget.innerHTML = `<a href="${downloadUrl}" target="_blank" class="real-download-btn">✅ กดดาวน์โหลดไฟล์ที่นี่</a>`;
        } else if (successData.status === "error") {
            widget.innerHTML = `<p style="color:red;">❌ เกิดข้อผิดพลาด: ${successData.text || 'วิดีโอนี้อาจถูกจำกัดสิทธิ์หรือติดลิขสิทธิ์'}</p>`;
        } else {
            widget.innerHTML = `<p style="color:red;">❌ เกิดข้อผิดพลาดในการประมวลผลข้อมูล</p>`;
        }
    } else {
        // หากเซิร์ฟเวอร์สำรองทั้งหมดใช้งานไม่ได้เลย
        widget.innerHTML = `
            <p style="color:red; font-weight:bold;">❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ดาวน์โหลดได้เลย</p>
            <div style="font-size: 13px; color: #64748b; margin-top: 10px; text-align: left; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                💡 <b>คำแนะนำเพิ่มเติม:</b> อาการนี้มักเกิดจากการเปิดไฟล์ HTML ตรงๆ (file:///) ทำให้เบราว์เซอร์บล็อกการทำงาน<br>
                👉 แนะนำให้ทดสอบเปิดเว็บผ่านโปรแกรมจำลองเซิร์ฟเวอร์ เช่น Extension <b>Live Server</b> ในโปรแกรม VSCode ครับ
            </div>`;
    }
}

// ==========================================
// 2. ระบบสร้าง QR Code (อัปเดต Quick Logo)
// ==========================================
let activeQuickLogoUrl = "";

// ฟังก์ชันเมื่อกดเลือกปุ่มโลโก้ด่วน
function setQuickLogo(btnEl, url) {
    activeQuickLogoUrl = url;
    document.getElementById('qrLogo').value = ""; // เคลียร์ช่องอัปโหลดไฟล์
    
    // รีเซ็ตสีปุ่มอื่นๆ และกำหนดสีปุ่มที่กำลังเลือก
    document.querySelectorAll('.logo-btn').forEach(btn => btn.classList.remove('active'));
    btnEl.classList.add('active');
}

// ฟังก์ชันล้างค่าโลโก้ด่วนเมื่อผู้ใช้อัปโหลดรูปเอง
function clearQuickLogo() {
    activeQuickLogoUrl = "";
    document.querySelectorAll('.logo-btn').forEach(btn => btn.classList.remove('active'));
}

function generateQR() {
    const link = document.getElementById('qrLink').value;
    const logoInput = document.getElementById('qrLogo');
    const qrContainer = document.getElementById('qrcode');

    if (!link) { alert('กรุณาใส่ลิ้งก์ก่อนสร้าง QR Code'); return; }
    qrContainer.innerHTML = "";
    
    const options = {
        text: link, width: 250, height: 250, colorDark : "#000000", colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H,
        crossOrigin: "anonymous" // ป้องกันปัญหาความปลอดภัยเวลาดึงรูปลิ้งก์ภายนอก
    };

    // เช็คว่าอัปโหลดรูปเอง หรือ เลือกโลโก้ด่วน
    if (logoInput.files && logoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            options.logo = e.target.result;
            options.logoWidth = 60; options.logoHeight = 60; options.logoBackgroundTransparent = true;
            new QRCode(qrContainer, options);
        }
        reader.readAsDataURL(logoInput.files[0]);
    } else if (activeQuickLogoUrl !== "") {
        options.logo = activeQuickLogoUrl;
        options.logoWidth = 60; options.logoHeight = 60; options.logoBackgroundTransparent = true;
        new QRCode(qrContainer, options);
    } else {
        new QRCode(qrContainer, options);
    }
}

// ==========================================
// 3. ระบบใบเสร็จรับเงิน (โครงสร้างเดิม)
// ==========================================
let currentLang = 'th'; 

window.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('receipt-date');
    if(dateInput && !dateInput.value) { dateInput.valueAsDate = new Date(); }
    loadSavedDraft();
    triggerAllAutoGrow();
});

function triggerAllAutoGrow() {
    document.querySelectorAll('textarea').forEach(textarea => { autoGrow(textarea); });
}

function autoGrow(element) {
    element.style.height = "auto";
    element.style.height = (element.scrollHeight) + "px";
}

function toggleLanguage() {
    currentLang = (currentLang === 'th') ? 'en' : 'th';
    localStorage.setItem('receipt_lang_pref', currentLang);
    applyLanguageUI();
    calculateReceipt(); 
}

function applyLanguageUI() {
    const toggleBtn = document.getElementById('btn-lang-toggle');
    if (toggleBtn) toggleBtn.textContent = (currentLang === 'en') ? "🌐 เปลี่ยนเป็นภาษาไทย" : "🌐 Switch to English";

    document.querySelectorAll('[data-th]').forEach(el => {
        el.textContent = el.getAttribute(`data-${currentLang}`);
    });
    document.querySelectorAll('[data-th-holder]').forEach(el => {
        el.setAttribute('placeholder', el.getAttribute(`data-${currentLang}-holder`));
    });
}

function addNewRow() {
    const tbody = document.getElementById('items-table').getElementsByTagName('tbody')[0];
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td style="text-align: center;" class="row-index"></td>
        <td><input type="text" class="input-item-name" placeholder="${currentLang === 'th' ? 'พิมพ์รายการสินค้าหรือบริการที่นี่...' : 'Enter product or service name...'}" data-th-holder="พิมพ์รายการสินค้าหรือบริการที่นี่..." data-en-holder="Enter product or service name..." oninput="saveDraft()"></td>
        <td><input type="number" class="qty-field" value="1" min="0" oninput="calculateReceipt(); saveDraft();"></td>
        <td><input type="number" class="price-field" value="0.00" min="0" step="0.01" oninput="calculateReceipt(); saveDraft();"></td>
        <td style="text-align: right;" class="amount-field">0.00</td>
        <td style="text-align: center;" class="col-action"><button class="btn-delete" onclick="deleteRow(this)" data-th="ลบ" data-en="Delete">${currentLang === 'th' ? 'ลบ' : 'Delete'}</button></td>
    `;
    refreshRowIndices();
    calculateReceipt();
    saveDraft();
}

function deleteRow(button) {
    button.closest('tr').remove();
    refreshRowIndices();
    calculateReceipt();
    saveDraft();
}

function refreshRowIndices() {
    document.querySelectorAll('#items-table tbody tr').forEach((row, index) => {
        row.querySelector('.row-index').textContent = index + 1;
    });
}

function calculateReceipt() {
    let subtotal = 0;
    document.querySelectorAll('#items-table tbody tr').forEach(row => {
        const qty = parseFloat(row.querySelector('.qty-field').value) || 0;
        const price = parseFloat(row.querySelector('.price-field').value) || 0;
        const amount = qty * price;
        row.querySelector('.amount-field').textContent = amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        subtotal += amount;
    });
    document.getElementById('subtotal-val').textContent = subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('grand-total-val').textContent = subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('baht-text-display').textContent = "( " + (currentLang === 'th' ? convertToThaiBahtText(subtotal) : convertToEnglishBahtText(subtotal)) + " )";
}

function convertToThaiBahtText(number) {
    if (number === 0 || isNaN(number)) return "ศูนย์บาทถ้วน";
    let [bahtPart, satangPart] = Math.abs(number).toFixed(2).split('.');
    let bahtText = parseThaiCurrencyWords(bahtPart);
    if (parseInt(satangPart) === 0) bahtText += "บาทถ้วน"; 
    else bahtText += "บาท" + parseThaiCurrencyWords(satangPart) + "สตางค์";
    return (number < 0 ? "ลบ" : "") + bahtText;
}

function parseThaiCurrencyWords(numberStr) {
    const digits = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
    const units = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
    let output = "";
    for (let i = 0; i < numberStr.length; i++) {
        let digit = parseInt(numberStr.charAt(i)), position = numberStr.length - 1 - i;
        if (digit !== 0) {
            if (position % 6 === 1 && digit === 1) output += "";
            else if (position % 6 === 1 && digit === 2) output += "ยี่";
            else if (position % 6 === 0 && digit === 1 && i > 0) output += (numberStr.charAt(i-1) !== '0') ? "เอ็ด" : "หนึ่ง";
            else output += digits[digit];
            output += units[position % 6];
        }
        if (position % 6 === 0 && position > 0) output += "ล้าน";
    }
    return output;
}

function convertToEnglishBahtText(number) {
    if (number === 0 || isNaN(number)) return "Zero Baht Only";
    let [bahtPart, satangPart] = Math.abs(number).toFixed(2).split('.');
    let output = parseEnglishWords(parseInt(bahtPart)) + " Baht";
    if (parseInt(satangPart) > 0) output += " and " + parseEnglishWords(parseInt(satangPart)) + " Satang";
    return output + " Only";
}

function parseEnglishWords(num) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    if (num === 0) return "Zero";
    let words = "";
    if (Math.floor(num / 1000000) > 0) { words += parseEnglishWords(Math.floor(num / 1000000)) + " Million "; num %= 1000000; }
    if (Math.floor(num / 1000) > 0) { words += parseEnglishWords(Math.floor(num / 1000)) + " Thousand "; num %= 1000; }
    if (Math.floor(num / 100) > 0) { words += parseEnglishWords(Math.floor(num / 100)) + " Hundred "; num %= 100; }
    if (num > 0) {
        if (num < 20) words += ones[num];
        else { words += tens[Math.floor(num / 10)]; if ((num % 10) > 0) words += "-" + ones[num % 10]; }
    }
    return words.trim();
}

function saveDraft() {
    localStorage.setItem('receipt_personal_draft', JSON.stringify({
        vendor: document.getElementById('vendor-info').value,
        customer: document.getElementById('customer-info').value,
        remark: document.getElementById('receipt-remark').value,
        receiptNo: document.getElementById('receipt-no').value
    }));
}

function loadSavedDraft() {
    if (localStorage.getItem('receipt_lang_pref')) currentLang = localStorage.getItem('receipt_lang_pref');
    applyLanguageUI();
    const rawData = localStorage.getItem('receipt_personal_draft');
    if (rawData) {
        const data = JSON.parse(rawData);
        document.getElementById('vendor-info').value = data.vendor || '';
        document.getElementById('customer-info').value = data.customer || '';
        document.getElementById('receipt-remark').value = data.remark || '';
        document.getElementById('receipt-no').value = data.receiptNo || 'RE-2026001';
    } else {
        document.getElementById('vendor-info').value = "นายตัวอย่าง ขยันทำมาหากิน\nเลขประจำตัวประชาชน: 1-2345-67890-12-3\nที่อยู่: 99/9 หมู่ 1 ต.บ้านโฮ่ง อ.บ้านโฮ่ง จ.ลำพูน 51150\nโทร: 081-234-5678";
        document.getElementById('receipt-remark').value = "ชำระโดย: [ ] เงินสด  [✓] โอนผ่านธนาคาร\nธนาคารกสิกรไทย (KBANK)\nเลขที่บัญชี: 012-3-45678-9";
    }
    const savedLogo = localStorage.getItem('receipt_logo_base64');
    if (savedLogo) displayLogo(savedLogo);
    calculateReceipt();
}

function previewLogo(input) {
    if (input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) { displayLogo(e.target.result); localStorage.setItem('receipt_logo_base64', e.target.result); };
        reader.readAsDataURL(input.files[0]);
    }
}

function displayLogo(base64Src) {
    document.getElementById('logo-img').src = base64Src;
    document.getElementById('logo-preview-container').style.display = 'block';
    document.getElementById('btn-remove-logo').style.display = 'inline-block';
}

function removeLogo() {
    document.getElementById('logo-input').value = "";
    document.getElementById('logo-preview-container').style.display = 'none';
    document.getElementById('btn-remove-logo').style.display = 'none';
    localStorage.removeItem('receipt_logo_base64');
}

function prepareDOMForExport() {
    document.querySelectorAll('#receipt-area textarea, #receipt-area input[type="text"]').forEach(el => {
        const textDiv = document.createElement('div');
        textDiv.className = 'temp-export-text';
        textDiv.style.width = '100%';
        textDiv.style.fontSize = window.getComputedStyle(el).fontSize;
        textDiv.style.fontWeight = window.getComputedStyle(el).fontWeight;
        textDiv.style.textAlign = window.getComputedStyle(el).textAlign;
        textDiv.style.whiteSpace = 'pre-wrap';
        textDiv.style.wordBreak = 'break-all';
        textDiv.style.overflowWrap = 'break-word';
        textDiv.style.color = '#1e293b';
        textDiv.style.padding = '4px';
        textDiv.textContent = el.value || el.getAttribute('placeholder') || '';
        el.style.display = 'none';
        el.parentNode.appendChild(textDiv);
    });
}

function restoreDOMAfterExport() {
    document.querySelectorAll('#receipt-area .temp-export-text').forEach(div => div.remove());
    document.querySelectorAll('#receipt-area textarea, #receipt-area input').forEach(el => el.style.display = '');
    triggerAllAutoGrow();
}

function exportToPNG() {
    const receiptElement = document.getElementById('receipt-area');
    prepareDOMForExport();
    receiptElement.classList.add('exporting');
    setTimeout(() => {
        html2canvas(receiptElement, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff" }).then(canvas => {
            const link = document.createElement('a');
            link.download = (document.getElementById('receipt-no').value || 'receipt') + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            receiptElement.classList.remove('exporting');
            restoreDOMAfterExport();
        }).catch(err => { console.error(err); receiptElement.classList.remove('exporting'); restoreDOMAfterExport(); });
    }, 50);
}

function exportToPDF() {
    const receiptElement = document.getElementById('receipt-area');
    prepareDOMForExport();
    receiptElement.classList.add('exporting');
    setTimeout(() => {
        html2canvas(receiptElement, { scale: 2, useCORS: true, backgroundColor: "#ffffff" }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
            pdf.save((document.getElementById('receipt-no').value || 'receipt') + '.pdf');
            receiptElement.classList.remove('exporting');
            restoreDOMAfterExport();
        }).catch(err => { console.error(err); receiptElement.classList.remove('exporting'); restoreDOMAfterExport(); });
    }, 50);
}