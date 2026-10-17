/* =================================================================
   🚨 UDG CENTRAL CONTROL DESK - MAIN MOTOR ENGINE (admin-js.js)
   [COMPLETE & FIXED MASTER SCRIPT]
================================================================= */

const MASTER_ADMIN_PASS = "udg2026"; // 🔑 รหัสผ่านแอดมินส่วนกลาง

// 🔐 ระบบยืนยันรหัสความปลอดภัยเข้าหน้าแอดมินส่วนกลาง
function checkGateLogin() {
    const passInput = document.getElementById("gatePasscodeInput");
    if (!passInput) return;
    const userInput = passInput.value.trim();
    if (userInput === MASTER_ADMIN_PASS) {
        sessionStorage.setItem("udg_admin_authenticated", "true");
        unlockCentralPanel();
    } else {
        alert("❌ ACCESS DENIED:\nรหัสผ่านลับผู้ดูแลระบบไม่ถูกต้อง! โปรดระบุใหม่อีกครั้งครับน้า");
        passInput.value = "";
        passInput.focus();
    }
}

function unlockCentralPanel() {
    const overlay = document.getElementById("gateOverlay");
    const menu = document.getElementById("adminTabsMenu");
    if (overlay) overlay.style.display = "none";
    if (menu) menu.style.display = "flex";
    switchTabMenu("overviewPanelBox");
}

function kickUserToHome() { 
    window.location.href = "index.html"; 
}

function switchTabMenu(targetId) {
    document.querySelectorAll(".admin-box").forEach(box => { box.style.display = "none"; });
    document.querySelectorAll(".tab-trigger-btn").forEach(btn => { btn.classList.remove("active"); });
    
    const targetBox = document.getElementById(targetId);
    if (targetBox) targetBox.style.display = "block";
    
    const activeBtn = document.querySelector(`.tab-trigger-btn[data-target="${targetId}"]`);
    if (activeBtn) activeBtn.classList.add("active");
}

// ─── 🔄 ⚡ ฟังก์ชันประมวลผลกล่อง Live Preview การ์ดข่าวสาร ───
function updateLivePreview() {
    const subTagEl = document.getElementById("adminNewsSubTag");
    const titleEl = document.getElementById("adminNewsTitle");
    const imgEl = document.getElementById("adminNewsImg");
    const excerptEl = document.getElementById("adminNewsExcerpt");

    const subTagInput = subTagEl ? subTagEl.value.trim() : "";
    const titleInput = titleEl ? titleEl.value.trim() : "";
    const imgInput = imgEl ? imgEl.value.trim() : "";
    const excerptInput = excerptEl ? excerptEl.value.trim() : "";

    const mockupTag = document.getElementById("mockupTag");
    const mockupTitle = document.getElementById("mockupTitle");
    const mockupExcerpt = document.getElementById("mockupExcerpt");
    const mockupImage = document.getElementById("mockupImage");

    if (mockupTag) mockupTag.innerText = subTagInput ? subTagInput : "NEWS";
    if (mockupTitle) mockupTitle.innerText = titleInput ? titleInput : "หัวข้อข่าวสารจำลองประจำค่าย...";
    if (mockupExcerpt) mockupExcerpt.innerText = excerptInput ? excerptInput : "คำอธิบายข่าวโปรยฟีดจะปรากฏตรงนี้...";
    if (mockupImage) mockupImage.src = imgInput ? imgInput : "image/ขาวใส.png";
}

function updateLogoPreview() {
    const imgEl = document.getElementById("newPartnerImg");
    const imgUrl = imgEl ? imgEl.value.trim() : "";
    const mockupPartnerLogo = document.getElementById("mockupPartnerLogo");
    if (mockupPartnerLogo) mockupPartnerLogo.src = imgUrl ? imgUrl : "image/ขาวใส.png";
}

// ─── 📡 เชื่อมโยงระบบฐานข้อมูลออนไลน์ FIREBASE ───
const firebaseConfig = {
  apiKey: "AIzaSyClMPrhjK_XLaY2PBAEuP7hvxK4faFdLJk",
  authDomain: "udg-caht.firebaseapp.com",
  projectId: "udg-caht",
  storageBucket: "udg-caht.firebasestorage.app",
  messagingSenderId: "864209418067",
  appId: "1:864209418067:web:b3c724198275f4a73b53a6",
  databaseURL: "https://udg-caht-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app();
}
const database = firebase.database();

// 📰 [ระบบแท็บที่ 1] CONTENT ข่าวสาร
function toggleRadarLinkField() {
    const tagEl = document.getElementById('adminNewsTag');
    if (!tagEl) return;
    const targetZone = tagEl.value;
    const radarUrlGroup = document.getElementById('radarUrlGroup');
    const titleLabel = document.getElementById('titleLabel');
    const excerptLabel = document.getElementById('excerptLabel');
    const subTagInput = document.getElementById('adminNewsSubTag');

    if (targetZone.startsWith('RADAR')) {
        if (radarUrlGroup) radarUrlGroup.style.display = 'flex'; 
        if (titleLabel) titleLabel.innerText = "ARTIST NAME"; 
        if (excerptLabel) excerptLabel.innerText = "ARTIST BIO";
        if (subTagInput) {
            if (targetZone === 'RADAR_1') subTagInput.value = "DRILL"; 
            if (targetZone === 'RADAR_2') subTagInput.value = "TRAP";
        }
    } else if (targetZone === 'FEATURED') {
        if (radarUrlGroup) radarUrlGroup.style.display = 'none'; 
        if (titleLabel) titleLabel.innerText = "FEATURED TITLE"; 
        if (excerptLabel) excerptLabel.innerText = "FEATURED EXCERPT"; 
        if (subTagInput) subTagInput.value = "BREAKING";
    } else {
        if (radarUrlGroup) radarUrlGroup.style.display = 'none'; 
        if (titleLabel) titleLabel.innerText = "NEWS TITLE"; 
        if (excerptLabel) excerptLabel.innerText = "NEWS EXCERPT"; 
        if (subTagInput) subTagInput.value = "NEWS";
    }
    updateLivePreview();
}

function successAction() { 
    const titleEl = document.getElementById('adminNewsTitle');
    const excerptEl = document.getElementById('adminNewsExcerpt');
    if (titleEl) titleEl.value = '';
    if (excerptEl) excerptEl.value = '';
    alert("🔥 อัปเดตข้อมูลขึ้นหน้าเว็บหลักเรียบร้อยครับน้า!");
    updateLivePreview();
}

// 🎵 [ระบบแท็บที่ 2] จัดการตู้เซ็ตเพลงโหวตประจำเดือน
function getAdminCurrentMonthKey() {
    const d = new Date();
    let yyyy = d.getFullYear();
    let mm = d.getMonth() + 1;
    let dd = d.getDate();
    let hh = d.getHours();
    let min = d.getMinutes();

    if (dd === 1 && hh === 0 && min === 0) {
        let prev = new Date(d.getTime() - 60000);
        yyyy = prev.getFullYear();
        mm = prev.getMonth() + 1;
    }
    mm = String(mm).padStart(2, '0');
    return `month_${yyyy}_${mm}`;
}

function listenToCurrentMonthTracks() {
    const trackTbody = document.getElementById('track-list-tbody');
    if (!trackTbody) return;
    const currentMonthId = getAdminCurrentMonthKey();
    database.ref(`udg_monthly_tracks_vault/${currentMonthId}`).on('value', (s) => {
        trackTbody.innerHTML = ''; 
        const monthlyTracks = s.val();
        
        if (!monthlyTracks) { 
            trackTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center;">🎵 เซ็ตโหวตเดือนนี้ยังว่างเปล่า สาดเพลงเซ็ตใหม่บรรทัดบนได้เลยครับน้า!</td></tr>`; 
            return; 
        }
        
        Object.keys(monthlyTracks).forEach(key => {
            const track = monthlyTracks[key]; 
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><strong>${track.title}</strong><br><span style="color:#555; font-size:0.75rem;">${track.artist}</span></td><td style="color:#00ffff; font-family:monospace;">${track.ytId}</td><td><button class="delete-artist-btn" onclick="removeTrackFromCurrentMonth('${key}')">// REMOVE</button></td>`;
            trackTbody.appendChild(tr);
        });
    });
}

function removeTrackFromCurrentMonth(trackKey) { 
    const currentMonthId = getAdminCurrentMonthKey(); 
    if (confirm("คุณต้องการถอดเพลงนี้ออกใช่หรือไม่?")) {
        database.ref(`udg_monthly_tracks_vault/${currentMonthId}/${trackKey}`).remove(); 
    }
}

