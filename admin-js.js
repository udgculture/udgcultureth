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
    // 🎯 แก้ไขบั๊กปลั๊กหลุดหน้าประตู: บังคับให้เมนูด้านบนแสดงผลแบบ flex เพื่อให้ตรงสัดส่วน Layout CSS
    document.getElementById("adminTabsMenu").style.display = "flex";
    switchTabMenu("newsPanelBox");
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
        if (!trackTbody) return;
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
    if (!items) {
        wheelTbody.innerHTML = `<tr><td colspan="3" style="color:#555; text-align:center;">🎡 บอร์ดตารางวงล้อยังว่างเปล่า สาดของรางวัลลดราคาชิ้นใหม่บรรทัดบนได้เลยคร้าบน้าบักหำทิว!</td></tr>`;
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
    if (!name || !rate) {
        alert("❌ แจ้งเตือนแอดมิน: กรุณากรอกชื่อของรางวัล/รหัสคูปอง และระบุเลขเปอร์เซ็นต์เรทให้ครบถ้วนก่อนคร้าบน้า!");
        return;
    }
    database.ref('udg_lucky_wheel_rewards').push({
        name: name,
        rateWeight: parseFloat(rate),
        timestamp: Date.now()
    }, (error) => {
        if (!error) {
            document.getElementById('newWheelName').value = '';
            document.getElementById('newWheelRate').value = '';
            alert(`🔥 สาดของรางวัล "${name}" เข้าสู่ช่องวงล้อหน้าบ้านเรียบร้อยคร้าบน้าบักหำทิว!`);
        }
    });
});

function removeRewardFromWheelCloud(key) {
    if (confirm("แจ้งเตือนแอดมิน UDG: คุณต้องการลบรางวัลไอเท็มชิ้นนี้ออกจากช่องสุ่มบนวงล้อหน้าบ้านใช่หรือไม่?")) {
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