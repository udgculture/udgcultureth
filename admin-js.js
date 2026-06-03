/* =================================================================
   🚨 UDG CENTRAL CONTROL DESK - MAIN MOTOR ENGINE (admin-js.js)
================================================================= */
const MASTER_ADMIN_PASS = "udg2026"; 

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
    document.getElementById("adminTabsMenu").style.display = "grid"; 
    switchTabMenu("newsPanelBox"); 
}

function kickUserToHome() { window.location.href = "index.html"; }

function switchTabMenu(targetId) {
    document.querySelectorAll(".admin-box").forEach(box => { box.style.display = "none"; });
    document.querySelectorAll(".tab-trigger-btn").forEach(btn => { btn.classList.remove("active"); });
    document.getElementById(targetId).style.display = "block";
    document.querySelector(`.tab-trigger-btn[data-target="${targetId}"]`).classList.add("active");
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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 📰 [ระบบแท็บที่ 1] โพสต์อัปเดตฟีดข่าวและเรดาร์ศิลปิน
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

// 🎵 [ระบบแท็บที่ 2] จัดการตู้เซ็ตเพลงโหวตประจำสัปดาห์
const trackTbody = document.getElementById('track-list-tbody');
function getAdminCurrentWeekKey() {
    const d = new Date(); const day = d.getDay(); const hours = d.getHours(); let target = new Date(d);
    let diff = (day >= 5) ? (day - 5) : (day + 2);
    if (day === 5 && hours < 10) { diff = -7; } else if (day === 5 && hours >= 10) { diff = 0; } else { diff = diff * -1; }
    target.setDate(d.getDate() + diff); target.setHours(10, 0, 0, 0);
    const yyyy = target.getFullYear(); const mm = String(target.getMonth() + 1).padStart(2, '0'); const dd = String(target.getDate()).padStart(2, '0');
    return `week_${yyyy}_${mm}_${dd}`;
}

function listenToCurrentWeekTracks() {
    const currentWeekId = getAdminCurrentWeekKey();
    database.ref(`udg_weekly_tracks_vault/${currentWeekId}`).on('value', (s) => {
        trackTbody.innerHTML = ''; const weeklyTracks = s.val();
        if (!weeklyTracks) { trackTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center;">🎵 เซ็ตโหวตสัปดาห์นี้ยังว่างเปล่า สาดเพลงโฆษณาค่ายชุดใหม่บรรทัดบนได้เลยครับน้าบักหำทิว!</td></tr>`; return; }
        Object.keys(weeklyTracks).forEach(key => {
            const track = weeklyTracks[key]; const tr = document.createElement('tr');
            tr.innerHTML = `<td><strong>${track.title}</strong><br><span style="color:#555; font-size:0.75rem;">${track.artist}</span></td><td style="color:#00ffff; font-family:monospace;">${track.ytId}</td><td><button class="delete-artist-btn" onclick="removeTrackFromCurrentWeek('${key}')">// REMOVE</button></td>`;
            trackTbody.appendChild(tr);
        });
    });
}
listenToCurrentWeekTracks();

document.getElementById('addTrackBtn').addEventListener('click', () => {
    const currentWeekId = getAdminCurrentWeekKey(); const title = document.getElementById('newTrackTitle').value.trim(); const artist = document.getElementById('newTrackArtist').value.trim(); const ytId = document.getElementById('newTrackYtId').value.trim();
    if (!title || !artist || !ytId) { alert("❌ กรุณากรอกรายละเอียดช่องเพลงให้ครบถ้วนก่อนครับน้า!"); return; }
    const trackRandomId = "track_" + Date.now();
    database.ref(`udg_weekly_tracks_vault/${currentWeekId}/${trackRandomId}`).set({ id: trackRandomId, title: title, artist: artist, ytId: ytId }, (err) => { if (!err) { document.getElementById('newTrackTitle').value = ''; document.getElementById('newTrackArtist').value = ''; document.getElementById('newTrackYtId').value = ''; alert(`🔥 สาดเพลงใหม่สำเร็จแล้วครับน้า!`); } });
});
function removeTrackFromCurrentWeek(trackKey) { const currentWeekId = getAdminCurrentWeekKey(); if (confirm("คุณต้องการถอดเพลงนี้ออกใช่หรือไม่?")) database.ref(`udg_weekly_tracks_vault/${currentWeekId}/${trackKey}`).remove(); }

// 🎤 [ระบบแท็บที่ 3] มอบสิทธิ์คีย์แร็ปเปอร์พ่นสีทอง
const tbody = document.getElementById('artist-list-tbody');
database.ref('udg_artist_credentials').on('value', (s) => {
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

// 🤝 [ระบบแท็บที่ 6] แอดรูปโลโก้แบรนด์สปอนเซอร์วิ่งแถวล่างสุดแบบอินฟินิตี้
const logoTbody = document.getElementById('logo-list-tbody');
database.ref('udg_culture_partners_logos').on('value', (snapshot) => {
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
// =================================================================
// ─── 📅🤝 [ระบบแท็บที่ 7 อัปเกรดสมบูรณ์] ENGINE: จัดการและอัปเดตสถานะคอนเสิร์ตพ่วงโปสเตอร์ ───
// =================================================================
const gigTbody = document.getElementById('gig-list-tbody');

// หูฟัง Realtime คอยดึงรายชื่ออีเวนต์พร้อมสร้าง Dropdown คาตารางหลังบ้าน
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

// ฟังก์ชันสั่งสับเปลี่ยนสถานะไฟหน้าบ้านแบบนาทีต่อนาทีอัปเดตขึ้น Firebase
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

// 🎯 ฟังก์ชันหลักตัวเดียวเด่น ๆ: สาดข้อมูลคอนเสิร์ตพ่วงลิงก์รูปภาพโปสเตอร์ยิงขึ้นระบบคลาวด์ (เหลือตัวนี้ตัวเดียวพอครับ!)
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

function removeGigFromCloud(key) {
    if (confirm("แจ้งเตือนแอดมิน: คุณต้องการลบรายการอีเวนต์คอนเสิร์ตเจ้านี้ออกจากระบบหน้าจอหลักใช่หรือไม่?")) {
        database.ref(`udg_upcoming_gigs/${key}`).remove();
    }
}