// 🎤 [ระบบแท็บที่ 3] มอบสิทธิ์คีย์แร็ปเปอร์
function removeArtistFromCloud(k) { 
    if (confirm(`คุณต้องการลบสิทธิ์แร็ปเปอร์ ${k} ใช่หรือไม่?`)) {
        database.ref(`udg_artist_credentials/${k}`).remove(); 
    }
}

// 💸 [ระบบแท็บที่ 4] ป้ายโฆษณาหมุนเวียน
function removeAdFromCloud(k) { 
    if (confirm("ต้องการลบป้ายโฆษณานี้ใช่หรือไม่?")) {
        database.ref(`udg_live_advertisements/${k}`).remove(); 
    }
}

// 🗳️ [ระบบแท็บที่ 5] ล็อกชาร์ตปิดยอดแชมป์เพลง
function deleteArchiveLog(logKey) { 
    if (confirm(`คุณต้องการลบแฟ้มบันทึกประวัติเซ็ต ${logKey} ใช่หรือไม่?`)) {
        database.ref(`udg_votes_archive_logs/${logKey}`).remove(); 
    }
}

// 🤝 [ระบบแท็บที่ 6] โลโก้แบรนด์สปอนเซอร์
function removePartnerLogo(key) { 
    if (confirm("คุณต้องการถอดถอนโลโก้พาร์ทเนอร์เจ้านี้ใช่หรือไม่?")) {
        database.ref(`udg_culture_partners_logos/${key}`).remove(); 
    }
}

// 📅🤝 [ระบบแท็บที่ 7] จัดการและอัปเดตสถานะคอนเสิร์ต
function updateGigStatusLive(gigKey) {
    const selectElement = document.getElementById(`status-select-${gigKey}`);
    if (!selectElement) return;
    const newStatus = selectElement.value;
    database.ref(`udg_upcoming_gigs/${gigKey}`).update({
        status: newStatus
    }, (error) => {
        if (!error) {
            alert("🔥 สับเปลี่ยนสถานะไฟหน้าบ้านเรียบร้อยครับน้าบักหำทิว!");
        } else {
            alert("❌ เกิดข้อผิดพลาดทางระบบคลาวด์ กรุณาลองใหม่อีกครั้งครับน้า");
        }
    });
}

function removeGigFromCloud(key) { 
    if (confirm("แจ้งเตือนแอดมิน: คุณต้องการลบรายการอีเวนต์คอนเสิร์ตเจ้านี้ออกจากระบบหน้าจอหลักใช่หรือไม่?")) { 
        database.ref(`udg_upcoming_gigs/${key}`).remove(); 
    } 
}

// 🎡 [ระบบแท็บที่ 8] จัดการล็อกเปอร์เซ็นต์เรทโอกาสดร็อปไอเทมวงล้อส่วนกลาง
function removeRewardFromWheelCloud(key) {
    if (!key) return;
    if (confirm("🚨 ยืนยันการลบรายการของรางวัลนี้ออกจากระบบวงล้อส่วนกลาง?")) {
        database.ref(`udg_lucky_wheel_rewards/${key}`).remove().then(() => {
            alert("🔥 ลบรายการของรางวัลเรียบร้อยแล้ว!");
        }).catch((error) => {
            alert(`❌ เกิดข้อผิดพลาดในการลบ: ${error.message}`);
        });
    }
}

// 🔍 🎰 ADMINDESK: ENGINE สแกนประวัติและระบบเคลมทำลายดาต้าถาวร
let globalAllUsersRewardsCache = [];

