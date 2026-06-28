/* =================================================================
   🚨 UDG CENTRAL CONTROL DESK - MAIN MOTOR ENGINE (admin-js.js)
================================================================= */
const MASTER_ADMIN_PASS = "udg2026"; // 🔑 ปรับเปลี่ยนรหัสผ่านแอดมินตรงล็อกตามคำขอเรียบร้อยครับน้า

// 🔐 ระบบยืนยันรหัสความปลอดภัยเข้าหน้าแอดมินส่วนกลาง
function checkGateLogin() {
    const userInput = document.getElementById("gatePasscodeInput").value.trim();
    if (userInput === MASTER_ADMIN_PASS) {
        sessionStorage.setItem("udg_admin_authenticated", "true");
        unlockCentralPanel();
    } else {
        alert("❌ ACCESS DENIED:\nรหัสผ่านลับผู้ดูแลระบบไม่ถูกต้อง! โปรดระบุใหม่อีกครั้งครับน้า");
        document.getElementById("gatePasscodeInput").value = "";
        document.getElementById("gatePasscodeInput").focus();
    }
}

function unlockCentralPanel() {
    document.getElementById("gateOverlay").style.display = "none";
    document.getElementById("adminTabsMenu").style.display = "flex";
    switchTabMenu("overviewPanelBox"); // <--- เปลี่ยนจาก newsPanelBox เป็นอันนี้ครับ
}

function kickUserToHome() { window.location.href = "index.html"; }

function switchTabMenu(targetId) {
    document.querySelectorAll(".admin-box").forEach(box => { box.style.display = "none"; });
    document.querySelectorAll(".tab-trigger-btn").forEach(btn => { btn.classList.remove("active"); });
    
    const targetBox = document.getElementById(targetId);
    if (targetBox) targetBox.style.display = "block";
    
    const activeBtn = document.querySelector(`.tab-trigger-btn[data-target="${targetId}"]`);
    if (activeBtn) activeBtn.classList.add("active");
}

document.querySelectorAll(".tab-trigger-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target");
        switchTabMenu(target);
    });
});

if (sessionStorage.getItem("udg_admin_authenticated") === "true") { unlockCentralPanel(); }
document.getElementById("gatePasscodeInput").addEventListener("keypress", function(e) { if (e.key === "Enter") { checkGateLogin(); } });

// ─── 🔄 ⚡ ฟังก์ชันประมวลผลกล่อง Live Preview การ์ดข่าวสาร ───
function updateLivePreview() {
    const subTagInput = document.getElementById("adminNewsSubTag").value.trim();
    const titleInput = document.getElementById("adminNewsTitle").value.trim();
    const imgInput = document.getElementById("adminNewsImg").value.trim();
    const excerptInput = document.getElementById("adminNewsExcerpt").value.trim();

    document.getElementById("mockupTag").innerText = subTagInput ? subTagInput : "NEWS";
    document.getElementById("mockupTitle").innerText = titleInput ? titleInput : "หัวข้อข่าวสารจำลองประจำค่าย...";
    document.getElementById("mockupExcerpt").innerText = excerptInput ? excerptInput : "คำอธิบายข่าวโปรยฟีดจะปรากฏตรงนี้...";
    document.getElementById("mockupImage").src = imgInput ? imgInput : "image/ขาวใส.png";
}

function updateLogoPreview() {
    const imgUrl = document.getElementById("newPartnerImg").value.trim();
    document.getElementById("mockupPartnerLogo").src = imgUrl ? imgUrl : "image/ขาวใส.png";
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

// ป้องกันเครื่องยนต์ Firebase Initialized เบิ้ลซ้ำซ้อน
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app();
}
const database = firebase.database();

// 📰 [ระบบแท็บที่ 1] CONTENT ข่าวสาร
function toggleRadarLinkField() {
    const targetZone = document.getElementById('adminNewsTag').value;
    const radarUrlGroup = document.getElementById('radarUrlGroup');
    const titleLabel = document.getElementById('titleLabel');
    const excerptLabel = document.getElementById('excerptLabel');
    const subTagInput = document.getElementById('adminNewsSubTag');
    if (targetZone.startsWith('RADAR')) {
        radarUrlGroup.style.display = 'flex'; titleLabel.innerText = "ARTIST NAME"; excerptLabel.innerText = "ARTIST BIO";
        if(targetZone === 'RADAR_1') subTagInput.value = "DRILL"; if(targetZone === 'RADAR_2') subTagInput.value = "TRAP";
    } else if (targetZone === 'FEATURED') {
        radarUrlGroup.style.display = 'none'; titleLabel.innerText = "FEATURED TITLE"; excerptLabel.innerText = "FEATURED EXCERPT"; subTagInput.value = "BREAKING";
    } else {
        radarUrlGroup.style.display = 'none'; titleLabel.innerText = "NEWS TITLE"; excerptLabel.innerText = "NEWS EXCERPT"; subTagInput.value = "NEWS";
    }
    updateLivePreview();
}