function renderFilteredUserRewards(filterText) {
    const adminUserRewardsTbody = document.getElementById('admin-user-rewards-tbody');
    if (!adminUserRewardsTbody) return;
    adminUserRewardsTbody.innerHTML = '';
    const query = filterText.toLowerCase().trim();

    if (globalAllUsersRewardsCache.length === 0) {
        adminUserRewardsTbody.innerHTML = `<tr><td colspan="4" style="color:#555; text-align:center; padding: 20px;">📦 ไม่มีประวัติข้อมูลตั๋วคูปองค้างในระบบ</td></tr>`;
        return;
    }

    const filteredList = globalAllUsersRewardsCache.filter(item => {
        const ticketStr = item.ticketId ? item.ticketId.toLowerCase() : "";
        const nameStr = item.accountName ? item.accountName.toLowerCase() : "";
        const rewardStr = item.rewardName ? item.rewardName.toLowerCase() : "";
        return nameStr.includes(query) || rewardStr.includes(query) || ticketStr.includes(query);
    });

    if (filteredList.length === 0) {
        adminUserRewardsTbody.innerHTML = `<tr><td colspan="4" style="color:#ff007f; text-align:center; padding: 15px;">❌ ไม่พบข้อมูลที่ตรงกับ "[ ${filterText} ]"</td></tr>`;
        return;
    }

    filteredList.forEach(item => {
        const tr = document.createElement('tr');
        const dateStr = new Date(item.timestamp).toLocaleString('th-TH', { 
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
        const currentTicketId = item.ticketId ? item.ticketId : "NO-ID";
        
        tr.innerHTML = `
            <td style="color:#fff; font-weight:bold;"><i class="fa-solid fa-circle-user" style="color:#00ffff; font-size:0.85rem; margin-right:5px;"></i> ${item.accountName}</td>
            <td>
                <span style="color:#ffaa00; font-family:monospace; font-weight:bold; display:block;">[ ${item.rewardName} ]</span>
                <span style="color:#00ffff; font-family:monospace; font-size:0.75rem; font-weight:bold; background:rgba(0,242,254,0.05); padding:1px 6px; border-radius:2px; border:1px solid rgba(0,242,254,0.2); margin-top:3px; display:inline-block;">CODE: ${currentTicketId}</span>
            </td>
            <td style="color:#aaa; font-size:0.75rem; font-family:monospace;">${dateStr}</td>
            <td style="text-align: center;">
                <button type="button" class="delete-artist-btn" style="color:#ff3333; font-weight:800; background:rgba(255,51,51,0.03); border:1px solid rgba(255,51,51,0.2); padding:5px 10px; border-radius:4px; cursor:pointer;" onclick="markCouponAsUsedInCloud('${item.userUid}', '${item.couponKey}', '${currentTicketId}')">
                    <i class="fa-solid fa-eraser"></i> USED
                </button>
            </td>
        `;
        adminUserRewardsTbody.appendChild(tr);
    });
}

function markCouponAsUsedInCloud(userUid, couponKey, ticketId) {
    if (!userUid || !ticketId || ticketId === "NO-ID" || ticketId === "NO-CODE") {
        alert("❌ ข้อผิดพลาด: ไม่สามารถดึงรหัสตั๋วหรือไอดีผู้ใช้มาประมวลผลลัพธ์ได้ครับน้า");
        return;
    }
    
    if (confirm(`🚨 ยืนยันการเคลมสิทธิ์และทำลายตั๋วรหัส [ ${ticketId} ] ใช่หรือไม่?\n(ตั๋วใบนี้จะโดนลบถาวรออกจากตู้เซฟผู้ใช้หน้าบ้านและตารางแอดมินพร้อมกันออโต้ครับน้าบักหำทิว)`)) {
        const userRef = database.ref(`users_rewards_vault/${userUid}`);
        
        userRef.once('value')
            .then((snapshot) => {
                const items = snapshot.val();
                if (!items) {
                    alert("❌ สัญญาณขาดหาย: ไม่พบข้อมูลคูปองหลงเหลือในตู้เซฟของผู้ใช้รายนี้แล้วครับ");
                    return;
                }
                
                let targetRealFirebaseKey = null;
                Object.keys(items).forEach(actualKey => {
                    if (items[actualKey] && (items[actualKey].ticketId === ticketId || items[actualKey].voucherCode === ticketId)) {
                        targetRealFirebaseKey = actualKey;
                    }
                });
                
                if (targetRealFirebaseKey) {
                    userRef.child(targetRealFirebaseKey).remove()
                        .then(() => {
                            alert(`🔥 สำเร็จเสร็จสรรพ! เคลียร์สิทธิ์ตั๋วรหัส ${ticketId} ออกจากระบบเรียบร้อยครับน้าบักหำทิว!`);
                        })
                        .catch((error) => {
                            alert(`❌ Firebase Rules สั่งบล็อกการลบ: ${error.message}`);
                        });
                } else {
                    userRef.child(couponKey).remove()
                        .then(() => { alert(`🔥 ลบด้วยแผนสำรองรหัส ${ticketId} สำเร็จครับน้า`); })
                        .catch((err) => { alert(`❌ เกิดความผิดพลาดในการเข้าถึงเป้าหมายตั๋ว: ${err.message}`); });
                }
            })
            .catch((error) => {
                alert(`❌ ไม่สามารถเข้าถึงสายสัญญาณระบบคลาวด์ได้: ${error.message}`);
            });
    }
}

// ─── 📥 DEMO DROPBOX ENGINE ───
function deleteDemoTrack(key) {
    if (confirm("🚨 แจ้งเตือนแอดมิน: คุณฟังเพลงนี้และต้องการลบออกจากกล่องข้อความแล้วใช่หรือไม่?")) {
        database.ref(`udg_demo_dropbox/${key}`).remove()
            .then(() => { alert("🔥 ล้างกล่องจดหมายเรียบร้อยครับน้า!"); })
            .catch((err) => { alert("❌ เกิดข้อผิดพลาดในการลบ: " + err.message); });
    }
}

// ─── 🛒 ADMIN MERCH ORDERS ENGINE ───
function verifyOrderPayment(key) {
    if (confirm("น้าเช็กแอปธนาคารแล้วใช่ไหมว่ายอดโอนเงินเข้าจริง? ถ้ายืนยันแล้วระบบจะปรับสถานะเป็น จ่ายแล้ว ทันที")) {
        database.ref(`udg_merch_orders/${key}`).update({ status: 'VERIFIED' });
    }
}

function deleteOrder(key) {
    if (confirm("ต้องการลบออเดอร์นี้ออกจากระบบใช่หรือไม่? (แพ็กของส่งเสร็จแล้วค่อยลบนะน้า)")) {
        database.ref(`udg_merch_orders/${key}`).remove();
    }
}

// ─── 📸 ADMIN AUTO IMAGE UPLOADER (ImgBB) ───
const ADMIN_IMGBB_API_KEY = "ba210b7b494a630b713c297b74f51d65"; 

function setupImgbbAutoUploader(fileInputId, urlInputId, statusTextId, previewCallback) {
    const fileInput = document.getElementById(fileInputId);
    const urlInput = document.getElementById(urlInputId);
    const statusText = document.getElementById(statusTextId);

    if (!fileInput || !urlInput) return;

    fileInput.addEventListener('change', async function() {
        const file = this.files[0];
        if (!file) return;

        if (statusText) {
            statusText.style.display = 'block';
            statusText.style.color = '#ffaa00';
            statusText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> UPLOADING TO CLOUD...';
        }
        urlInput.disabled = true;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${ADMIN_IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                urlInput.value = data.data.url;
                if (previewCallback) previewCallback(); 
                
                if (statusText) {
                    statusText.style.color = '#39ff14';
                    statusText.innerHTML = '<i class="fa-solid fa-circle-check"></i> UPLOAD SUCCESS!';
                    setTimeout(() => { statusText.style.display = 'none'; }, 4000);
                }
            } else {
                throw new Error("เซิร์ฟเวอร์ ImgBB ปฏิเสธการรับรูปภาพ");
            }
        } catch (error) {
            alert("❌ อัปโหลดรูปภาพล้มเหลว: " + error.message);
            if (statusText) statusText.style.display = 'none';
        } finally {
            urlInput.disabled = false;
            this.value = '';
        }
    });
}

// ─── 🤝 ADMIN COLLAB BOARD ENGINE ───
function deleteCollabAd(key) {
    if (confirm("🚨 ต้องการลบประกาศนี้ออกจากบอร์ดใช่หรือไม่?")) {
        database.ref(`udg_collab_board/${key}`).remove();
    }
}

// ─── 💿 ADMIN ALBUM DISCUSSIONS ENGINE ───
function deleteAlbumData(albumKey) {
    if (confirm("🚨 คำเตือนขั้นเด็ดขาด: คุณต้องการลบอัลบั้มนี้ใช่หรือไม่?\n\n(หากกดยืนยัน ระบบจะทำลายแชทรีวิว และคะแนนดาวทั้งหมดของอัลบั้มนี้ทิ้งแบบถาวร!)")) {
        database.ref(`udg_albums/${albumKey}`).remove()
            .then(() => {
                database.ref(`udg_album_comments/${albumKey}`).remove();
                database.ref(`udg_album_ratings/${albumKey}`).remove();
                alert("🔥 ทำลายข้อมูลอัลบั้ม แชท และเรทติ้งดาว เรียบร้อยครับน้าบักหำทิว!");
            })
            .catch((err) => {
                alert("❌ เกิดข้อผิดพลาด: " + err.message);
            });
    }
}

// ─── 📊 ADMIN COMMAND CENTER ENGINE & CHART ANALYTICS ───
let trafficChartInstance = null;
let activitiesChartInstance = null;

async function processAnalyticsCharts(forceMonthMode = false) {
    const statsDatePicker = document.getElementById('statsDatePicker');
    const selectedDate = statsDatePicker ? statsDatePicker.value : new Date().toISOString().split('T')[0];
    const targetYear = selectedDate.split('-')[0];

    let realOrdersCount = 0;
    let lineLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
    let lineData = [0, 0, 0, 0, 0, 0];

    if (forceMonthMode) {
        lineLabels = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        lineData = new Array(12).fill(0);
    }

    try {
        try {
            const ordersSnap = await database.ref('udg_merch_orders').once('value');
            realOrdersCount = ordersSnap.exists() ? ordersSnap.numChildren() : 0;
        } catch (err) {
            console.warn("⚠️ ดึงออเดอร์ไม่ได้:", err.message);
        }

        const countDemos = parseInt(document.getElementById('dashDemos')?.innerText || 0);
        const countGraffiti = parseInt(document.getElementById('dashGraffiti')?.innerText || 0);
        const countCases = parseInt(document.getElementById('dashCases')?.innerText || 0);

        renderActivitiesPieChart(countGraffiti, countCases, countDemos, realOrdersCount);

        try {
            if (forceMonthMode) {
                const viewsSnap = await database.ref('udg_page_views').once('value');
                if (viewsSnap.exists()) {
                    const allViews = viewsSnap.val();
                    Object.keys(allViews).forEach(dateKey => {
                        if (dateKey.startsWith(targetYear)) {
                            const monthIndex = parseInt(dateKey.split('-')[1]) - 1;
                            const hoursObj = allViews[dateKey];
                            let dailyTotal = 0;
                            Object.values(hoursObj).forEach(count => dailyTotal += count);
                            lineData[monthIndex] += dailyTotal;
                        }
                    });
                }
            } else {
                const viewsSnap = await database.ref(`udg_page_views/${selectedDate}`).once('value');
                if (viewsSnap.exists()) {
                    const hoursObj = viewsSnap.val();
                    Object.keys(hoursObj).forEach(hour => {
                        const h = parseInt(hour);
                        const count = hoursObj[hour];
                        if (h >= 0 && h < 4) lineData[0] += count;
                        else if (h >= 4 && h < 8) lineData[1] += count;
                        else if (h >= 8 && h < 12) lineData[2] += count;
                        else if (h >= 12 && h < 16) lineData[3] += count;
                        else if (h >= 16 && h < 20) lineData[4] += count;
                        else if (h >= 20 && h <= 23) lineData[5] += count;
                    });
                }
            }
        } catch (err) {
            console.warn("⚠️ ดึงยอดวิวไม่ได้:", err.message);
        }

        renderTrafficLineChart(lineLabels, lineData);

    } catch (mainError) {
        console.error("❌ ระบบกราฟขัดข้อง:", mainError);
        renderTrafficLineChart(lineLabels, lineData);
    }
}

function renderTrafficLineChart(labels, data) {
    const ctx = document.getElementById('trafficLineChart')?.getContext('2d');
    if (!ctx) return;

    if (trafficChartInstance) { trafficChartInstance.destroy(); }

    trafficChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'จำนวนผู้เข้าชม (คน)',
                data: data,
                borderColor: '#00aaff',
                backgroundColor: 'rgba(0, 170, 255, 0.05)',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointHoverRadius: 7,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#151515' }, ticks: { color: '#666' } },
                x: { grid: { display: false }, ticks: { color: '#666' } }
            }
        }
    });
}

function renderActivitiesPieChart(graffiti, cases, demos, orders) {
    const ctx = document.getElementById('activitiesPieChart')?.getContext('2d');
    if (!ctx) return;

    if (activitiesChartInstance) { activitiesChartInstance.destroy(); }

    const total = graffiti + cases + demos + orders;
    const finalData = total === 0 ? [1, 1, 1, 1] : [graffiti, cases, demos, orders];

    activitiesChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['พ่นสีแชท', 'เปิดกล่องสุ่ม', 'ส่ง Demo เพลง', 'สั่งซื้อสินค้า'],
            datasets: [{
                data: finalData,
                backgroundColor: ['#00ffff', '#ff007f', '#ff4500', '#ffaa00'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#ccc', font: { family: 'Kanit' }, boxWidth: 12 }
                }
            }
        }
    });
}

function pushLiveCommandLog(username, action) {
    const tbody = document.getElementById('commandLiveLogsTbody');
    if (!tbody) return;
    
    if (tbody.innerHTML.includes('กำลังเปิดสถานีเชื่อมสาย')) { tbody.innerHTML = ''; }

    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="color:#555; font-family:monospace;">⏳ ${timeStr}</td>
        <td style="color:#ffaa00; font-weight:bold;"><i class="fa-solid fa-user-ninja"></i> ${username}</td>
        <td style="color:#fff;">${action}</td>
    `;
    
    tbody.insertBefore(tr, tbody.firstChild);
    if (tbody.children.length > 30) { tbody.removeChild(tbody.lastChild); }
}

// 🎟️ ADMIN GIFT VOUCHERS ENGINE
function editVoucherStock(key, currentRemaining, currentTotal) {
    const newRemainingStr = prompt(`แก้ไขจำนวนสิทธิ์คงเหลือ (ปัจจุบัน: ${currentRemaining} ใบ):`, currentRemaining);
    if (newRemainingStr === null) return;
    const newRemaining = parseInt(newRemainingStr);

    const newTotalStr = prompt(`แก้ไขจำนวนสิทธิ์ทั้งหมด (ปัจจุบัน: ${currentTotal} ใบ):`, currentTotal);
    if (newTotalStr === null) return;
    const newTotal = parseInt(newTotalStr);

    if (isNaN(newRemaining) || isNaN(newTotal) || newRemaining < 0 || newTotal < 1) {
        alert("❌ ข้อมูลจำนวนสิทธิ์ไม่ถูกต้อง!");
        return;
    }

    database.ref(`udg_events_vouchers/${key}`).update({
        remainingQuantity: newRemaining,
        totalQuantity: newTotal
    }).then(() => {
        alert("🔥 อัปเดตจำนวนสิทธิ์ Gift Voucher เรียบร้อยแล้ว!");
    }).catch(err => {
        alert("❌ เกิดข้อผิดพลาด: " + err.message);
    });
}

function toggleVoucherActive(key, currentStatus) {
    database.ref(`udg_events_vouchers/${key}`).update({
        active: !currentStatus
    });
}

function deleteVoucherData(key) {
    if (confirm("🚨 คุณต้องการลบรายการ Gift Voucher งานนี้ใช่หรือไม่?")) {
        database.ref(`udg_events_vouchers/${key}`).remove();
    }
}


// =================================================================
// 🚀 DOMCONTENTLOADED - REALTIME LISTENERS & EVENT BINDINGS
// =================================================================
document.addEventListener('DOMContentLoaded', () => {

    // 🔐 ตรวจสอบสถานะการ Auth ล็อกอิน
    if (sessionStorage.getItem("udg_admin_authenticated") === "true") { 
        unlockCentralPanel(); 
    }

    const gatePassInput = document.getElementById("gatePasscodeInput");
    if (gatePassInput) {
        gatePassInput.addEventListener("keypress", function(e) { 
            if (e.key === "Enter") checkGateLogin(); 
        });
    }

    // 📌 สวิตช์สลับแท็บ
    document.querySelectorAll(".tab-trigger-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target");
            switchTabMenu(target);
        });
    });

    // 📰 [แท็บ 1] โพสต์ข่าวสาร
    const postNewsBtn = document.getElementById('adminPostNewsBtn');
    if (postNewsBtn) {
        postNewsBtn.addEventListener('click', () => {
            const zone = document.getElementById('adminNewsTag').value;
            const subTag = document.getElementById('adminNewsSubTag').value.trim();
            const title = document.getElementById('adminNewsTitle').value.trim();
            const img = document.getElementById('adminNewsImg').value.trim();
            const excerpt = document.getElementById('adminNewsExcerpt').value.trim();
            const radarUrl = document.getElementById('adminRadarUrl').value.trim();
            
            if (!title || !excerpt) { alert("❌ กรุณากรอกข้อมูลให้ครบถ้วนก่อนกดอัปเดตครับน้า!"); return; }
            
            const dataPayload = { tag: subTag ? subTag : zone, title: title, image: img ? img : 'image/ขาวใส.png', excerpt: excerpt, timestamp: Date.now() };
            if (zone.startsWith('RADAR')) dataPayload.followUrl = radarUrl ? radarUrl : "#";
            
            if (zone === 'NEWS') { database.ref('udg_news_drops').push(dataPayload, (e) => { if(!e) successAction(); }); }
            else if (zone === 'FEATURED') { database.ref('udg_homepage_slots/featured_card').set(dataPayload, (e) => { if(!e) successAction(); }); }
            else if (zone === 'RADAR_1') { database.ref('udg_homepage_slots/radar_card_1').set(dataPayload, (e) => { if(!e) successAction(); }); }
            else if (zone === 'RADAR_2') { database.ref('udg_homepage_slots/radar_card_2').set(dataPayload, (e) => { if(!e) successAction(); }); }
        });
    }

    // 🎵 [แท็บ 2] เพลงโหวตประจำเดือน
    listenToCurrentMonthTracks();
    const addTrackBtn = document.getElementById('addTrackBtn');
    if (addTrackBtn) {
        addTrackBtn.addEventListener('click', () => {
            const currentMonthId = getAdminCurrentMonthKey(); 
            const title = document.getElementById('newTrackTitle').value.trim(); 
            const artist = document.getElementById('newTrackArtist').value.trim(); 
            const ytId = document.getElementById('newTrackYtId').value.trim();
            
            if (!title || !artist || !ytId) { alert("❌ กรุณากรอกรายละเอียดช่องเพลงให้ครบถ้วนก่อนครับน้า!"); return; }
            
            const trackRandomId = "track_" + Date.now();
            database.ref(`udg_monthly_tracks_vault/${currentMonthId}/${trackRandomId}`).set({ 
                id: trackRandomId, 
                title: title, 
                artist: artist, 
                ytId: ytId 
            }, (err) => { 
                if (!err) { 
                    document.getElementById('newTrackTitle').value = ''; 
                    document.getElementById('newTrackArtist').value = ''; 
                    document.getElementById('newTrackYtId').value = ''; 
                    alert(`🔥 สาดเพลงใหม่สำเร็จแล้วครับน้า!`); 
                } 
            });
        });
    }

    // 🎤 [แท็บ 3] ศิลปิน/แร็ปเปอร์
    const artistTbody = document.getElementById('artist-list-tbody');
    database.ref('udg_artist_credentials').on('value', (s) => {
        if (!artistTbody) return;
        artistTbody.innerHTML = ''; 
        const list = s.val(); 
        if (!list) { artistTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center;">🎤 ยังไม่มีรายชื่อแร็ปเปอร์</td></tr>`; return; }
        Object.keys(list).forEach(k => {
            const tr = document.createElement('tr'); 
            tr.innerHTML = `<td style="color:#ffaa00; font-weight:bold;">${k}</td><td style="color:#aaa;">${list[k]}</td><td><button class="delete-artist-btn" onclick="removeArtistFromCloud('${k}')">// REMOVE</button></td>`; 
            artistTbody.appendChild(tr);
        });
    });

    const addArtistBtn = document.getElementById('addArtistBtn');
    if (addArtistBtn) {
        addArtistBtn.addEventListener('click', () => {
            let name = document.getElementById('newArtistName').value.trim(); 
            const pass = document.getElementById('newArtistPass').value.trim();
            if (!name || !pass) { alert("❌ กรุณากรอกข้อมูลศิลปินให้ครบถ้วนก่อน!"); return; }
            if (!name.startsWith('@')) name = '@' + name;
            database.ref(`udg_artist_credentials/${name}`).set(pass, (err) => { 
                if (!err) { 
                    document.getElementById('newArtistName').value = ''; 
                    document.getElementById('newArtistPass').value = ''; 
                    alert(`🔥 เพิ่มสิทธิ์แร็ปเปอร์ ${name} สำเร็จ!`); 
                } 
            });
        });
    }

    // 💸 [แท็บ 4] โฆษณา
    const adTbody = document.getElementById('ad-list-tbody');
    database.ref('udg_live_advertisements').on('value', (s) => {
        if (!adTbody) return;
        adTbody.innerHTML = ''; 
        const ads = s.val(); 
        if (!ads) { adTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center;">💸 ยังไม่มีโฆษณาหมุนเวียน</td></tr>`; return; }
        Object.keys(ads).forEach(k => {
            const tr = document.createElement('tr'); 
            tr.innerHTML = `<td style="color:#39ff14;">${ads[k].title}</td><td style="color:#aaa; font-size:0.8rem;">${ads[k].url}</td><td><button class="delete-artist-btn" onclick="removeAdFromCloud('${k}')">// REMOVE</button></td>`; 
            adTbody.appendChild(tr);
        });
    });

    const addAdBtn = document.getElementById('addAdBtn');
    if (addAdBtn) {
        addAdBtn.addEventListener('click', () => {
            const title = document.getElementById('newAdTitle').value.trim(); 
            const desc = document.getElementById('newAdDesc').value.trim(); 
            const img = document.getElementById('newAdImage').value.trim(); 
            const url = document.getElementById('newAdUrl').value.trim();
            if (!title || !desc) { alert("❌ กรุณากรอกรายละเอียดโฆษณาให้ครบถ้วน!"); return; }
            database.ref('udg_live_advertisements').push({ title: title, description: desc, image: img ? img : "", url: url ? url : "#" }, (err) => { 
                if (!err) { 
                    document.getElementById('newAdTitle').value = ''; 
                    document.getElementById('newAdDesc').value = ''; 
                    document.getElementById('newAdImage').value = ''; 
                    document.getElementById('newAdUrl').value = '#'; 
                    alert(`🔥 เพิ่มป้ายสปอนเซอร์ "${title}" เข้าคิวเรียบร้อยครับ!`); 
                } 
            });
        });
    }

    // 🗳️ [แท็บ 5] ทำเนียบแชมป์
    const archivedWeeksList = document.getElementById('archivedWeeksList');
    database.ref('udg_votes_archive_logs').on('value', (snapshot) => {
        if (!archivedWeeksList) return;
        archivedWeeksList.innerHTML = ''; 
        const logs = snapshot.val();
        
        if (!logs) { 
            archivedWeeksList.innerHTML = `<li style="color: #555; font-size: 0.85rem;">📜 ทำเนียบประวัติว่างเปล่า</li>`; 
            return; 
        }
        
        Object.keys(logs).forEach(monthKey => {
            const log = logs[monthKey]; 
            const li = document.createElement('li');
            li.style.cssText = "background:#111; padding:10px 15px; border-radius:4px; border-left:3px solid #cc00ff; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;";
            li.innerHTML = `<div><strong style="color:#fff;">🗓️ รอบเดือนเซ็ต: ${monthKey.replace('month_', '').replace(/_/g, '-')}</strong><br><span style="color:#aaa;">🥇 แชมป์ประจำเซ็ต: <span style="color:#00ffff; font-weight:bold;">${log.winnerTitle}</span> - ${log.winnerArtist} (${log.winnerVotes} PTS)</span></div><button class="delete-artist-btn" onclick="deleteArchiveLog('${monthKey}')" style="color:#ff3333;">// DELETE LOG</button>`; 
            archivedWeeksList.appendChild(li);
        });
    });

    const archiveWeeklyBtn = document.getElementById('archiveWeeklyBtn');
    if (archiveWeeklyBtn) {
        archiveWeeklyBtn.addEventListener('click', async () => {
            const currentMonthId = getAdminCurrentMonthKey(); 
            if (!confirm(`🚨 ยืนยันการสรุปชาร์ตและปิดยอดเซ็ตเพลงรอบเดือน [${currentMonthId}] ใช่หรือไม่?`)) return;
            
            const voteSnapshot = await database.ref(`monthly_music_votes/${currentMonthId}`).once('value'); 
            const votesData = voteSnapshot.val() ? voteSnapshot.val() : {};
            
            const trackSnapshot = await database.ref(`udg_monthly_tracks_vault/${currentMonthId}`).once('value'); 
            const monthlyTracks = trackSnapshot.val() ? trackSnapshot.val() : {};
            
            if (Object.keys(monthlyTracks).length === 0) { 
                alert("❌ ไม่มีรายชื่อเพลงเลยครับน้า!"); 
                return; 
            }
            
            let sortedChartList = Object.keys(monthlyTracks).map(key => { 
                const track = monthlyTracks[key]; 
                return { title: track.title, artist: track.artist, votes: votesData[track.id] ? votesData[track.id] : 0 }; 
            });
            
            sortedChartList.sort((a, b) => b.votes - a.votes); 
            const winner = sortedChartList[0];
            const archivePayload = { winnerTitle: winner.title, winnerArtist: winner.artist, winnerVotes: winner.votes, closedTimestamp: Date.now() };
            
            database.ref(`udg_votes_archive_logs/${currentMonthId}`).set(archivePayload, (error) => { 
                if (!error) alert(`🏆 LOCK ARCHIVE SUCCESS!`); 
            });
        });
    }

    // 🤝 [แท็บ 6] พาร์ทเนอร์โลโก้
    const logoTbody = document.getElementById('logo-list-tbody');
    database.ref('udg_culture_partners_logos').on('value', (snapshot) => {
        if (!logoTbody) return;
        logoTbody.innerHTML = ''; 
        const logos = snapshot.val();
        if (!logos) { logoTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center;">🤝 แถบลูปโลโก้ว่างเปล่า</td></tr>`; return; }
        Object.keys(logos).forEach(key => {
            const partner = logos[key]; 
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><strong style="color:#fff000;">${partner.name}</strong></td><td><div style="width:40px; height:40px; background:#000; border:1px solid #222; border-radius:4px; overflow:hidden; display:flex; align-items:center; justify-content:center;"><img src="${partner.image}" alt="Logo" style="width:100%; height:100%; object-fit:contain; filter:grayscale(100%);"></div></td><td><button class="delete-artist-btn" onclick="removePartnerLogo('${key}')" style="color:#ff3333;">// REMOVE</button></td>`;
            logoTbody.appendChild(tr);
        });
    });

    const addPartnerLogoBtn = document.getElementById('addPartnerLogoBtn');
    if (addPartnerLogoBtn) {
        addPartnerLogoBtn.addEventListener('click', () => {
            const name = document.getElementById('newPartnerName').value.trim(); 
            const image = document.getElementById('newPartnerImg').value.trim();
            if (!name || !image) { alert("❌ กรุณากรอกรายละเอียดรูปโลโก้ให้ครบถ้วนก่อนครับน้า!"); return; }
            database.ref('udg_culture_partners_logos').push({ name: name, image: image, timestamp: Date.now() }, (error) => {
                if (!error) { 
                    document.getElementById('newPartnerName').value = ''; 
                    document.getElementById('newPartnerImg').value = ''; 
                    alert(`🔥 สาดโลโก้แบรนด์สำเร็จเรียบร้อยคร้าบน้า!`); 
                    updateLogoPreview(); 
                }
            });
        });
    }

    // 📅🤝 [แท็บ 7] ตารางงานคอนเสิร์ต
    const gigTbody = document.getElementById('gig-list-tbody');
    database.ref('udg_upcoming_gigs').on('value', (snapshot) => {
        if (!gigTbody) return;
        gigTbody.innerHTML = '';
        const gigs = snapshot.val();
        if (!gigs) {
            gigTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center;">📅 บอร์ดตารางงานว่างเปล่า สาดอีเวนต์ปาร์ตี้ชุดใหม่บรรทัดบนได้เลยครับน้า!</td></tr>`;
            return;
        }
        Object.keys(gigs).forEach(key => {
            const gig = gigs[key];
            const tr = document.createElement('tr');
            const selectId = `status-select-${key}`;
            tr.innerHTML = `
                <td>
                    <span style="color:#00ffaa; font-weight:bold; font-family:monospace;">[${gig.day} ${gig.month}]</span><br>
                    <strong style="color:#fff;">${gig.title}</strong>
                </td>
                <td>
                    <select id="${selectId}" onchange="updateGigStatusLive('${key}')" style="padding: 6px 10px; background:#111; border:1px solid #333; color:#fff; font-size:0.8rem; border-radius:4px; width:auto; margin:0;">
                        <option value="btn-comingsoon" ${gig.status === 'btn-comingsoon' ? 'selected' : ''}>⚪ COMING SOON</option>
                        <option value="btn-ticket" ${gig.status === 'btn-ticket' ? 'selected' : ''}>🟢 BUY TICKET</option>
                        <option value="btn-ended" ${gig.status === 'btn-ended' ? 'selected' : ''}>🔴 EVENT ENDED</option>
                    </select>
                </td>
                <td>
                    <button class="delete-artist-btn" onclick="removeGigFromCloud('${key}')" style="color:#ff3333;">// REMOVE</button>
                </td>
            `;
            gigTbody.appendChild(tr);
        });
    });

    const addGigBtn = document.getElementById('addGigBtn');
    if (addGigBtn) {
        addGigBtn.addEventListener('click', () => {
            const day = document.getElementById('newGigDay').value.trim();
            const month = document.getElementById('newGigMonth').value.trim();
            const title = document.getElementById('newGigTitle').value.trim();
            const imgUrl = document.getElementById('newGigImg').value.trim();
            const location = document.getElementById('newGigLocation').value.trim();
            const status = document.getElementById('newGigStatus').value;
            const url = document.getElementById('newGigUrl').value.trim();
            if (!day || !month || !title || !location) {
                alert("❌ กรุณากรอกรายละเอียด วัน เดือน ชื่องานคอนเสิร์ต และสถานที่จัดงานให้ครบถ้วนก่อนครับน้า!");
                return;
            }
            database.ref('udg_upcoming_gigs').push({
                day: day,
                month: month.toUpperCase(),
                title: title,
                image: imgUrl ? imgUrl : "image/ขาวใส.png",
                location: location,
                status: status,
                url: url ? url : "#",
                timestamp: Date.now()
            }, (error) => {
                if (!error) {
                    document.getElementById('newGigDay').value = '';
                    document.getElementById('newGigMonth').value = '';
                    document.getElementById('newGigTitle').value = '';
                    document.getElementById('newGigImg').value = '';
                    document.getElementById('newGigLocation').value = '';
                    document.getElementById('newGigUrl').value = '#';
                    alert(`🔥 อัปเดตงานคอนเสิร์ตพร้อมโปสเตอร์ "${title}" ขึ้นตารางงานเรียบร้อยคร้าบน้าบักหำทิว!`);
                }
            });
        });
    }

    // 🎡 [แท็บ 8] วงล้อสุ่ม
    const wheelTbody = document.getElementById('wheel-list-tbody');
    if (wheelTbody) {
        database.ref('udg_lucky_wheel_rewards').on('value', (snapshot) => {
            wheelTbody.innerHTML = '';
            const items = snapshot.val();
            if (!items) {
                wheelTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center;">📦 บอร์ดรายการกล่องสุ่มยังว่างเปล่า</td></tr>`;
                return;
            }
            let totalRateChecked = 0;
            Object.keys(items).forEach(key => {
                const item = items[key];
                totalRateChecked += parseFloat(item.rateWeight || 0);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="color:#fff; font-weight:bold;">🎯 ${item.name}</td>
                    <td style="color:#ff007f; font-family:monospace; font-weight:bold;">🔥 ล็อกเรทดร็อปไว้ที่: ${item.rateWeight}%</td>
                    <td>
                        <button class="delete-artist-btn" onclick="removeRewardFromWheelCloud('${key}')" style="color:#ff3333;">// REMOVE</button>
                    </td>
                `;
                wheelTbody.appendChild(tr);
            });
            const alertTr = document.createElement('tr');
            const rateColor = totalRateChecked === 100 ? '#39ff14' : '#ffaa00';
            alertTr.innerHTML = `<td colspan="3" style="color:${rateColor}; font-size:0.78rem; text-align:center; font-weight:bold; background:rgba(0,0,0,0.4);">📊 ผลรวมโอกาสดร็อป: ${totalRateChecked}%</td>`;
            wheelTbody.appendChild(alertTr);
        });
    }

    const addWheelBtn = document.getElementById('addWheelItemBtn');
    if (addWheelBtn) {
        addWheelBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('newWheelName');
            const rateInput = document.getElementById('newWheelRate');
            const imgInput = document.getElementById('newWheelImg');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const rate = rateInput ? rateInput.value.trim() : '';
            const imgUrl = imgInput ? imgInput.value.trim() : '';

            if (!name || !rate) {
                alert("❌ แจ้งเตือนแอดมิน: กรุณากรอกชื่อของรางวัล และระบุเลขเปอร์เซ็นต์เรทให้ครบถ้วน!");
                return;
            }

            database.ref('udg_lucky_wheel_rewards').push({
                name: name,
                rateWeight: parseFloat(rate),
                image: imgUrl || "",
                timestamp: Date.now()
            }, (error) => {
                if (!error) {
                    if (nameInput) nameInput.value = '';
                    if (rateInput) rateInput.value = '';
                    if (imgInput) imgInput.value = '';
                    alert(`🔥 เพิ่มของรางวัล "${name}" สำเร็จ!`);
                }
            });
        });
    }

    // 🔍 [แท็บ 9] สแกนคูปองรางวัลผู้ใช้
    const adminSearchInput = document.getElementById('adminUserRewardSearchInput');
    const adminUserRewardsTbody = document.getElementById('admin-user-rewards-tbody');

    if (adminUserRewardsTbody) {
        database.ref('users_rewards_vault').on('value', (snapshot) => {
            const allVaultData = snapshot.val();
            globalAllUsersRewardsCache = [];

            if (!allVaultData) {
                adminUserRewardsTbody.innerHTML = `<tr><td colspan="4" style="color:#555; text-align:center; padding: 20px;">📦 ไม่มีคูปองค้างเคลมในระบบ</td></tr>`;
                return;
            }

            const currentTime = Date.now();
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

            try {
                Object.keys(allVaultData).forEach(uid => {
                    const userItems = allVaultData[uid];
                    if (userItems && typeof userItems === 'object') {
                        Object.keys(userItems).forEach(itemKey => {
                            const info = userItems[itemKey];
                            if (info) {
                                const itemTime = info.wonTimestamp || info.timestamp || currentTime;

                                if (currentTime - itemTime > sevenDaysMs) {
                                    database.ref(`users_rewards_vault/${uid}/${itemKey}`).remove();
                                    return;
                                }

                                let realUserName = info.userName || info.username || info.displayName;
                                if (!realUserName || realUserName.toUpperCase().includes("ANONYMOUS")) {
                                    realUserName = "MEMBER UDG";
                                }

                                globalAllUsersRewardsCache.push({
                                    userUid: uid,
                                    couponKey: itemKey,
                                    accountName: realUserName,
                                    rewardName: info.rewardName || info.eventTitle || "GIFT VOUCHER",
                                    ticketId: info.ticketId || info.voucherCode || "NO-CODE", 
                                    timestamp: itemTime
                                });
                            }
                        });
                    }
                });

                globalAllUsersRewardsCache.sort((a, b) => b.timestamp - a.timestamp);
                const currentSearchQuery = adminSearchInput ? adminSearchInput.value : "";
                renderFilteredUserRewards(currentSearchQuery);

            } catch (error) {
                console.error("ระบบกวาดประวัติสะดุด: ", error);
                adminUserRewardsTbody.innerHTML = `<tr><td colspan="4" style="color:#ff3333; text-align:center; padding: 20px;">❌ ข้อผิดพลาด: ${error.message}</td></tr>`;
            }
        });
    }

    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', (e) => {
            renderFilteredUserRewards(e.target.value);
        });
    }

    // 📥 DEMO DROPBOX
    const demoTbody = document.getElementById('demo-list-tbody');
    database.ref('udg_demo_dropbox').on('value', (snapshot) => {
        if (!demoTbody) return;
        demoTbody.innerHTML = '';
        const demos = snapshot.val();
        
        if (!demos) {
            demoTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center; padding: 20px;">📭 ตู้จดหมายว่างเปล่า: ยังไม่มีศิลปินหน้าใหม่หย่อนเพลงเข้ามาครับน้า</td></tr>`;
            return;
        }

        Object.keys(demos).forEach(key => {
            const item = demos[key];
            const dateStr = new Date(item.timestamp).toLocaleString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="color:#fff; font-size:1.1rem;">${item.trackTitle}</strong><br>
                    <span style="color:#ffaa00; font-size:0.85rem;"><i class="fa-solid fa-microphone"></i> ${item.artistName}</span><br>
                    <span style="color:#555; font-size:0.75rem; font-family:monospace;">ส่งเมื่อ: ${dateStr}</span>
                </td>
                <td>
                    <span style="color:#aaa; font-size:0.85rem;">${item.contactInfo}</span><br>
                    <span style="color:#00ffff; font-size:0.7rem; font-family:monospace;">ส่งโดย User: ${item.submittedBy}</span>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
                        <a href="${item.trackLink}" target="_blank" style="background:#111; color:#39ff14; border:1px solid #39ff14; padding:5px 10px; border-radius:4px; font-size:0.75rem; font-weight:bold; text-decoration:none; display:inline-block; width:100px;">
                            <i class="fa-solid fa-play"></i> เปิดฟัง
                        </a>
                        <button type="button" class="delete-artist-btn" style="color:#ff3333; font-weight:800; background:rgba(255,51,51,0.03); border:1px solid rgba(255,51,51,0.2); padding:5px 10px; border-radius:4px; cursor:pointer; width:100px;" onclick="deleteDemoTrack('${key}')">
                            <i class="fa-solid fa-trash-can"></i> ลบทิ้ง
                        </button>
                    </div>
                </td>
            `;
            demoTbody.appendChild(tr);
        });
    });

    // 📊 COMMAND CENTER DASHBOARD COUNTERS
    const dashOnline = document.getElementById('dashOnline');
    const dashDemos = document.getElementById('dashDemos');
    const dashGraffiti = document.getElementById('dashGraffiti');
    const dashCases = document.getElementById('dashCases');

    database.ref('online_users').on('value', (snapshot) => {
        if (dashOnline) dashOnline.innerText = snapshot.numChildren() || 0;
    });

    database.ref('udg_demo_dropbox').on('value', (snapshot) => {
        if (dashDemos) dashDemos.innerText = snapshot.numChildren() || 0;
    });

    database.ref('graffiti_rooms').on('value', (snapshot) => {
        let totalMessages = 0;
        const rooms = snapshot.val();
        if (rooms) {
            Object.keys(rooms).forEach(room => {
                totalMessages += Object.keys(rooms[room]).length;
            });
        }
        if (dashGraffiti) dashGraffiti.innerText = totalMessages;
    });

    database.ref('users_rewards_vault').on('value', (snapshot) => {
        let totalCases = 0;
        const vaults = snapshot.val();
        if (vaults) {
            Object.keys(vaults).forEach(uid => {
                totalCases += Object.keys(vaults[uid]).length;
            });
        }
        if (dashCases) dashCases.innerText = totalCases;
    });

    // 🛒 MERCH ORDERS
    const orderTbody = document.getElementById('order-list-tbody');
    database.ref('udg_merch_orders').on('value', (snapshot) => {
        if (!orderTbody) return;
        orderTbody.innerHTML = '';
        const orders = snapshot.val();
        
        if (!orders) {
            orderTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center; padding: 20px;">📦 ยังไม่มีออเดอร์เข้ามาครับน้า</td></tr>`;
            return;
        }

        let ordersArray = Object.keys(orders).map(key => ({ key: key, ...orders[key] }));
        ordersArray.sort((a, b) => b.timestamp - a.timestamp);

        ordersArray.forEach(item => {
            const dateStr = new Date(item.timestamp).toLocaleString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            let statusBadge = item.status === 'VERIFIED' 
                ? `<span style="background: rgba(57, 255, 20, 0.1); color: #39ff14; padding: 4px 8px; border: 1px solid #39ff14; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">✅ จ่ายแล้ว</span>`
                : `<span style="background: rgba(255, 51, 51, 0.1); color: #ff3333; padding: 4px 8px; border: 1px solid #ff3333; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">⏳ รอตรวจสลิป</span>`;

            let actionButton = item.status === 'VERIFIED'
                ? `<button onclick="deleteOrder('${item.key}')" style="background: #111; border: 1px solid #ff3333; color: #ff3333; padding: 5px 10px; cursor: pointer; border-radius: 4px; font-size: 0.7rem; margin-top: 8px;"><i class="fa-solid fa-trash"></i> ลบออเดอร์</button>`
                : `<button onclick="verifyOrderPayment('${item.key}')" style="background: #ffaa00; border: none; color: #000; padding: 5px 10px; cursor: pointer; border-radius: 4px; font-size: 0.7rem; font-weight: bold; margin-top: 8px;"><i class="fa-solid fa-check"></i> ยืนยันยอดเข้าจริง</button>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="color:#fff; font-size:1.05rem;">${item.customerName}</strong><br>
                    <span style="color:#ff007f; font-weight: bold; font-size: 0.9rem;">SIZE: ${item.size}</span><br>
                    <span style="color:#555; font-size:0.75rem; font-family:monospace;"><i class="fa-solid fa-phone"></i> ${item.phone}</span><br>
                    <span style="color:#555; font-size:0.7rem; font-family:monospace;">${dateStr}</span>
                </td>
                <td>
                    <p style="color:#ccc; font-size:0.85rem; line-height: 1.4; margin: 0; max-width: 250px;">${item.address}</p>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <div style="display: flex; flex-direction: column; gap: 5px; align-items: center;">
                        ${statusBadge}
                        <a href="${item.slipImageUrl}" target="_blank" style="color: #00ffff; text-decoration: underline; font-size: 0.8rem; margin-top: 5px;"><i class="fa-solid fa-image"></i> เปิดดูรูปสลิป</a>
                        ${actionButton}
                    </div>
                </td>
            `;
            orderTbody.appendChild(tr);
        });
    });

    // 📸 ตั้งค่าอัปโหลดรูปภาพอัตโนมัติ (ImgBB)
    setupImgbbAutoUploader('adminNewsImgFile', 'adminNewsImg', 'newsUploadStatus', updateLivePreview);
    setupImgbbAutoUploader('newAdImgFile', 'newAdImage', 'adUploadStatus');
    setupImgbbAutoUploader('newPartnerImgFile', 'newPartnerImg', 'logoUploadStatus', updateLogoPreview);
    setupImgbbAutoUploader('newGigImgFile', 'newGigImg', 'gigUploadStatus');
    setupImgbbAutoUploader('newWheelImgFile', 'newWheelImg', 'wheelUploadStatus');
    setupImgbbAutoUploader('newAlbumImgFile', 'newAlbumImg', 'albumUploadStatus');
    setupImgbbAutoUploader('newVoucherImgFile', 'newVoucherImg', 'voucherUploadStatus');

    // 🤝 COLLAB BOARD
    const collabAdminTbody = document.getElementById('collab-admin-tbody');
    database.ref('udg_collab_board').on('value', (snapshot) => {
        if (!collabAdminTbody) return;
        collabAdminTbody.innerHTML = '';
        const ads = snapshot.val();
        
        if (!ads) {
            collabAdminTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center; padding: 20px;">📭 ยังไม่มีประกาศในระบบครับ</td></tr>`;
            return;
        }

        let adsArray = Object.keys(ads).map(key => ({ key: key, ...ads[key] }));
        adsArray.sort((a, b) => b.timestamp - a.timestamp);

        adsArray.forEach(item => {
            const dateStr = new Date(item.timestamp).toLocaleString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <span style="color:#ffaa00; font-size:0.75rem; font-weight:bold;">[${item.role}]</span> <strong style="color:#fff;">${item.title}</strong><br>
                    <p style="color:#aaa; font-size:0.8rem; line-height:1.4; margin-top:4px;">${item.desc}</p>
                </td>
                <td>
                    <span style="color:#00ffff; font-size:0.85rem;"><i class="fa-solid fa-user"></i> ${item.authorName}</span><br>
                    <span style="color:#39ff14; font-size:0.8rem; font-family:monospace;">${item.contact}</span><br>
                    <span style="color:#555; font-size:0.7rem;">${dateStr}</span>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <button onclick="deleteCollabAd('${item.key}')" style="background: #111; border: 1px solid #ff3333; color: #ff3333; padding: 5px 10px; cursor: pointer; border-radius: 4px; font-size: 0.75rem; font-weight:bold;">
                        <i class="fa-solid fa-trash"></i> ลบทิ้ง
                    </button>
                </td>
            `;
            collabAdminTbody.appendChild(tr);
        });
    });

    // 💿 ALBUMS DISCUSSIONS
    const albumAdminTbody = document.getElementById('album-admin-tbody');
    database.ref('udg_albums').on('value', (snapshot) => {
        if (!albumAdminTbody) return;
        albumAdminTbody.innerHTML = '';
        const albums = snapshot.val();
        
        if (!albums) {
            albumAdminTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center; padding: 20px;">💿 ยังไม่มีอัลบั้มในระบบครับ สาดแผ่นใหม่ด้านบนได้เลย!</td></tr>`;
            return;
        }

        let albumsArray = Object.keys(albums).map(key => ({ key: key, ...albums[key] }));
        albumsArray.sort((a, b) => b.timestamp - a.timestamp);

        albumsArray.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="color:#ff00ff; font-size:1.05rem;">${item.title}</strong><br>
                    <span style="color:#aaa; font-size:0.85rem;"><i class="fa-solid fa-microphone"></i> ${item.artist}</span>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <div style="width:50px; height:50px; border-radius:4px; overflow:hidden; border:1px solid #333; display: inline-block;">
                        <img src="${item.coverUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='image/ขาวใส.png'">
                    </div>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <button onclick="deleteAlbumData('${item.key}')" style="background: #111; border: 1px solid #ff3333; color: #ff3333; padding: 5px 10px; cursor: pointer; border-radius: 4px; font-size: 0.75rem; font-weight:bold;">
                        <i class="fa-solid fa-trash"></i> ลบทิ้ง
                    </button>
                </td>
            `;
            albumAdminTbody.appendChild(tr);
        });
    });

    const addAlbumBtn = document.getElementById('addAlbumBtn');
    if (addAlbumBtn) {
        addAlbumBtn.addEventListener('click', () => {
            const title = document.getElementById('newAlbumTitle').value.trim();
            const artist = document.getElementById('newAlbumArtist').value.trim();
            const desc = document.getElementById('newAlbumDesc').value.trim();
            const coverUrl = document.getElementById('newAlbumImg').value.trim();

            if (!title || !artist || !coverUrl) {
                alert("❌ แจ้งเตือนแอดมิน: กรุณากรอกชื่ออัลบั้ม, ชื่อศิลปิน และอัปโหลดปกให้ครบถ้วนก่อนครับน้า!");
                return;
            }

            database.ref('udg_albums').push({
                title: title,
                artist: artist,
                desc: desc,
                coverUrl: coverUrl,
                timestamp: Date.now()
            }, (error) => {
                if (!error) {
                    document.getElementById('newAlbumTitle').value = '';
                    document.getElementById('newAlbumArtist').value = '';
                    document.getElementById('newAlbumDesc').value = '';
                    document.getElementById('newAlbumImg').value = '';
                    alert(`🔥 อัปโหลดอัลบั้ม "${title}" ขึ้นหน้าจอหลักให้แฟนคลับรีวิวเรียบร้อยครับ!`);
                } else {
                    alert("❌ เกิดข้อผิดพลาด: " + error.message);
                }
            });
        });
    }

    // 🎟️ GIFT VOUCHERS
    const voucherAdminTbody = document.getElementById('voucher-admin-tbody');
    database.ref('udg_events_vouchers').on('value', (snapshot) => {
        if (!voucherAdminTbody) return;
        voucherAdminTbody.innerHTML = '';
        const vouchers = snapshot.val();

        if (!vouchers) {
            voucherAdminTbody.innerHTML = `<tr><td colspan="4" style="color:#555; text-align:center; padding: 20px;">🎟️ ยังไม่มีรายการ Gift Voucher ในระบบครับ</td></tr>`;
            return;
        }

        Object.keys(vouchers).forEach(key => {
            const item = { key: key, ...vouchers[key] };
            const activeStatus = item.active !== false;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="color:#ffaa00; font-size:1rem;">${item.title}</strong><br>
                    <span style="color:#00ffff; font-size:0.8rem; font-family:monospace;">CODE: ${item.voucherCode || 'N/A'}</span>
                </td>
                <td style="color:#fff; font-weight:bold;">
                    <span style="color:#39ff14;">${item.remainingQuantity !== undefined ? item.remainingQuantity : item.totalQuantity}</span> / ${item.totalQuantity} ใบ
                </td>
                <td>
                    <div style="display:flex; gap:6px; align-items:center;">
                        <button onclick="editVoucherStock('${item.key}', ${item.remainingQuantity !== undefined ? item.remainingQuantity : item.totalQuantity}, ${item.totalQuantity})" style="background:#222; border:1px solid #ffaa00; color:#ffaa00; padding:4px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer;"><i class="fa-solid fa-pen-to-square"></i> ปรับโควต้า</button>
                        <button onclick="toggleVoucherActive('${item.key}', ${activeStatus})" style="background:#111; border:1px solid ${activeStatus ? '#39ff14' : '#ff3333'}; color:${activeStatus ? '#39ff14' : '#ff3333'}; padding:4px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer;">${activeStatus ? '🟢 เปิดรับ' : '🔴 ปิดรับ'}</button>
                    </div>
                </td>
                <td style="text-align: center;">
                    <button onclick="deleteVoucherData('${item.key}')" style="background:#111; border:1px solid #ff3333; color:#ff3333; padding:5px 10px; cursor:pointer; border-radius:4px; font-size:0.75rem; font-weight:bold;">
                        <i class="fa-solid fa-trash"></i> ลบทิ้ง
                    </button>
                </td>
            `;
            voucherAdminTbody.appendChild(tr);
        });
    });

    const addVoucherBtn = document.getElementById('addVoucherBtn');
    if (addVoucherBtn) {
        addVoucherBtn.addEventListener('click', () => {
            const title = document.getElementById('newVoucherTitle').value.trim();
            const code = document.getElementById('newVoucherCode').value.trim();
            const desc = document.getElementById('newVoucherDesc').value.trim();
            const total = parseInt(document.getElementById('newVoucherTotal').value);
            const remInput = document.getElementById('newVoucherRemaining').value;
            const remaining = remInput !== "" ? parseInt(remInput) : total;
            const imgUrl = document.getElementById('newVoucherImg').value.trim();

            if (!title || isNaN(total) || total < 1) {
                alert("❌ กรุณากรอกชื่องานอีเวนต์ และกำหนดจำนวนสิทธิ์ทั้งหมดให้ถูกต้อง!");
                return;
            }

            database.ref('udg_events_vouchers').push({
                title: title,
                voucherCode: code || "UDG-EVENT-VOUCHER",
                desc: desc || "สปอนเซอร์ส่วนลดโดย UDG Culture TH",
                totalQuantity: total,
                remainingQuantity: remaining,
                image: imgUrl || "image/ขาวใส.png",
                active: true,
                timestamp: Date.now()
            }, (error) => {
                if (!error) {
                    document.getElementById('newVoucherTitle').value = '';
                    document.getElementById('newVoucherCode').value = '';
                    document.getElementById('newVoucherDesc').value = '';
                    document.getElementById('newVoucherTotal').value = '';
                    document.getElementById('newVoucherRemaining').value = '';
                    document.getElementById('newVoucherImg').value = '';
                    alert(`🔥 เพิ่ม Gift Voucher งาน "${title}" เข้าสู่ระบบเรียบร้อยแล้ว!`);
                } else {
                    alert("❌ เกิดข้อผิดพลาด: " + error.message);
                }
            });
        });
    }

    // 📈 ANALYTICS & CALENDAR FILTER BINDINGS
    const statsDatePicker = document.getElementById('statsDatePicker');
    if (statsDatePicker) {
        statsDatePicker.value = new Date().toISOString().split('T')[0];
        statsDatePicker.addEventListener('change', () => processAnalyticsCharts());
    }

    const btnFilterToday = document.getElementById('btnFilterToday');
    if (btnFilterToday) {
        btnFilterToday.addEventListener('click', () => {
            if (statsDatePicker) statsDatePicker.value = new Date().toISOString().split('T')[0];
            processAnalyticsCharts();
        });
    }

    const btnFilterMonth = document.getElementById('btnFilterMonth');
    if (btnFilterMonth) {
        btnFilterMonth.addEventListener('click', () => {
            alert("ระบบกำลังกวาดดึงประมวลผลภาพรวมรายเดือนให้ครับน้า!");
            processAnalyticsCharts(true);
        });
    }

    // 📡 LIVE LOG SPY
    database.ref('udg_demo_dropbox').on('child_added', (snap) => {
        const val = snap.val();
        if (val) pushLiveCommandLog(val.artistName || "ศิลปินนิรนาม", `สาดเพลงใหม่ [${val.trackTitle || "Untitled"}] เข้าสู่ระบบตู้ Dropbox แดง`);
    });

    // ⚡ ประมวลผลกราฟครั้งแรก
    setTimeout(() => { 
        processAnalyticsCharts();
    }, 1500);

});