document.getElementById('adminPostNewsBtn').addEventListener('click', () => {
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

function successAction() { 
    document.getElementById('adminNewsTitle').value = '';
    document.getElementById('adminNewsExcerpt').value = '';
    alert("🔥 อัปเดตข้อมูลขึ้นหน้าเว็บหลักเรียบร้อยครับน้า!");
    updateLivePreview();
}

// 🎵 [ระบบแท็บที่ 2] จัดการตู้เซ็ตเพลงโหวตประจำเดือน (แก้ไขให้ตรงกับหน้าบ้าน)
const trackTbody = document.getElementById('track-list-tbody');

// เปลี่ยนฟังก์ชันหาวันที่ให้เป็นแบบรายเดือน (เหมือนใน script.js)
function getAdminCurrentMonthKey() {
    const d = new Date();
    let yyyy = d.getFullYear();
    let mm = d.getMonth() + 1;
    let dd = d.getDate();
    let hh = d.getHours();
    let min = d.getMinutes();

    // ดักวันที่ 1 เวลา 00:00 น.
    if (dd === 1 && hh === 0 && min === 0) {
        let prev = new Date(d.getTime() - 60000);
        yyyy = prev.getFullYear();
        mm = prev.getMonth() + 1;
    }
    mm = String(mm).padStart(2, '0');
    return `month_${yyyy}_${mm}`;
}

function listenToCurrentMonthTracks() {
    const currentMonthId = getAdminCurrentMonthKey();
    // เปลี่ยน path เป็น udg_monthly_tracks_vault ให้ตรงกับหน้าบ้าน
    database.ref(`udg_monthly_tracks_vault/${currentMonthId}`).on('value', (s) => {
        if (!trackTbody) return;
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
listenToCurrentMonthTracks();

document.getElementById('addTrackBtn').addEventListener('click', () => {
    const currentMonthId = getAdminCurrentMonthKey(); 
    const title = document.getElementById('newTrackTitle').value.trim(); 
    const artist = document.getElementById('newTrackArtist').value.trim(); 
    const ytId = document.getElementById('newTrackYtId').value.trim();
    
    if (!title || !artist || !ytId) { alert("❌ กรุณากรอกรายละเอียดช่องเพลงให้ครบถ้วนก่อนครับน้า!"); return; }
    
    const trackRandomId = "track_" + Date.now();
    // เปลี่ยน path บันทึกข้อมูลเป็น udg_monthly_tracks_vault
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

function removeTrackFromCurrentMonth(trackKey) { 
    const currentMonthId = getAdminCurrentMonthKey(); 
    if (confirm("คุณต้องการถอดเพลงนี้ออกใช่หรือไม่?")) {
        // เปลี่ยน path การลบข้อมูลเป็น udg_monthly_tracks_vault
        database.ref(`udg_monthly_tracks_vault/${currentMonthId}/${trackKey}`).remove(); 
    }
}
// 🎤 [ระบบแท็บที่ 3] มอบสิทธิ์คีย์แร็ปเปอร์พ่นสีทอง
const tbody = document.getElementById('artist-list-tbody');
database.ref('udg_artist_credentials').on('value', (s) => {
    if (!tbody) return;
    tbody.innerHTML = ''; const list = s.val(); if (!list) { tbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center;">🎤 ยังไม่มีรายชื่อแร็ปเปอร์</td></tr>`; return; }
    Object.keys(list).forEach(k => {
        const tr = document.createElement('tr'); tr.innerHTML = `<td style="color:#ffaa00; font-weight:bold;">${k}</td><td style="color:#aaa;">${list[k]}</td><td><button class="delete-artist-btn" onclick="removeArtistFromCloud('${k}')">// REMOVE</button></td>`; tbody.appendChild(tr);
    });
});

document.getElementById('addArtistBtn').addEventListener('click', () => {
    let name = document.getElementById('newArtistName').value.trim(); const pass = document.getElementById('newArtistPass').value.trim();
    if (!name || !pass) { alert("❌ กรุณากรอกข้อมูลศิลปินให้ครบถ้วนก่อน!"); return; }
    if (!name.startsWith('@')) name = '@' + name;
    database.ref(`udg_artist_credentials/${name}`).set(pass, (err) => { if (!err) { document.getElementById('newArtistName').value = ''; document.getElementById('newArtistPass').value = ''; alert(`🔥 เพิ่มสิทธิ์แร็ปเปอร์ ${name} สำเร็จ!`); } });
});
function removeArtistFromCloud(k) { if (confirm(`คุณต้องการลบสิทธิ์แร็ปเปอร์ ${k} ใช่หรือไม่?`)) database.ref(`udg_artist_credentials/${k}`).remove(); }

// 💸 [ระบบแท็บที่ 4] อัปโหลดป้ายโฆษณาหมุนเวียนออโต้ 10 วิ
const adTbody = document.getElementById('ad-list-tbody');
database.ref('udg_live_advertisements').on('value', (s) => {
    if (!adTbody) return;
    adTbody.innerHTML = ''; const ads = s.val(); if (!ads) { adTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center;">💸 ยังไม่มีโฆษณาหมุนเวียน</td></tr>`; return; }
    Object.keys(ads).forEach(k => {
        const tr = document.createElement('tr'); tr.innerHTML = `<td style="color:#39ff14;">${ads[k].title}</td><td style="color:#aaa; font-size:0.8rem;">${ads[k].url}</td><td><button class="delete-artist-btn" onclick="removeAdFromCloud('${k}')">// REMOVE</button></td>`; adTbody.appendChild(tr);
    });
});

document.getElementById('addAdBtn').addEventListener('click', () => {
    const title = document.getElementById('newAdTitle').value.trim(); const desc = document.getElementById('newAdDesc').value.trim(); const img = document.getElementById('newAdImage').value.trim(); const url = document.getElementById('newAdUrl').value.trim();
    if (!title || !desc) { alert("❌ กรุณากรอกรายละเอียดโฆษณาให้ครบถ้วน!"); return; }
    database.ref('udg_live_advertisements').push({ title: title, description: desc, image: img ? img : "", url: url ? url : "#" }, (err) => { if (!err) { document.getElementById('newAdTitle').value = ''; document.getElementById('newAdDesc').value = ''; document.getElementById('newAdImage').value = ''; document.getElementById('newAdUrl').value = '#'; alert(`🔥 เพิ่มป้ายสปอนเซอร์ "${title}" เข้าคิวเรียบร้อยครับ!`); } });
});
function removeAdFromCloud(k) { if(confirm("ต้องการลบป้ายโฆษณานี้ใช่หรือไม่?")) database.ref(`udg_live_advertisements/${k}`).remove(); }

// 🗳️ [ระบบแท็บที่ 5] ล็อกชาร์ตปิดยอดแชมป์เพลงหอเกียรติยศ
const archivedWeeksList = document.getElementById('archivedWeeksList');
database.ref('udg_votes_archive_logs').on('value', (snapshot) => {
    if (!archivedWeeksList) return;
    archivedWeeksList.innerHTML = ''; const logs = snapshot.val();
    if (!logs) { archivedWeeksList.innerHTML = `<li style="color: #555; font-size: 0.85rem;">📜 ทำเนียบประวัติว่างเปล่า</li>`; return; }
    Object.keys(logs).forEach(weekKey => {
        const log = logs[weekKey]; const li = document.createElement('li');
        li.style.cssText = "background:#111; padding:10px 15px; border-radius:4px; border-left:3px solid #cc00ff; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;";
        li.innerHTML = `<div><strong style="color:#fff;">🗓️ รอบสัปดาห์เซ็ต: ${weekKey.replace('week_', '').replace(/_/g, '-')}</strong><br><span style="color:#aaa;">🥇 แชมป์ประจำเซ็ต: <span style="color:#00ffff; font-weight:bold;">${log.winnerTitle}</span> - ${log.winnerArtist} (${log.winnerVotes} PTS)</span></div><button class="delete-artist-btn" onclick="deleteArchiveLog('${weekKey}')" style="color:#ff3333;">// DELETE LOG</button>`; archivedWeeksList.appendChild(li);
    });
});

document.getElementById('archiveWeeklyBtn').addEventListener('click', async () => {
    const currentWeekId = getAdminCurrentWeekKey();
    if (!confirm(`🚨 ยืนยันการสรุปชาร์ตและปิดยอดเซ็ตเพลงสัปดาห์ [${currentWeekId}] ใช่หรือไม่?`)) return;
    const voteSnapshot = await database.ref(`weekly_music_votes/${currentWeekId}`).once('value'); const votesData = voteSnapshot.val() ? voteSnapshot.val() : {};
    const trackSnapshot = await database.ref(`udg_weekly_tracks_vault/${currentWeekId}`).once('value'); const weeklyTracks = trackSnapshot.val() ? trackSnapshot.val() : {};
    if (Object.keys(weeklyTracks).length === 0) { alert("❌ ไม่มีรายชื่อเพลงเลยครับน้า!"); return; }
    let sortedChartList = Object.keys(weeklyTracks).map(key => { const track = weeklyTracks[key]; return { title: track.title, artist: track.artist, votes: votesData[track.id] ? votesData[track.id] : 0 }; });
    sortedChartList.sort((a, b) => b.votes - a.votes); const winner = sortedChartList[0];
    const archivePayload = { winnerTitle: winner.title, winnerArtist: winner.artist, winnerVotes: winner.votes, closedTimestamp: Date.now() };
    database.ref(`udg_votes_archive_logs/${currentWeekId}`).set(archivePayload, (error) => { if (!error) alert(`🏆 LOCK ARCHIVE SUCCESS!`); });
});
function deleteArchiveLog(weekKey) { if (confirm(`คุณต้องการลบแฟ้มบันทึกประวัติรอบสัปดาห์ ${weekKey} ใช่หรือไม่?`)) database.ref(`udg_votes_archive_logs/${weekKey}`).remove(); }

// 🤝 [ระบบแท็บที่ 6] แอดรูปโลโก้แบรนด์สปอนเซอร์วิ่งแถวล่าง
const logoTbody = document.getElementById('logo-list-tbody');
database.ref('udg_culture_partners_logos').on('value', (snapshot) => {
    if (!logoTbody) return;
    logoTbody.innerHTML = ''; const logos = snapshot.val();
    if (!logos) { logoTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center;">🤝 แถบลูปโลโก้ว่างเปล่า</td></tr>`; return; }
    Object.keys(logos).forEach(key => {
        const partner = logos[key]; const tr = document.createElement('tr');
        tr.innerHTML = `<td><strong style="color:#fff000;">${partner.name}</strong></td><td><div style="width:40px; height:40px; background:#000; border:1px solid #222; border-radius:4px; overflow:hidden; display:flex; align-items:center; justify-content:center;"><img src="${partner.image}" alt="Logo" style="width:100%; height:100%; object-fit:contain; filter:grayscale(100%);"></div></td><td><button class="delete-artist-btn" onclick="removePartnerLogo('${key}')" style="color:#ff3333;">// REMOVE</button></td>`;
        logoTbody.appendChild(tr);
    });
});

document.getElementById('addPartnerLogoBtn').addEventListener('click', () => {
    const name = document.getElementById('newPartnerName').value.trim(); const image = document.getElementById('newPartnerImg').value.trim();
    if (!name || !image) { alert("❌ กรุณากรอกรายละเอียดรูปโลโก้ให้ครบถ้วนก่อนครับน้า!"); return; }
    database.ref('udg_culture_partners_logos').push({ name: name, image: image, timestamp: Date.now() }, (error) => {
        if (!error) { document.getElementById('newPartnerName').value = ''; document.getElementById('newPartnerImg').value = ''; alert(`🔥 สาดโลโก้แบรนด์สำเร็จเรียบร้อยคร้าบน้า!`); updateLogoPreview(); }
    });
});
function removePartnerLogo(key) { if (confirm("คุณต้องการถอดถอนโลโก้พาร์ทเนอร์เจ้านี้ใช่หรือไม่?")) database.ref(`udg_culture_partners_logos/${key}`).remove(); }

// 📅🤝 [ระบบแท็บที่ 7] ENGINE: จัดการและอัปเดตสถานะคอนเสิร์ตพ่วงโปสเตอร์
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

document.getElementById('addGigBtn').addEventListener('click', () => {
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
function removeGigFromCloud(key) { if (confirm("แจ้งเตือนแอดมิน: คุณต้องการลบรายการอีเวนต์คอนเสิร์ตเจ้านี้ออกจากระบบหน้าจอหลักใช่หรือไม่?")) { database.ref(`udg_upcoming_gigs/${key}`).remove(); } }

// 🎡 [ระบบแท็บที่ 8] ENGINE: จัดการล็อกเปอร์เซ็นต์เรทโอกาสดร็อปไอเทมวงล้อส่วนกลาง
const wheelTbody = document.getElementById('wheel-list-tbody');

database.ref('udg_lucky_wheel_rewards').on('value', (snapshot) => {
    if (!wheelTbody) return;
    wheelTbody.innerHTML = '';
    const items = snapshot.val();
   // เปลี่ยนข้อความแจ้งเตือนตอนตารางว่างเปล่า และตอนสรุปผลรวม %
if (!items) {
    wheelTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center;">📦 บอร์ดรายการกล่องสุ่มยังว่างเปล่า สาดของรางวัลชิ้นใหม่บรรทัดบนได้เลยคร้าบน้าบักหำทิว!</td></tr>`;
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
    alertTr.innerHTML = `<td colspan="3" style="color:${rateColor}; font-size:0.78rem; text-align:center; font-weight:bold; background:rgba(0,0,0,0.4);">📊 สรุปผลรวมค่าโอกาสดร็อปบนคลาวด์ตอนนี้เท่ากับ: ${totalRateChecked}% ${totalRateChecked === 100 ? '(ล็อกเรทน้ำหนักกระจายแต้มสมบูรณ์แบบ)' : '(แจ้งเตือน: แนะนำให้ปรับรวมกันให้ได้ครบ 100% พอดีเป๊ะนะคร้าบน้า)'}</td>`;
    wheelTbody.appendChild(alertTr);
});

document.getElementById('addWheelItemBtn').addEventListener('click', () => {
    const name = document.getElementById('newWheelName').value.trim();
    const rate = document.getElementById('newWheelRate').value.trim();
    
    // 🎯 ดักจับดึงค่าจากช่องกรอก URL รูปภาพไอเท็มที่น้าเพิ่มเข้ามาใหม่
    const imgUrl = document.getElementById('newWheelImg').value.trim();
    
    if (!name || !rate) {
        alert("❌ แจ้งเตือนแอดมิน: กรุณากรอกชื่อของรางวัล และระบุเลขเปอร์เซ็นต์เรทให้ครบถ้วนก่อนคร้าบน้า!");
        return;
    }
    
    // ส่งข้อมูล Payload ขึ้นฐานข้อมูลชุดเดิม แต่พ่วงตัวแปร image ยัดเข้าไปด้วย
    database.ref('udg_lucky_wheel_rewards').push({
        name: name,
        rateWeight: parseFloat(rate),
        image: imgUrl ? imgUrl : "", // ถ้าน้าไม่ได้กรอก ลระบบจะเซ็ตค่าว่างเพื่อเอาไว้สลับเป็นภาพ Standby หน้าบ้าน
        timestamp: Date.now()
    }, (error) => {
        if (!error) {
            // ล้างเคลียร์ขยะออกจากกล่องรับข้อความเมื่อแอดมินกดสาดสำเร็จ
            document.getElementById('newWheelName').value = '';
            document.getElementById('newWheelRate').value = '';
            document.getElementById('newWheelImg').value = ''; // 👈 เคลียร์ช่องรูปภาพตัวใหม่ด้วยครับน้า
            alert(`🔥 สาดของรางวัล "${name}" พร้อมรูปภาพเข้าสู่กล่องสุ่มหน้าบ้านเรียบร้อยคร้าบน้าบักหำทิว!`);
        }
    });
});

// เปลี่ยนข้อความแจ้งเตือนตอนจะกดลบไอเท็มออกจากกล่อง
function removeRewardFromWheelCloud(key) {
    if (confirm("แจ้งเตือนแอดมิน UDG: คุณต้องการลบรางวัลไอเท็มชิ้นนี้ออกจากกล่องสุ่มหน้าบ้านใช่หรือไม่?")) {
        database.ref(`udg_lucky_wheel_rewards/${key}`).remove();
    }
}

// =================================================================
// ─── 🔍 🎰 ADMINDESK: ENGINE สแกนประวัติและระบบเคลมทำลายดาต้าถาวร (ฉบับหายขาด 100%) ───
// =================================================================
const adminSearchInput = document.getElementById('adminUserRewardSearchInput');
const adminUserRewardsTbody = document.getElementById('admin-user-rewards-tbody');
let globalAllUsersRewardsCache = []; // ถังพักความจำด่วนสำหรับระบบเสิร์ชค้นหา

// 🎯 สัญญาณดาวเทียมหลัก: ดักฟังถังข้อมูลประวัติรางวัลแบบซิงค์สายตรงคู่วาล์วชิ้นเดียว
database.ref('users_rewards_vault').on('value', (snapshot) => {
    if (!adminUserRewardsTbody) return;
    const allVaultData = snapshot.val();
    
    // ⚔️ ล้างขยะตกค้าง: สั่งล้างถังแคชความจำเดิมทิ้งทันทีที่มีการขยับลบข้อมูลบนคลาวด์
    globalAllUsersRewardsCache = [];

    if (!allVaultData) {
        adminUserRewardsTbody.innerHTML = `<tr><td colspan="4" style="color:#555; text-align:center; padding: 20px;">📦 ระบบเชื่อมต่อสำเร็จ: ตอนนี้ไม่มีตั๋วคูปองค้างเคลมบนฐานข้อมูลแล้วครับน้า</td></tr>`;
        return;
    }

    try {
        // กวาดสายสัญญาณเจาะลึกแกะกล่องข้อมูลทีละไอดีผู้ใช้ (UID)
        Object.keys(allVaultData).forEach(uid => {
            const userItems = allVaultData[uid];
            if (userItems && typeof userItems === 'object') {
                Object.keys(userItems).forEach(itemKey => {
                    const info = userItems[itemKey];
                    if (info) {
                        // 🎯 มัดสายไฟสำคัญ: บังคับบันทึกประทับตราฝังค่า userUid และ couponKey เข้าถังแคชหลักให้สคริปต์สไนเปอร์หยิบไปใช้งานลบรายชิ้นได้ถูกต้อง
                        globalAllUsersRewardsCache.push({
                            userUid: uid,
                            couponKey: itemKey,
                            accountName: info.userName || info.username || "ANONYMOUS USER", 
                            rewardName: info.rewardName || "UNKNOWN REWARD",
                            ticketId: info.ticketId || "NO-CODE", 
                            timestamp: info.wonTimestamp || info.timestamp || Date.now()
                        });
                    }
                });
            }
        });

        // จัดคิวเรียงประวัติตามเวลาล่าสุดขึ้นก่อนเสมอ
        globalAllUsersRewardsCache.sort((a, b) => b.timestamp - a.timestamp);
        
        // สั่งพ่นตารางข้อมูลใหม่ล่าสุดอัปเดตแบบเรียลไทม์
        const currentSearchQuery = adminSearchInput ? adminSearchInput.value : "";
        renderFilteredUserRewards(currentSearchQuery);
        
    } catch (error) {
        console.error("ระบบกวาดประวัติสะดุด: ", error);
        adminUserRewardsTbody.innerHTML = `<tr><td colspan="4" style="color:#ff3333; text-align:center; padding: 20px;">❌ เกิดข้อผิดพลาดทางเทคนิค: ${error.message}</td></tr>`;
    }
});

// ฟังก์ชันสั่งเขียนโครงตารางประวัติผู้ใช้งานพร้อมปุ่ม USED
function renderFilteredUserRewards(filterText) {
    if (!adminUserRewardsTbody) return;
    
    // ⚔️ ตัดปัญหาตารางเบิ้ล: สั่งล้าง HTML บรรทัดเก่าทิ้งให้เกลี้ยงก่อนจะวาดใหม่
    adminUserRewardsTbody.innerHTML = '';
    const query = filterText.toLowerCase().trim();

    if (globalAllUsersRewardsCache.length === 0) {
        adminUserRewardsTbody.innerHTML = `<tr><td colspan="4" style="color:#555; text-align:center; padding: 20px;">📦 ไม่มีประวัติข้อมูลตั๋วคูปองค้างในระบบขณะนี้</td></tr>`;
        return;
    }

    // ตัวกรองช่องพิมพ์ค้นหาด่วน
    const filteredList = globalAllUsersRewardsCache.filter(item => {
        const ticketStr = item.ticketId ? item.ticketId.toLowerCase() : "";
        const nameStr = item.accountName ? item.accountName.toLowerCase() : "";
        const rewardStr = item.rewardName ? item.rewardName.toLowerCase() : "";
        
        return nameStr.includes(query) || rewardStr.includes(query) || ticketStr.includes(query);
    });

    if (filteredList.length === 0) {
        adminUserRewardsTbody.innerHTML = `<tr><td colspan="4" style="color:#ff007f; text-align:center; padding: 15px;">❌ ไม่พบข้อมูลชื่อแร็ปเปอร์หรือรหัสตั๋วที่ตรงกับ "[ ${filterText} ]" ครับน้า</td></tr>`;
        return;
    }

    filteredList.forEach(item => {
        const tr = document.createElement('tr');
        const dateStr = new Date(item.timestamp).toLocaleString('th-TH', { 
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
        
        const currentTicketId = item.ticketId ? item.ticketId : "NO-ID";
        
        tr.innerHTML = `
            <td style="color:#fff; font-weight:bold;"><i class="fa-solid fa-circle-user" style="color:#ffaa00; font-size:0.8rem; margin-right:5px;"></i> ${item.accountName}</td>
            <td>
                <span style="color:#00ffff; font-family:monospace; font-weight:bold; display:block;">[ ${item.rewardName} ]</span>
                <span style="color:#fff000; font-family:monospace; font-size:0.75rem; font-weight:bold; background:rgba(255,240,0,0.05); padding:1px 4px; border-radius:2px; border:1px solid rgba(255,240,0,0.1); margin-top:3px; display:inline-block;">CODE: ${currentTicketId}</span>
            </td>
            <td style="color:#555; font-size:0.75rem; font-family:monospace;">${dateStr}</td>
            <td style="text-align: center;">
                <!-- ปุ่มสับเคลมสิทธิ์พ่วงสไนเปอร์ คัดแยกคีย์ UID และคีย์ของรางวัลตรงจุดของแท้ -->
                <button type="button" class="delete-artist-btn" style="color:#ff3333; font-weight:800; background:rgba(255,51,51,0.03); border:1px solid rgba(255,51,51,0.2); padding:5px 10px; border-radius:4px; cursor:pointer;" onclick="markCouponAsUsedInCloud('${item.userUid}', '${item.couponKey}', '${currentTicketId}')">
                    <i class="fa-solid fa-eraser"></i> USED
                </button>
            </td>
        `;
        adminUserRewardsTbody.appendChild(tr);
    });
}

// 🎯 🚀 เครื่องยนต์ลบพิฆาต: ค้นหาไอเท็มในคลาวด์ที่มีรหัสตั๋วตรงเป๊ะ แล้วสั่งทำลายทิ้งทันที (แก้ปัญหาคีย์ว่าง คีย์หลุดค้างบอร์ด)
function markCouponAsUsedInCloud(userUid, couponKey, ticketId) {
    if (!userUid || !ticketId || ticketId === "NO-ID" || ticketId === "NO-CODE") {
        alert("❌ ข้อผิดพลาด: ไม่สามารถดึงรหัสตั๋วหรือไอดีผู้ใช้มาประมวลผลลัพธ์ได้ครับน้า");
        return;
    }
    
    if (confirm(`🚨 ยืนยันการเคลมสิทธิ์และทำลายตั๋วรหัส [ ${ticketId} ] ใช่หรือไม่?\n(ตั๋วใบนี้จะโดนลบถาวรออกจากตู้เซฟผู้ใช้หน้าบ้านและตารางแอดมินพร้อมกันออโต้ครับน้าบักหำทิว)`)) {
        
        // มุ่งหน้าเจาะลึกเข้าไปที่ถังเก็บส่วนตัวของผู้ใช้รายนี้บนเซิร์ฟเวอร์จริง
        const userRef = database.ref(`users_rewards_vault/${userUid}`);
        
        userRef.once('value')
            .then((snapshot) => {
                const items = snapshot.val();
                if (!items) {
                    alert("❌ สัญญาณขาดหาย: ไม่พบข้อมูลคูปองหลงเหลือในตู้เซฟของผู้ใช้รายนี้แล้วครับ");
                    return;
                }
                
                let targetRealFirebaseKey = null;
                
                // วนลูปตรวจเช็กในเซิร์ฟเวอร์จริงว่า คีย์ไหนข้างในที่มีรหัส ticketId ตรงกับปุ่มแอดมินที่น้ากด
                Object.keys(items).forEach(actualKey => {
                    if (items[actualKey] && items[actualKey].ticketId === ticketId) {
                        targetRealFirebaseKey = actualKey; // 🎯 ค้นพบเป้าหมายคีย์แท้ของ Firebase แล้วครับน้า!
                    }
                });
                
                // ถ้าระบบตรวจเจอคีย์แท้ สั่งระเบิดลบทำลายไอเท็มชิ้นนี้ออกจากชั้นบรรยากาศคลาวด์ทันที
                if (targetRealFirebaseKey) {
                    userRef.child(targetRealFirebaseKey).remove()
                        .then(() => {
                            alert(`🔥 สำเร็จเสร็จสรรพ! เคลียร์สิทธิ์ตั๋วรหัส ${ticketId} ออกจากระบบเรียบร้อยครับน้าบักหำทิว!`);
                        })
                        .catch((error) => {
                            alert(`❌ Firebase Rules สั่งบล็อกการลบ: ${error.message}`);
                        });
                } else {
                    // แผนสำรอง: ถ้าวนลูปหาไม่เจอ ให้ใช้คีย์สำรองดั้งเดิมยิงทำลายซ้ำลงไปตรงๆ
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

// ผูกตัวรับแรงกดช่องพิมพ์ค้นหาด่วน
if (adminSearchInput) {
    adminSearchInput.addEventListener('input', (e) => {
        renderFilteredUserRewards(e.target.value);
    });
}

// =================================================================
// ─── 📥 DEMO DROPBOX ENGINE (แผงหลังบ้านตู้แดงรับเพลง) ───
// =================================================================
const demoTbody = document.getElementById('demo-list-tbody');

database.ref('udg_demo_dropbox').on('value', (snapshot) => {
    if (!demoTbody) return;
    demoTbody.innerHTML = '';
    const demos = snapshot.val();
    
    if (!demos) {
        demoTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center; padding: 20px;">📭 ตู้จดหมายว่างเปล่า: ยังไม่มีศิลปินหน้าใหม่หย่อนเพลงเข้ามาครับน้า</td></tr>`;
        return;
    }

    // วนลูปดึงข้อมูลมาเรียงในตาราง
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

// ฟังก์ชันลบจดหมายเพลงเมื่อแอดมินจัดการเสร็จแล้ว
function deleteDemoTrack(key) {
    if (confirm("🚨 แจ้งเตือนแอดมิน: คุณฟังเพลงนี้และต้องการลบออกจากกล่องข้อความแล้วใช่หรือไม่?")) {
        database.ref(`udg_demo_dropbox/${key}`).remove()
            .then(() => { alert("🔥 ล้างกล่องจดหมายเรียบร้อยครับน้า!"); })
            .catch((err) => { alert("❌ เกิดข้อผิดพลาดในการลบ: " + err.message); });
    }
}

// =================================================================
// ─── 📊 ADMIN COMMAND CENTER ENGINE (หน้าจอสรุปสถิติเรียลไทม์) ───
// =================================================================
const dashOnline = document.getElementById('dashOnline');
const dashDemos = document.getElementById('dashDemos');
const dashGraffiti = document.getElementById('dashGraffiti');
const dashCases = document.getElementById('dashCases');

// 1. สแกนนับจำนวนคนกำลังออนไลน์ (STREET ONLINE)
database.ref('online_users').on('value', (snapshot) => {
    if (dashOnline) dashOnline.innerText = snapshot.numChildren() || 0;
});

// 2. สแกนนับ Demo เพลงที่รอตรวจ (PENDING DEMOS)
database.ref('udg_demo_dropbox').on('value', (snapshot) => {
    if (dashDemos) dashDemos.innerText = snapshot.numChildren() || 0;
});

// 3. กวาดนับข้อความพ่นสีรวมทั้งหมดจากทุกห้อง (TOTAL GRAFFITI)
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

// 4. กวาดประวัตินับจำนวนกล่องที่ถูกเปิดไปแล้วทั้งหมด (CASES OPENED)
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

// =================================================================
// ─── 🛒 ADMIN MERCH ORDERS ENGINE (ระบบหลังบ้านจัดการออเดอร์) ───
// =================================================================
const orderTbody = document.getElementById('order-list-tbody');

database.ref('udg_merch_orders').on('value', (snapshot) => {
    if (!orderTbody) return;
    orderTbody.innerHTML = '';
    const orders = snapshot.val();
    
    if (!orders) {
        orderTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center; padding: 20px;">📦 ยังไม่มีออเดอร์เข้ามาครับน้า</td></tr>`;
        return;
    }

    // แปลง object เป็น array แล้วเรียงตามเวลาล่าสุด
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

// =================================================================
// ─── 📸 ADMIN AUTO IMAGE UPLOADER (ระบบแปลงรูปเป็นลิงก์อัตโนมัติผ่าน ImgBB) ───
// =================================================================

// 🔑 ก๊อปปี้ API Key ของ ImgBB ที่น้าสมัครไว้มาใส่ตรงนี้ครับ
const ADMIN_IMGBB_API_KEY = "ba210b7b494a630b713c297b74f51d65"; 

function setupImgbbAutoUploader(fileInputId, urlInputId, statusTextId, previewCallback) {
    const fileInput = document.getElementById(fileInputId);
    const urlInput = document.getElementById(urlInputId);
    const statusText = document.getElementById(statusTextId);

    if (!fileInput || !urlInput) return;

    fileInput.addEventListener('change', async function() {
        const file = this.files[0];
        if (!file) return;

        // แสดงสถานะกำลังอัปโหลด
        if (statusText) {
            statusText.style.display = 'block';
            statusText.style.color = '#ffaa00';
            statusText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> UPLOADING TO CLOUD...';
        }
        urlInput.disabled = true; // ล็อกช่องลิงก์ไว้กันแอดมินพิมพ์แทรก

        const formData = new FormData();
        formData.append('image', file);

        try {
            // ยิงไฟล์ขึ้น ImgBB
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${ADMIN_IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                // ได้ลิงก์มาแล้ว จับยัดลงช่อง Input ทันที
                urlInput.value = data.data.url;
                
                // สั่งให้ Live Preview อัปเดตรูปโชว์แอดมิน
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
            this.value = ''; // เคลียร์ไฟล์ที่เลือกออก เผื่อกดเลือกรูปใหม่
        }
    });
}

// 🎯 สั่งเปิดใช้งานระบบอัปโหลดกับช่อง "ลงข่าวสาร (NEWS)"
setupImgbbAutoUploader('adminNewsImgFile', 'adminNewsImg', 'newsUploadStatus', updateLivePreview);
// 🎯 ปลุกระบบอัปโหลดรูปอัตโนมัติให้ทำงานในแท็บอื่นๆ ด้วย
setupImgbbAutoUploader('newAdImgFile', 'newAdImage', 'adUploadStatus');
setupImgbbAutoUploader('newPartnerImgFile', 'newPartnerImg', 'logoUploadStatus', updateLogoPreview); // มีอัปเดต Preview ด้วย
setupImgbbAutoUploader('newGigImgFile', 'newGigImg', 'gigUploadStatus');
setupImgbbAutoUploader('newWheelImgFile', 'newWheelImg', 'wheelUploadStatus');

// =================================================================
// ─── 🤝 ADMIN COLLAB BOARD ENGINE (หลังบ้านจัดการบอร์ดประกาศ) ───
// =================================================================
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

function deleteCollabAd(key) {
    if (confirm("🚨 ต้องการลบประกาศนี้ออกจากบอร์ดใช่หรือไม่?")) {
        database.ref(`udg_collab_board/${key}`).remove();
    }
}