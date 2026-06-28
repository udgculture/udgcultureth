// =================================================================
// ─── CONFIG & INITIALIZE ONLINE DATABASE (FIREBASE REALTIME) ───
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyClMPrhjK_XLaY2PBAEuP7hvxK4faFdLJk",
  authDomain: "udg-caht.firebaseapp.com",
  projectId: "udg-caht",
  storageBucket: "udg-caht.firebasestorage.app",
  messagingSenderId: "864209418067",
  appId: "1:864209418067:web:b3c724198275f4a73b53a6",
  measurementId: "G-GCBXWXHYHX",
  databaseURL: "https://udg-caht-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app();
}
const database = firebase.database();

// =================================================================
// ─── 💬 ELEMENT ZONE: CYBER GRAFFITI WALL ───
// =================================================================
const graffitiWall = document.getElementById('graffitiWall');
const graffitiName = document.getElementById('graffitiName');
const graffitiInput = document.getElementById('graffitiInput');
const graffitiBtn = document.getElementById('graffitiBtn');

let currentRoom = 'general_1';
let currentRoomRef = null;
let isCooldown = false;

const rudeWords = [
    "ควย", "เย็ด", "มึง", "กู", "สัส", "เหี้ย", "ระยำ", "ชาติตระกูล", "หี", "แตด", "ปิ๊", 
    "ควาย", "เฮี้ย", "ดกทอง", "ดอกทอง", "ส้นตีน", "ไอ้ควาย", "อีเหี้ย", "ค.วย", "เ-ย",
    "กระหรี่", "กะหรี่", "หน้าหี", "หน้าควย", "จาดงัว", "ชาตินรก", "สารเลว", "ไอ้เวร", "ไอ้สัส", "อีดอก", 
    "อีควาย", "อีเหี้ย", "เหิ้ย", "เจ๊ก", "แต๊ด", "สลัดผัก", "ชิบหาย", "ฉิบหาย", "ปัญญาอ่อน", "ดักดาน",
    "ระยำตำบอน", "สถด", "ไอ้หน้าหมา", "หัวดอ", "หัวควย", "เงี่ยน", "เฆี่ยน", "ชักว่าว", "เย็", "เ_ด",
    "kuay", "kuy", "yee", "yed", "mung", "koo", "gu", "sus", "sat", "heas", "hia", "fack", "fuck",
    "ค ว ย", "เย็ ด", "มึ ง", "กูู", "สั ส", "เ หี้ ย", "ค_ว_ย", "เ_ย็_ด", "ห่_า", "ห่า", "ไอ้ห่า",
    "ควัย", "คว๊าย", "ควิย", "คูวย", "คูยว", "เย็ดแม่", "เย็ดม้า", "ยิ้มแม่", "ยย", "ควม", "เยสแม่",
    "สาด", "สาส", "ส๊าด", "สัสๆ", "ส้นติ้น", "ตีน", "ติน", "สะติน", "หมากระเป๋า", "หน้าม้า"
];

if (localStorage.getItem('savedGraffitiName')) {
    graffitiName.value = localStorage.getItem('savedGraffitiName');
}

const errorModal = document.getElementById('errorModal');
const errorModalTitle = document.getElementById('errorModalTitle');
const errorModalMessage = document.getElementById('errorModalMessage');
const errorModalCloseBtn = document.getElementById('errorModalCloseBtn');

function showErrorAlert(title, message, isSuccess = false) {
    if (!errorModalTitle || !errorModalMessage || !errorModal) {
        alert(title + "\n" + message.replace(/<br>/g, '\n').replace(/<[^>]*>/g, ''));
        return Promise.resolve();
    }
    errorModalTitle.innerText = title;
    errorModalMessage.innerHTML = message;
    
    const customModalIcon = document.getElementById('customModalIcon');
    if (customModalIcon) {
        if (isSuccess) {
            customModalIcon.className = "fa-solid fa-trophy error-modal-icon";
            customModalIcon.style.color = "#39ff14";
        } else {
            customModalIcon.className = "fa-solid fa-triangle-exclamation error-modal-icon";
            customModalIcon.style.color = "#ff3333";
        }
    }

    errorModal.classList.add('active');

    return new Promise((resolve) => {
        function closeError() {
            errorModalCloseBtn.removeEventListener('click', closeError);
            document.removeEventListener('keydown', handleKeyDown);
            errorModal.classList.remove('active');
            resolve();
        }
        function handleKeyDown(e) {
            if (e.key === 'Enter' || e.key === 'Escape') { closeError(); }
        }
        errorModalCloseBtn.addEventListener('click', closeError);
        document.addEventListener('keydown', handleKeyDown);
    });
}

const artistModal = document.getElementById('artistModal');
const modalPasscode = document.getElementById('modalPasscode');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalSubmitBtn = document.getElementById('modalSubmitBtn');

function requestArtistPasscode(artistName) {
    return new Promise((resolve) => {
        modalPasscode.value = '';
        artistModal.classList.add('active');
        modalPasscode.focus();

        function cleanup() {
            modalSubmitBtn.removeEventListener('click', handleSubmit);
            modalCancelBtn.removeEventListener('click', handleCancel);
            modalPasscode.removeEventListener('keypress', handleKeyPress);
            artistModal.classList.remove('active');
        }
        function handleSubmit() {
            const val = modalPasscode.value.trim();
            cleanup();
            resolve(val);
        }
        function handleCancel() {
            cleanup();
            resolve(null);
        }
        function handleKeyPress(e) {
            if (e.key === 'Enter') { handleSubmit(); }
        }
        modalSubmitBtn.addEventListener('click', handleSubmit);
        modalCancelBtn.addEventListener('click', handleCancel);
        modalPasscode.addEventListener('keypress', handleKeyPress);
    });
}

async function sprayGraffiti() {
    let username = graffitiName.value.trim();
    let text = graffitiInput.value.trim();
    
    if (isCooldown) {
        await showErrorAlert('CHILL OUT BRO!', 'รอสเปรย์แห้งแป๊บนึง 4 วินาทีค่อยพ่นใหม่ครับน้า');
        return;
    }
    if (username === '') {
        await showErrorAlert('TAG YOUR NAME!', 'TAG YOUR NAME FIRST!<br>(กรุณาตั้งชื่อเล่นก่อนพ่นสเปรย์ครับน้า)');
        return;
    }
    if (text === '') {
        await showErrorAlert('EMPTY RHYME!', 'RHYME SOMETHING FIRST!<br>(พิมพ์ไรม์หรือข้อความก่อนกดพ่นสเปรย์)');
        return;
    }
    if (text.length > 100) {
        await showErrorAlert('TOO LONG!', 'ยาวเกินไปแล้วน้า จำกัดไม่เกิน 100 ตัวอักษรพอครับ');
        return;
    }

    if (!username.startsWith('@')) { username = '@' + username; }

    if (currentRoom === 'general_1') {
        rudeWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            text = text.replace(regex, '***');
            username = username.replace(regex, '***');
        });
    }

    let isArtist = false;
    let artistEmoji = ""; 
    
    const artistSnapshot = await database.ref('udg_artist_credentials').once('value'); 
    const cloudArtistKeys = artistSnapshot.val() ? artistSnapshot.val() : {}; 
    cloudArtistKeys['@UndergroundCultureTH'] = 'udg2026'; 

    const matchedArtist = Object.keys(cloudArtistKeys).find(key => key.toLowerCase() === username.toLowerCase()); 
    
    if (matchedArtist) {
        username = matchedArtist; 
        const currentTime = Date.now(); 
        const verifiedTime = localStorage.getItem(`verified_time_${username}`); 
        const hasVerified = localStorage.getItem(`verified_${username}`); 
        const sessionDuration = 30 * 60 * 1000; 

        if (hasVerified === cloudArtistKeys[username] && verifiedTime && (currentTime - verifiedTime < sessionDuration)) { 
            isArtist = true; 
        } else {
            const userPasscode = await requestArtistPasscode(username); 
            if (userPasscode === null) return; 

            if (userPasscode === cloudArtistKeys[username]) { 
                isArtist = true; 
                localStorage.setItem(`verified_${username}`, userPasscode); 
                localStorage.setItem(`verified_time_${username}`, currentTime); 
                await showErrorAlert('VERIFIED SUCCESS', 'ยืนยันตัวตนศิลปินสำเร็จ! ระบบจะจำเครื่องนี้ไว้ แร็ปรัวได้ 30 นาทีไม่ต้องกรอกรหัสซ้ำครับ 🔥'); 
            } else {
                await showErrorAlert('SECURITY ALERT', '❌ รหัสลับไม่ถูกต้อง!<br>อย่ามาแอบอ้างชื่อศิลปินแถวนี้ไอ้หนู!'); 
                return; 
            }
        }
        if (isArtist) { 
            const verifiedEmojis = ['✅', '✅']; 
            artistEmoji = verifiedEmojis[Math.floor(Math.random() * verifiedEmojis.length)] + " "; 
        }
    }

    localStorage.setItem('savedGraffitiName', username); 
    const sprayColors = ['#00ffff', '#ff007f', '#39ff14', '#fff000', '#e0e0e0', '#00e5ff']; 
    const randomColor = sprayColors[Math.floor(Math.random() * sprayColors.length)]; 

    const currentUser = firebase.auth().currentUser;
    const userPhotoUrl = currentUser ? currentUser.photoURL : "";

    database.ref(`graffiti_rooms/${currentRoom}`).push({ 
        username: username, 
        text: text, 
        color: randomColor, 
        role: isArtist ? 'artist' : 'user', 
        emoji: artistEmoji, 
        userAvatar: userPhotoUrl, 
        timestamp: Date.now() 
    });

    incrementUserStat('graffiti');
    graffitiInput.value = ''; 
    isCooldown = true; 
    graffitiBtn.style.opacity = '0.5'; 
    graffitiBtn.innerText = 'WAIT...'; 
    setTimeout(() => {
        isCooldown = false; 
        graffitiBtn.style.opacity = '1'; 
        graffitiBtn.innerText = 'SPRAY'; 
    }, 4000); 
}

function listenToRoom(roomName) {
    if (currentRoomRef) {
        currentRoomRef.off();
        database.ref(`graffiti_rooms/${currentRoom}`).off();
    }
    graffitiWall.innerHTML = '';
    currentRoomRef = database.ref(`graffiti_rooms/${roomName}`);

    currentRoomRef.limitToLast(50).on('child_added', (snapshot) => {
        const messageId = snapshot.key;
        const data = snapshot.val();
        const oneDayInMs = 24 * 60 * 60 * 1000; 
        if (data.timestamp && (Date.now() - data.timestamp > oneDayInMs)) {
            database.ref(`graffiti_rooms/${roomName}/${messageId}`).remove();
            return; 
        }

        let displayTime = "";
        if (data.timestamp) {
            const msgDate = new Date(data.timestamp);
            const hours = String(msgDate.getHours()).padStart(2, '0');
            const minutes = String(msgDate.getMinutes()).padStart(2, '0');
            displayTime = `${hours}:${minutes} น.`;
        }

        const newMsg = document.createElement('div');
        newMsg.className = 'graffiti-msg';
        newMsg.id = `msg-${messageId}`;
        
        const respectCount = data.respects ? data.respects : 0;
        const textColor = data.color ? data.color : 'var(--accent-color)';
        
        let userBadge = "";
        let verifiedCheck = ""; 
        let nameStyle = `style="color: ${textColor};"`;
        let displayEmoji = data.emoji ? data.emoji : ""; 

        if (data.username === '@UndergroundCultureTH') {
            nameStyle = `style="color: #ff3333; text-shadow: 0 0 8px rgba(255,51,51,0.5);"`;
        } else if (data.role === 'artist') {
            nameStyle = `style="color: #ffaa00; text-shadow: 0 0 10px rgba(255,170,0,0.6);"`;
            userBadge = `<span class="artist-badge">ARTIST</span>`;
            verifiedCheck = `<i class="fa-solid fa-check-circle verified-tick"></i>`;
        }
        
        let avatarTag = `<span class="msg-avatar-wrap"><i class="fa-solid fa-skull" style="font-size:0.75rem; color:#444;"></i></span>`;
        if (data.userAvatar && data.userAvatar !== "") {
            avatarTag = `<span class="msg-avatar-wrap"><img src="${data.userAvatar}" alt="Profile"></span>`;
        }

        newMsg.innerHTML = `
            <div class="msg-content">
                ${avatarTag}
                <span class="msg-user-wrap">
                    <span class="verified-emoji" style="font-size: 0.9rem;">${displayEmoji}</span>
                    <strong class="msg-username" ${nameStyle}>${data.username}</strong>
                    ${verifiedCheck}
                    ${userBadge}
                    <span class="msg-time">${displayTime}</span>
                </span>
                <span class="msg-divider">:</span>
                <span class="msg-text">${data.text}</span>
            </div>
            <button class="respect-btn" onclick="addRespect('${messageId}')">🔥 <span class="count">${respectCount}</span></button>
        `;
        graffitiWall.appendChild(newMsg);
        graffitiWall.scrollTop = graffitiWall.scrollHeight; 
    });

    currentRoomRef.on('child_changed', (snapshot) => {
        const messageId = snapshot.key;
        const data = snapshot.val();
        const msgElement = document.getElementById(`msg-${messageId}`);
        if (msgElement) {
            const countSpan = msgElement.querySelector('.respect-btn .count');
            if (countSpan) countSpan.innerText = data.respects ? data.respects : 0;
        }
    });

    currentRoomRef.on('child_removed', (snapshot) => {
        const messageId = snapshot.key;
        const msgElement = document.getElementById(`msg-${messageId}`);
        if (msgElement) msgElement.remove();
    });
}

document.querySelectorAll('.room-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.room-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRoom = btn.getAttribute('data-room');
        listenToRoom(currentRoom);
    });
});

listenToRoom(currentRoom);
graffitiBtn.addEventListener('click', sprayGraffiti);
graffitiInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') sprayGraffiti(); });

document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        graffitiInput.value += btn.innerText;
        graffitiInput.focus();
    });
});

const onlineCountRef = database.ref('online_users');
const countElement = document.getElementById('onlineCount');

database.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === true) {
        const myConnectionsRef = onlineCountRef.push();
        myConnectionsRef.onDisconnect().remove();
        myConnectionsRef.set(true);
    }
});
onlineCountRef.on('value', (snapshot) => {
    const currentOnline = snapshot.numChildren();
    countElement.innerText = currentOnline > 0 ? currentOnline : 1;
});

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loader = document.getElementById('web-loader');
        if (loader) loader.classList.add('fade-out');
    }, 1000);
});

// =================================================================
// ─── 🗳️ 🎵 CENTRAL MONTHLY SET CHART ENGINE (รีเซ็ตทุกวันที่ 1) ───
// =================================================================
const liveChartDisplay = document.getElementById('live-chart-display');
const modalVotingList = document.getElementById('modal-voting-list');
const voteSearchInput = document.getElementById('voteSearchInput');

let musicTracksData = {}; 
let globalCurrentMonthVotes = {};
let ytPlayer = null; 
let updateTimerInterval = null;

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('yt-hidden-stream', {
        height: '0',
        width: '0',
        videoId: '',
        playerVars: { 'playsinline': 1, 'controls': 0, 'disablekb': 1 },
        events: { 'onStateChange': onPlayerStateChange }
    });
};

// 🎯 ฟังก์ชันหา Identifier ประจำเดือน (รีเซ็ตวันที่ 1 เวลา 00:01 น.)
function getMonthIdentifier(dateObj) {
    const d = new Date(dateObj);
    let yyyy = d.getFullYear();
    let mm = d.getMonth() + 1;
    let dd = d.getDate();
    let hh = d.getHours();
    let min = d.getMinutes();

    // หากเป็นวันที่ 1 เวลา 00:00 น. พอดี ให้ถือว่าเป็นของเดือนก่อนหน้า (เพราะเราจะรีเซ็ตตอน 00:01 น.)
    if (dd === 1 && hh === 0 && min === 0) {
        let prev = new Date(d.getTime() - 60000); // ถอยกลับไป 1 นาที
        yyyy = prev.getFullYear();
        mm = prev.getMonth() + 1;
    }

    mm = String(mm).padStart(2, '0');
    return `month_${yyyy}_${mm}`;
}

function renderModalVotingStation(currentMonthVotes, filterText = "") {
    if (!modalVotingList) return;
    modalVotingList.innerHTML = '';
    const query = filterText.toLowerCase().trim();
    
    const trackKeys = Object.keys(musicTracksData);
    if (trackKeys.length === 0) {
        modalVotingList.innerHTML = `<div style="color:#555; text-align:center; padding:20px; font-size:0.9rem;">🎵 เดือนใหม่เริ่มขึ้นแล้ว!<br>รอแอดมินสาดเพลงเซ็ตโหวตประจำเดือนนี้เข้าสู่ระบบครับน้า BRO!</div>`;
        return;
    }

    trackKeys.forEach(trackKey => {
        const track = musicTracksData[trackKey];
        const votes = currentMonthVotes[track.id] ? currentMonthVotes[track.id] : 0;
        if (query !== "" && !track.title.toLowerCase().includes(query) && !track.artist.toLowerCase().includes(query)) return;
        
        const voteRow = document.createElement('div');
        voteRow.className = 'vote-station-item';
        voteRow.style.removeAttribute = 'margin-bottom'; 
        voteRow.innerHTML = `
            <div class="track-info">
                <h4 style="color: #fff; font-size: 0.95rem; margin:0;">${track.title}</h4>
                <p style="color: #555; font-size: 0.75rem; margin:0; font-family:'Space Grotesk',sans-serif;">${track.artist}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button type="button" class="vote-up-btn" onclick="submitTrackVote('${track.id}')">🔥 VOTE UP</button>
                <span class="vote-total-badge">${votes} PTS</span>
            </div>
        `;
        modalVotingList.appendChild(voteRow);
    });
}

function submitTrackVote(trackId) {
    const now = new Date();
    const monthId = getMonthIdentifier(now); 
    const todayStr = now.toDateString();
    
    const lastVoteDate = localStorage.getItem(`last_vote_${trackId}`);
    if (lastVoteDate === todayStr) {
        showErrorAlert('VOTE LIMIT!', '❌ YOU ALREADY VOTED TODAY!<br>(น้ากดโหวตเพลงนี้ไปแล้ววันนี้ พรุ่งนี้ค่อยมาดันแต้มใหม่นะครับ BRO!)');
        return;
    }
    
    // ดันคะแนนโหวตลงระบบฐานข้อมูลประจำเดือน
    const trackVoteRef = database.ref(`monthly_music_votes/${monthId}/${trackId}`);
    trackVoteRef.transaction((currentVotes) => { return (currentVotes || 0) + 1; }, (error, committed) => {
        if (committed) {
            localStorage.setItem(`last_vote_${trackId}`, todayStr);
            incrementUserStat('votes');
            showErrorAlert('VOTE SUCCESS', '🔥 คะแนนถูกส่งเข้าระบบประจำเดือนเรียบร้อยแล้ว ขอบคุณที่ช่วยดันชาร์ต UDG ครับ BRO!');
        }
    });
}

function setupMonthlySetMusicEngine() {
    const currentMonthId = getMonthIdentifier(new Date());

    database.ref(`udg_monthly_tracks_vault/${currentMonthId}`).on('value', (trackSnapshot) => {
        const monthlyTracks = trackSnapshot.val();
        musicTracksData = monthlyTracks ? monthlyTracks : {}; 

        database.ref(`monthly_music_votes/${currentMonthId}`).on('value', (voteSnapshot) => {
            const currentMonthVotes = voteSnapshot.val() ? voteSnapshot.val() : {};
            globalCurrentMonthVotes = currentMonthVotes;
            
            if (voteSearchInput) { renderModalVotingStation(currentMonthVotes, voteSearchInput.value); } 
            else { renderModalVotingStation(currentMonthVotes, ""); }

            let sortedList = Object.keys(musicTracksData).map(key => {
                const track = musicTracksData[key];
                return { ...track, votes: currentMonthVotes[track.id] ? currentMonthVotes[track.id] : 0 };
            });
            
            if (liveChartDisplay) {
                liveChartDisplay.innerHTML = '';
                if (sortedList.length === 0) {
                    liveChartDisplay.innerHTML = `<div style="padding:20px; color:#444; text-align:center; font-size:0.85rem;">⏳ WAITING FOR THIS MONTH'S MUSIC SET DROPS...</div>`;
                    return;
                }
                sortedList.sort((a, b) => b.votes - a.votes);
                sortedList.slice(0, 5).forEach((track, index) => {
                    const rankNum = String(index + 1).padStart(2, '0');
                    const chartItem = document.createElement('div');
                    chartItem.className = 'chart-item';
                    chartItem.innerHTML = `
                        <span class="chart-num">${rankNum}</span>
                        <div class="track-info">
                            <h4>${track.title}</h4>
                            <p>${track.artist} <span style="color: #444; font-size:0.75rem; margin-left:5px;">[🔥 ${track.votes} PTS]</span></p>
                        </div>
                        <i class="fa-solid fa-play-circle chart-play" onclick="triggerPlayerFromChart('${track.id}')"></i>
                    `;
                    liveChartDisplay.appendChild(chartItem);
                });
            }
        });
    });
}

setupMonthlySetMusicEngine();

if (voteSearchInput) {
    voteSearchInput.addEventListener('input', (e) => { renderModalVotingStation(globalCurrentMonthVotes, e.target.value); });
}

const voteModal = document.getElementById('voteModal');
const openVoteModalBtn = document.getElementById('openVoteModalBtn');
const closeVoteModalBtn = document.getElementById('closeVoteModalBtn');

if (openVoteModalBtn && voteModal && closeVoteModalBtn) {
    openVoteModalBtn.addEventListener('click', () => {
        if (voteSearchInput) voteSearchInput.value = ""; 
        renderModalVotingStation(globalCurrentMonthVotes, ""); 
        voteModal.classList.add('active');
        if (voteSearchInput) { setTimeout(() => voteSearchInput.focus(), 100); }
    });
    closeVoteModalBtn.addEventListener('click', () => { voteModal.classList.remove('active'); });
}

function triggerPlayerFromChart(trackId) {
    const targetTrack = musicTracksData[trackId];
    const miniPlayer = document.getElementById('mini-audio-player');
    const pTitle = document.getElementById('player-title');
    const pArtist = document.getElementById('player-artist');
    if (targetTrack && miniPlayer && ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        pTitle.innerText = targetTrack.title; pArtist.innerText = targetTrack.artist;
        ytPlayer.loadVideoById(targetTrack.ytId); miniPlayer.classList.add('active');
    }
}

const playerPlayBtn = document.getElementById('player-play-btn');
const playerTimeDisplay = document.getElementById('player-time-display');
const discSpinningIcon = document.querySelector('.disc-spinning');

function onPlayerStateChange(event) {
    if (event.data === 1) {
        if (playerPlayBtn) playerPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        if (discSpinningIcon) discSpinningIcon.style.animationPlayState = 'running';
        startProgressTimer();
    } else {
        if (playerPlayBtn) playerPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        if (discSpinningIcon) discSpinningIcon.style.animationPlayState = 'paused';
        stopProgressTimer();
    }
}

function startProgressTimer() {
    stopProgressTimer();
    updateTimerInterval = setInterval(() => {
        if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function' && playerTimeDisplay) {
            const curTime = ytPlayer.getCurrentTime();
            const mins = String(Math.floor(curTime / 60)).padStart(2, '0');
            const secs = String(Math.floor(curTime % 60)).padStart(2, '0');
            playerTimeDisplay.innerText = `${mins}:${secs}`;
        }
    }, 1000);
}
function stopProgressTimer() { if (updateTimerInterval) clearInterval(updateTimerInterval); }

if (playerPlayBtn) {
    playerPlayBtn.addEventListener('click', () => {
        if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
            const state = ytPlayer.getPlayerState();
            if (state === 1) { ytPlayer.pauseVideo(); } else { ytPlayer.playVideo(); }
        }
    });
}

// =================================================================
// ─── 📰 🔥 CENTRAL APP FEED: ระบบดูดฟีดข่าวสาร และค้นหาข่าว ───
// =================================================================
const liveNewsGrid = document.getElementById('live-news-grid');
const liveFeaturedCard = document.getElementById('live-featured-card');
const liveRadarGrid = document.getElementById('live-radar-grid');

// ฟังก์ชันดูดข่าว Feature
database.ref('udg_homepage_slots/featured_card').on('value', (snapshot) => {
    if (!liveFeaturedCard) return;
    const data = snapshot.val();
    if (!data) {
        liveFeaturedCard.innerHTML = `
            <div class="featured-img-container"><img src="image/BREAKING.png" alt="Featured News"></div>
            <div class="featured-overlay">
                <span class="news-tag">BREAKING</span>
                <h2 class="featured-title">Dxshane - รอ รอ รอ feat. JayQ</h2>
                <p class="featured-excerpt">Dxshane ปล่อย MV เพลงใหม่ "รอ รอ รอ" feat. JayQ ใครฟังแล้วโดนใจบ้าง😓🩹</p>
            </div>`;
        return;
    }
    liveFeaturedCard.innerHTML = `
        <div class="featured-img-container"><img src="${data.image}" alt="Featured News" onerror="this.src='image/BREAKING.png'"></div>
        <div class="featured-overlay">
            <span class="news-tag">${data.tag}</span>
            <h2 class="featured-title">${data.title}</h2>
            <p class="featured-excerpt">${data.excerpt}</p>
        </div>`;
});

// ฟังก์ชันดูดข่าว Radar
let radarDataCard1 = null; let radarDataCard2 = null;
function renderRadarZone() {
    if (!liveRadarGrid) return; liveRadarGrid.innerHTML = '';
    const card1 = radarDataCard1 ? radarDataCard1 : { tag: "DRILL", title: "รอประมวลผล", excerpt: "รอประมวลผล", image: "image/ขาวใส.png", followUrl: "#" };
    const card2 = radarDataCard2 ? radarDataCard2 : { tag: "รอประมวลผล", title: "รอประมวลผล", excerpt: "รอประมวลผล", image: "image/ขาวใส.png", followUrl: "#" };
    
    [card1, card2].forEach(rc => {
        const rcStyle = (rc.tag === "DRILL") ? "tag-drill" : "tag-boombap";
        const cardBox = document.createElement('div');
        cardBox.className = 'news-card radar-card';
        cardBox.innerHTML = `
            <div class="radar-img-wrap"><img src="${rc.image}" alt="Artist Profile" class="radar-avatar" onerror="this.src='image/ขาวใส.png'"></div>
            <div class="radar-body">
                <div class="radar-tag-wrap"><span class="radar-tag ${rcStyle}">${rc.tag}</span></div>
                <h3 class="radar-name">${rc.title}</h3>
                <p class="radar-bio">${rc.excerpt}</p>
                <a href="${rc.followUrl}" target="_blank" class="radar-link">FOLLOW ARTIST &rarr;</a>
            </div>`;
        liveRadarGrid.appendChild(cardBox);
    });
}
database.ref('udg_homepage_slots/radar_card_1').on('value', (snapshot) => { radarDataCard1 = snapshot.val(); renderRadarZone(); });
database.ref('udg_homepage_slots/radar_card_2').on('value', (snapshot) => { radarDataCard2 = snapshot.val(); renderRadarZone(); });


// 🎯 ระบบฟีดข่าวสารหลัก (มีระบบกรองค้นหา และปุ่ม Load More)
let globalNewsList = []; 
let showAllNews = false; 

function renderNewsFeed(searchQuery = "") {
    if (!liveNewsGrid) return;
    liveNewsGrid.innerHTML = '';

    if (globalNewsList.length === 0) {
        liveNewsGrid.innerHTML = `<div style="padding:40px; color:#444; text-align:center; grid-column:1/-1; font-size:0.95rem; font-weight:300; letter-spacing:0.5px;">📰 NO CONTENT CURRENTLY AVAILABLE. SPECIAL UPDATES COMING SOON.</div>`;
        if (document.getElementById('loadMoreNewsContainer')) {
            document.getElementById('loadMoreNewsContainer').style.display = 'none';
        }
        return;
    }

    // ระบบกรองข่าวจากคำค้นหา
    const query = searchQuery.toLowerCase().trim();
    let filteredNews = globalNewsList;
    
    if (query !== "") {
        filteredNews = globalNewsList.filter(news => 
            (news.title && news.title.toLowerCase().includes(query)) || 
            (news.excerpt && news.excerpt.toLowerCase().includes(query)) ||
            (news.tag && news.tag.toLowerCase().includes(query))
        );
    }

    if (filteredNews.length === 0) {
        liveNewsGrid.innerHTML = `<div style="padding:40px; color:#666; text-align:center; grid-column:1/-1;">ไม่พบข่าวสารที่ค้นหา: "${searchQuery}"</div>`;
        if (document.getElementById('loadMoreNewsContainer')) {
            document.getElementById('loadMoreNewsContainer').style.display = 'none';
        }
        return;
    }

    const isMobile = window.innerWidth <= 768;
    const initialLimit = isMobile ? 3 : 6;
    const visibleNews = showAllNews ? filteredNews : filteredNews.slice(0, initialLimit);

    visibleNews.forEach(news => {
        const articleCard = document.createElement('article');
        articleCard.className = 'news-card';
        articleCard.innerHTML = `
            <div class="news-img"><img src="${news.image}" alt="News Image" onerror="this.src='image/ขาวใส.png'"></div>
            <div class="news-content">
                <span class="news-tag">${news.tag}</span>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-excerpt">${news.excerpt}</p>
                <button type="button" style="background:transparent; border:none; color:#ff3333; font-size:0.75rem; margin-top:15px; cursor:pointer; display:block; padding:0;" onclick="deleteNewsItemByAdmin('${news.newsId}')">REMOVE NEWS</button>
            </div>`;
        liveNewsGrid.appendChild(articleCard);
    });

    const loadMoreContainer = document.getElementById('loadMoreNewsContainer');
    if (loadMoreContainer) {
        if (filteredNews.length > initialLimit && !showAllNews) {
            loadMoreContainer.style.display = 'block'; 
        } else {
            loadMoreContainer.style.display = 'none'; 
        }
    }
}

database.ref('udg_news_drops').on('value', (snapshot) => {
    const allNewsData = snapshot.val();
    globalNewsList = []; 
    
    if (allNewsData) {
        globalNewsList = Object.keys(allNewsData).map(key => { return { newsId: key, ...allNewsData[key] }; });
        globalNewsList.sort((a, b) => b.timestamp - a.timestamp); 
    }
    
    const newsSearchInput = document.getElementById('newsSearchInput');
    renderNewsFeed(newsSearchInput ? newsSearchInput.value : ""); 
});

// 📌 ดักจับการพิมพ์ค้นหาข่าว
const newsSearchInput = document.getElementById('newsSearchInput');
if (newsSearchInput) {
    newsSearchInput.addEventListener('input', (e) => {
        showAllNews = true; 
        renderNewsFeed(e.target.value);
    });
}

// ดักจับการคลิกปุ่ม Load More ข่าว
document.addEventListener('DOMContentLoaded', () => {
    const loadMoreBtn = document.getElementById('loadMoreNewsBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            showAllNews = true; 
            const currentQuery = newsSearchInput ? newsSearchInput.value : "";
            renderNewsFeed(currentQuery); 
        });
    }
});

// ตรวจจับการย่อ/ขยาย หรือหมุนหน้าจอโทรศัพท์
window.addEventListener('resize', () => {
    if (!showAllNews) { 
        const currentQuery = newsSearchInput ? newsSearchInput.value : "";
        renderNewsFeed(currentQuery); 
    }
});

async function deleteNewsItemByAdmin(newsId) {
    const adminPass = prompt("กรอกรหัสลับผู้ดูแลระบบเพจ UDG เพื่อยืนยันการลบข่าว:");
    if (!adminPass) return;
    if (adminPass === "udg2026") { database.ref(`udg_news_drops/${newsId}`).remove(); }
}

// =================================================================
// ─── 💸 🔄 AUTOMATED AD ROTATOR SYSTEM ───
// =================================================================
const liveAdBanner = document.getElementById('live-ad-banner');
const liveAdContent = document.getElementById('live-ad-content');
const liveAdImg = document.getElementById('live-ad-img'); 
const adTimerCountdown = document.getElementById('ad-timer-countdown');
const adProgressLaser = document.getElementById('ad-progress-laser');

let currentAdIndex = 0;
let cloudAdsList = [];
let adTickInterval = null; 

const AD_DISPLAY_TIME_MS = 8000; 
let adTimeRemaining = AD_DISPLAY_TIME_MS;

const fallbackDefaultAd = {
    url: "#",
    title: "ADVERTISE WITH US",
    description: "พื้นที่โฆษณาว่าง ติดต่อเพื่อโปรโมทแบรนด์หรืออีเวนต์ของคุณที่นี่",
    image: ""
};

function renderActiveAd() {
    if (!liveAdBanner || !liveAdContent || !liveAdImg) return;

    if (cloudAdsList.length === 0) {
        liveAdBanner.href = fallbackDefaultAd.url;
        liveAdImg.style.display = 'none'; 
        liveAdContent.style.display = 'block'; 
        liveAdContent.innerHTML = `<h3>${fallbackDefaultAd.title}</h3><p>${fallbackDefaultAd.description}</p>`;
        
        if (adTimerCountdown) adTimerCountdown.innerText = "8s";
        if (adProgressLaser) adProgressLaser.style.width = "100%";
        return;
    }

    const activeAd = cloudAdsList[currentAdIndex];
    liveAdBanner.href = activeAd.url;

    if (activeAd.image && activeAd.image !== "") {
        liveAdImg.src = activeAd.image;
        liveAdImg.style.display = 'block'; 
        liveAdContent.style.display = 'none'; 
    } else {
        liveAdImg.style.display = 'none';
        liveAdContent.style.display = 'block';
        liveAdContent.innerHTML = `<h3>${activeAd.title}</h3><p>${activeAd.description}</p>`;
    }

    currentAdIndex = (currentAdIndex + 1) % cloudAdsList.length;
    adTimeRemaining = AD_DISPLAY_TIME_MS;
    if (adTimerCountdown) adTimerCountdown.innerText = "8s";
    if (adProgressLaser) adProgressLaser.style.width = "100%";
}

function startAdProgressBarEngine() {
    if (adTickInterval) clearInterval(adTickInterval);
    
    adTickInterval = setInterval(() => {
        if (cloudAdsList.length <= 1) {
            if (adProgressLaser) adProgressLaser.style.width = "100%";
            if (adTimerCountdown) adTimerCountdown.innerText = "8s";
            return;
        }

        adTimeRemaining -= 100;

        if (adTimerCountdown) {
            const secondsText = Math.ceil(adTimeRemaining / 1000);
            adTimerCountdown.innerText = `${secondsText > 0 ? secondsText : 0}s`;
        }

        if (adProgressLaser) {
            const percentageWidth = (adTimeRemaining / AD_DISPLAY_TIME_MS) * 100;
            adProgressLaser.style.width = `${percentageWidth > 0 ? percentageWidth : 0}%`;
        }

        if (adTimeRemaining <= 0) {
            renderActiveAd();
        }
    }, 100);
}

database.ref('udg_live_advertisements').on('value', (snapshot) => {
    const data = snapshot.val();
    cloudAdsList = [];
    currentAdIndex = 0;

    if (data) {
        Object.keys(data).forEach(key => { cloudAdsList.push(data[key]); });
    }

    renderActiveAd();
    if (adTickInterval) clearInterval(adTickInterval);
    startAdProgressBarEngine();
});

// =================================================================
// ─── 🤝 💛 DYNAMIC SPONSOR & LABEL PARTNERS TICKER ENGINE ───
// =================================================================
const sponsorTickerTrack = document.querySelector('.sponsor-ticker-track');

const fallbackDefaultLogos = [
    { name: "UDG Default 1", image: "image/ขาวใส.png" },
    { name: "UDG Default 2", image: "image/ขาวใส.png" },
    { name: "UDG Default 3", image: "image/ขาวใส.png" },
    { name: "UDG Default 4", image: "image/ขาวใส.png" },
    { name: "UDG Default 5", image: "image/ขาวใส.png" }
];

function renderSponsorTickerItems(logosArray) {
    if (!sponsorTickerTrack) return;
    sponsorTickerTrack.innerHTML = '';

    let infiniteLogosList = [];
    if (logosArray.length > 0) {
        infiniteLogosList = [...logosArray, ...logosArray, ...logosArray, ...logosArray];
    } else {
        infiniteLogosList = [...fallbackDefaultLogos, ...fallbackDefaultLogos, ...fallbackDefaultLogos];
    }

    infiniteLogosList.forEach(partner => {
        const logoDiv = document.createElement('div');
        logoDiv.className = 'sponsor-logo-item';
        logoDiv.innerHTML = `<img src="${partner.image}" alt="${partner.name}" title="${partner.name}" onerror="this.src='image/ขาวใส.png'">`;
        sponsorTickerTrack.appendChild(logoDiv);
    });
}

database.ref('udg_culture_partners_logos').on('value', (snapshot) => {
    const data = snapshot.val();
    let currentLogosList = [];

    if (!data) {
        currentLogosList = fallbackDefaultLogos;
    } else {
        Object.keys(data).forEach(key => { currentLogosList.push(data[key]); });
    }

    renderSponsorTickerItems(currentLogosList);
});

// =================================================================
// ─── 📅🤝 DYNAMIC UPCOMING GIGS & EVENTS ENGINE ───
// =================================================================
const liveGigListContainer = document.querySelector('.gig-list');

database.ref('udg_upcoming_gigs').on('value', (snapshot) => {
    if (!liveGigListContainer) return;
    liveGigListContainer.innerHTML = '';
    const gigsData = snapshot.val();

    if (!gigsData) {
        liveGigListContainer.innerHTML = `
            <div style="padding:30px; color:#444; text-align:center; font-size:0.9rem; font-family:'Space Grotesk',sans-serif; letter-spacing:0.5px;">
                📅 NO UPCOMING GIGS CURRENTLY SCHEDULED.<br>STAY TUNED FOR SPECIAL PARTY DROPS!
            </div>`;
        return;
    }

    let sortedGigs = Object.keys(gigsData).map(key => { return { gigId: key, ...gigsData[key] }; });
    sortedGigs.sort((a, b) => b.timestamp - a.timestamp);

    sortedGigs.forEach(gig => {
        const gigItemDiv = document.createElement('div');
        gigItemDiv.className = 'gig-item';

        let buttonText = "ดูรายละเอียดงาน";
        if (gig.status === "btn-comingsoon") buttonText = "COMING SOON";
        if (gig.status === "btn-ticket") buttonText = "BUY TICKET";
        if (gig.status === "btn-ended") buttonText = "งานจบลงแล้ว";

        const posterImg = gig.image ? gig.image : "image/ขาวใส.png";

        gigItemDiv.innerHTML = `
            <div class="gig-date"><span>${gig.day}</span>${gig.month}</div>
            <div class="gig-poster-wrap">
                <img src="${posterImg}" alt="GIG POSTER" onerror="this.src='image/ขาวใส.png'">
            </div>
            <div class="gig-info">
                <h3>${gig.title}</h3>
                <p><i class="fa-solid fa-location-dot"></i> ${gig.location}</p>
            </div>
            <a href="${gig.url}" target="_blank" class="gig-btn ${gig.status}">${buttonText}</a>
        `;
        liveGigListContainer.appendChild(gigItemDiv);
    });
});

// =================================================================
// ─── 🎰 มอเตอร์สุ่มตู้สไลด์ CS:GO ระบบเรดาร์วัดระยะสอดคล้องตามหน้าจอมือถือจริง ───
// =================================================================
let wheelItemsList = []; 
let isCaseSpinning = false; 
let preloadedImageCache = []; 

function buildInitialCsgoStrip() {
    if (isCaseSpinning || wheelItemsList.length === 0 || !csgoStrip) return;
    csgoStrip.style.transition = 'none';
    csgoStrip.style.transform = 'translateX(0px)';
    csgoStrip.innerHTML = '';
    
    for (let i = 0; i < 15; i++) {
        const item = wheelItemsList[i % wheelItemsList.length];
        csgoStrip.appendChild(createItemCardNode(item, i));
    }
}

function createItemCardNode(item, index) {
    const card = document.createElement('div');
    let rarityClass = 'rarity-common';
    const rewardNameText = item.name ? item.name.toString() : "";
    
    if (rewardNameText.includes('300') || rewardNameText.includes('ใหญ่') || rewardNameText.includes('เสื้อ')) {
        rarityClass = 'rarity-legendary'; 
    } else if (rewardNameText.includes('150') || rewardNameText.includes('100')) {
        rarityClass = 'rarity-epic';      
    } else if (rewardNameText.includes('50') || rewardNameText.includes('20') || rewardNameText.includes('30')) {
        rarityClass = 'rarity-rare';      
    } else if (rewardNameText.includes('เกลือ')) {
        rarityClass = 'rarity-common';    
    }
    
    card.className = `csgo-item-card ${rarityClass}`;
    const itemImgUrl = (item.image && item.image.trim() !== "") ? item.image : "image/ขาวใส.png";
    card.innerHTML = `<img src="${itemImgUrl}" onerror="this.src='image/ขาวใส.png'"><p>${rewardNameText}</p>`;
    return card;
}

function renderVisiblePool() {
    if (!userVisibleRewardsPool) return;
    userVisibleRewardsPool.innerHTML = '';
    if (wheelItemsList.length === 0) {
        userVisibleRewardsPool.innerHTML = `<span style="color:#444; font-size:0.8rem; text-align:center; width:100%;">⏳ ไม่มีไอเท็มในระบบขณะนี้</span>`;
        return;
    }
    wheelItemsList.forEach(item => {
        const badge = document.createElement('span');
        badge.className = "wheel-badge-item";
        badge.innerHTML = `🎁 <span>${item.name}</span>`;
        userVisibleRewardsPool.appendChild(badge);
    });
}

function preloadAllRewardImages(itemsArray) {
    preloadedImageCache = [];
    itemsArray.forEach(item => {
        if (item.image && item.image.trim() !== "") {
            const img = new Image();
            img.src = item.image;
            preloadedImageCache.push(img);
        }
    });
}

function listenToMySavedCouponsVault(uid) {
    if (!myCouponsList) return;
    database.ref(`users_rewards_vault/${uid}`).on('value', (snapshot) => {
        myCouponsList.innerHTML = '';
        const coupons = snapshot.val();
        if (!coupons) {
            myCouponsList.innerHTML = `<div style="color:#333; text-align:center; padding-top:100px; font-size:0.85rem;">🎁 ตู้เซฟของคุณยังว่างเปล่า<br>กดเปิดกล่องสุ่มสไลด์เพื่อลุ้นรับคูปองกันน้า BRO!</div>`;
            return;
        }
        Object.keys(coupons).forEach(k => {
            const item = coupons[k];
            const dateObj = new Date(item.wonTimestamp);
            const dateStr = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
            const timeStr = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น.";
            const ticketIdDisplay = item.ticketId ? item.ticketId : "NO-ID";

            const div = document.createElement('div');
            div.className = "vault-coupon-card";
            div.innerHTML = `
                <div>
                    <strong class="coupon-info-title">🎫 ${item.rewardName}</strong>
                    <span class="coupon-secret-code-badge">CODE: ${ticketIdDisplay}</span>
                    <span class="coupon-timestamp"><i class="fa-solid fa-clock"></i> ได้รับเมื่อ: ${dateStr} - ${timeStr}</span>
                </div>
                <span class="coupon-status-ready">READY</span>
            `;
            myCouponsList.appendChild(div);
        });
        myCouponsList.scrollTop = myCouponsList.scrollHeight;
    });
}

database.ref('udg_lucky_wheel_rewards').on('value', (snapshot) => {
    const data = snapshot.val();
    wheelItemsList = [];
    if (data) {
        Object.keys(data).forEach(k => { wheelItemsList.push({ id: k, ...data[k] }); });
    }
    preloadAllRewardImages(wheelItemsList); 
    buildInitialCsgoStrip();
    renderVisiblePool();
});

function corePhysicsCaseSpin(winnerItem) {
    return new Promise((resolve) => {
        if (!csgoStrip) return resolve();
        
        csgoStrip.style.transition = 'none';
        csgoStrip.style.transform = 'translateX(0px)';
        csgoStrip.innerHTML = '';

        const totalItemsInSpin = 60;   
        const targetStopCardIndex = 45; 

        for (let i = 0; i < totalItemsInSpin; i++) {
            let currentItem;
            if (i === targetStopCardIndex) {
                currentItem = winnerItem;
            } else {
                currentItem = wheelItemsList[Math.floor(Math.random() * wheelItemsList.length)];
            }
            csgoStrip.appendChild(createItemCardNode(currentItem, i));
        }

        const currentWrapperWidth = csgoStrip.parentElement.getBoundingClientRect().width;
        const currentActualCardWidth = csgoStrip.children[0].getBoundingClientRect().width || 130;
        const realCenterLine = currentWrapperWidth / 2;
        const innerCardOffset = (currentActualCardWidth / 2) + (Math.floor(Math.random() * 6) - 3);
        const finalStopX = -((targetStopCardIndex * currentActualCardWidth) + innerCardOffset - realCenterLine);

        setTimeout(() => {
            csgoStrip.style.transition = 'transform 6.5s cubic-bezier(0.1, 0.85, 0.15, 1)';
            csgoStrip.style.transform = `translateX(${finalStopX}px)`;
        }, 80);

        setTimeout(() => { resolve(); }, 6800);
    });
}

if (demoSpinBtn) {
    demoSpinBtn.addEventListener('click', async () => {
        if (isCaseSpinning || wheelItemsList.length === 0) return;

        isCaseSpinning = true;
        demoSpinBtn.innerText = "TEST SPINNING...";
        openCaseBtn.style.opacity = '0.5';

        const mockWinnerIndex = Math.floor(Math.random() * wheelItemsList.length);
        const actualWinnerItem = wheelItemsList[mockWinnerIndex];

        await corePhysicsCaseSpin(actualWinnerItem);

        await showErrorAlert("🔬 DEMO SPIN RESULTS", `[โหมดทดลองหมุนเล่นเพื่อความบันเทิง]<br>กล่องสุ่มดร็อปได้ไอเท็มตัวอย่าง:<br><strong style="color:#00ffff; font-size:1.25rem;">[ ${actualWinnerItem.name} ]</strong><br><br><span style="color:#666; font-size:0.8rem;">*แก้ไขสมการเรดาร์จับพิกเซล คราวนี้เปิดในแอป IG ขีดแดงก็ผ่ากลางตรงชิ้นแล้วครับน้า*</span>`, true);

        buildInitialCsgoStrip();
        isCaseSpinning = false;
        demoSpinBtn.innerHTML = `<i class="fa-solid fa-flask"></i> TEST SPIN`;
        openCaseBtn.style.opacity = '1';
    });
}

if (openCaseBtn) {
    openCaseBtn.addEventListener('click', async () => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            showErrorAlert("ACCESS DENIED", "❌ YOU MUST LOGIN FIRST!<br>กรุณากดล็อกอินสมาชิกด้านบนสุดเพื่อสุ่มรับสิทธิ์ของรางวัลจริงประจำวันครับน้า!");
            return;
        }
        if (isCaseSpinning || wheelItemsList.length === 0) return;

        const uid = currentUser.uid;
        const displayName = currentUser.displayName || "MEMBER UDG";
        const todayKey = new Date().toDateString();

        const checkSnapshot = await database.ref(`users_wheel_cooldown/${uid}/${todayKey}`).once('value');
        if (checkSnapshot.exists()) {
            showErrorAlert("DAILY LIMIT REACHED", "❌ วันนี้น้ากดรับสิทธิ์เปิดกล่องไปแล้วครับ!<br>จำกัดสิทธิ์สุ่มเปิดกล่องวันละ 1 ครั้ง พรุ่งนี้ค่อยแวะมาแก้ตัวใหม่น้า BRO", false);
            return;
        }

        isCaseSpinning = true;
        openCaseBtn.innerText = "OPENING CASE...";
        if (demoSpinBtn) demoSpinBtn.style.opacity = '0.5';

        let totalRateWeight = 0;
        wheelItemsList.forEach(item => { totalRateWeight += parseFloat(item.rateWeight || 0); });
        let randomPointer = Math.random() * totalRateWeight;
        let targetWinnerIndex = 0;
        for (let i = 0; i < wheelItemsList.length; i++) {
            randomPointer -= parseFloat(wheelItemsList[i].rateWeight || 0);
            if (randomPointer <= 0) { targetWinnerIndex = i; break; }
        }
        
        const finalWinnerItem = wheelItemsList[targetWinnerIndex];

        await corePhysicsCaseSpin(finalWinnerItem);

        database.ref(`users_wheel_cooldown/${uid}/${todayKey}`).set({ spun: true, timestamp: Date.now() });
        
        const randomSecretCode = "UDG-" + Math.random().toString(36).substring(2, 7).toUpperCase();
        database.ref(`users_rewards_vault/${uid}`).push({
            rewardName: finalWinnerItem.name,
            userName: displayName,
            ticketId: randomSecretCode,
            wonTimestamp: Date.now()
        });
        incrementUserStat('cases');

        await showErrorAlert("🏆 CASE UNBOXED COMPLETED", `ยินดีด้วยครับน้าบักหำทิว! ได้ของรางวัลตรงปกตรงใจ:<br><strong style="color:#fff000; font-size:1.3rem;">[ ${finalWinnerItem.name} ]</strong><br><br><span style="color: #ff3333; font-weight: bold;">[กรุณาแคปหน้าจอไว้เป็นหลักฐานทันที]</span><br><br>รหัสรหัสตั๋ว CODE ลับยืนยันสิทธิ์: <strong style="color:#00ffff; font-family:monospace;">${randomSecretCode}</strong><br>ระบบอัปเดตใส่ตู้เซฟฝั่งขวาจอเรียบร้อย แคปหน้าจอส่งเคลมทางอินสตาแกรมได้เลยครับ! 🔥`, true);

        buildInitialCsgoStrip();
        isCaseSpinning = false;
        openCaseBtn.innerHTML = `<i class="fa-solid fa-box-open"></i> OPEN CASE`;
        if (demoSpinBtn) demoSpinBtn.style.opacity = '1';
    });
}

// =================================================================
// 🚪 เครื่องยนต์ล็อกอิน 
// =================================================================
const closeAuthBtn = document.getElementById('closeAuthBtn');
const authProviderModal = document.getElementById('authProviderModal');
const openAuthModalBtn = document.getElementById('openAuthModalBtn');
const userDropdownMenu = document.getElementById('userDropdownMenu');
const signOutBtn = document.getElementById('signOutBtn');
const authUserName = document.getElementById('authUserName');
const userProfileDisplay = document.getElementById('userProfileDisplay');
const loginGoogleBtn = document.getElementById('loginGoogleBtn');
const loginFacebookBtn = document.getElementById('loginFacebookBtn');

let isLoginProcessing = false; 

if (openAuthModalBtn && authProviderModal) {
    openAuthModalBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            if (userDropdownMenu) {
                userDropdownMenu.style.display = (userDropdownMenu.style.display === 'block') ? 'none' : 'block';
            }
        } else {
            authProviderModal.classList.add('active'); 
        }
    });
}

if (closeAuthBtn && authProviderModal) {
    closeAuthBtn.addEventListener('click', () => { 
        authProviderModal.classList.remove('active'); 
    });
}

document.addEventListener('click', () => { if (userDropdownMenu) userDropdownMenu.style.display = 'none'; });

function handleAuthSuccess(userObj) {
    if (!userObj) return;
    const displayName = userObj.displayName || "ANONYMOUS";
    const photoURL = userObj.photoURL || "";

    if (authUserName && userProfileDisplay) {
        authUserName.innerText = displayName;
        userProfileDisplay.style.display = "block";
    }
    
    if (openAuthModalBtn) {
        let displayContent = "";
        if (photoURL && photoURL !== "") {
            displayContent = `
                <img src="${photoURL}" class="user-nav-avatar" alt="${displayName}">
                <span class="auth-btn-text" style="color:#00ffff; font-size:0.8rem; font-weight:800; letter-spacing:0.5px;">${displayName.toUpperCase()}</span>
                <i class="fa-solid fa-caret-down" style="font-size:0.7rem; color:#555; margin-left:2px;"></i>
            `;
        } else {
            displayContent = `
                <i class="fa-solid fa-user-check" style="color:#39ff14;"></i> 
                <span class="auth-btn-text">${displayName.toUpperCase()}</span>
            `;
        }
        openAuthModalBtn.innerHTML = displayContent;
        openAuthModalBtn.style.borderColor = "#00ffff";
        openAuthModalBtn.style.padding = "4px 10px 4px 6px"; 
    }

    if (graffitiName && (graffitiName.value === "" || graffitiName.value === "@")) {
        graffitiName.value = displayName.replace(/\s+/g, ''); 
    }

    listenToMySavedCouponsVault(userObj.uid);

    setTimeout(() => { if (authProviderModal) authProviderModal.classList.remove('active'); }, 1200);
}

if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
        try {
            await firebase.auth().signOut();
            if (openAuthModalBtn) {
                openAuthModalBtn.innerHTML = `
                    <div id="authBtnContent" style="display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-right-to-bracket"></i> 
                        <span class="auth-btn-text">LOGIN</span>
                    </div>`;
                openAuthModalBtn.style.borderColor = "var(--accent-color)";
                openAuthModalBtn.style.padding = "8px 16px";
            }
            if (graffitiName) graffitiName.value = "";
            if (userProfileDisplay) userProfileDisplay.style.display = "none";
            
            if (myCouponsList) {
                 myCouponsList.innerHTML = `<div style="color:#333; text-align:center; padding-top:100px; font-size:0.85rem;">🎁 ตู้เซฟของคุณยังว่างเปล่า<br>กดเปิดกล่องสุ่มสไลด์เพื่อลุ้นรับคูปองกันน้า BRO!</div>`;
            }

            await showErrorAlert("SIGNED OUT", "ออกจากระบบ Underground Culture เรียบร้อยแล้วครับ BRO! 🩹");
        } catch (error) {
            showErrorAlert("SIGN OUT ERROR", `เกิดข้อผิดพลาด: ${error.message}`);
        }
    });
}

// ==========================================
// 🔴 เข้าสู่ระบบด้วย GOOGLE (ระบบ Redirect)
// ==========================================
if (loginGoogleBtn) {
    loginGoogleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // โชว์สถานะโหลดปุ๊บ สั่ง Redirect เปลี่ยนหน้าทันที
        loginGoogleBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังเปลี่ยนหน้า...`;
        loginGoogleBtn.style.opacity = '0.5';
        loginGoogleBtn.style.pointerEvents = 'none';

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        // สับสวิตช์มาใช้ signInWithRedirect แทน signInWithPopup
        firebase.auth().signInWithRedirect(provider);
    });
}

// ==========================================
// 🔵 เข้าสู่ระบบด้วย FACEBOOK (ระบบ Redirect)
// ==========================================
if (loginFacebookBtn) {
    loginFacebookBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // โชว์สถานะโหลดปุ๊บ สั่ง Redirect เปลี่ยนหน้าทันที
        loginFacebookBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังเปลี่ยนหน้า...`;
        loginFacebookBtn.style.opacity = '0.5';
        loginFacebookBtn.style.pointerEvents = 'none';

        const provider = new firebase.auth.FacebookAuthProvider();
        // สับสวิตช์มาใช้ signInWithRedirect แทน signInWithPopup
        firebase.auth().signInWithRedirect(provider);
    });
}
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("🔥 USER ALREADY LOGGED IN:", user.displayName);
        handleAuthSuccess(user); 
    } else {
        console.log("👀 NO USER LOGGED IN.");
    }
});

// =================================================================
// ─── 🧭 NAVIGATION BAR: ระบบเปลี่ยนสีเมนู Active ตอนกดคลิก ───
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// =================================================================
// ─── 🎒 📊 🎨 PROFILE DASHBOARD ENGINE (MY VAULT, STATS, EDIT TAG) ───
// =================================================================
const vaultLinkBtn = document.getElementById('vaultLinkBtn');
if(vaultLinkBtn) vaultLinkBtn.addEventListener('click', () => { if(userDropdownMenu) userDropdownMenu.style.display = 'none'; });

function incrementUserStat(statName) {
    let currentVal = parseInt(localStorage.getItem(`udg_stat_${statName}`) || '0');
    localStorage.setItem(`udg_stat_${statName}`, currentVal + 1);

    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
        database.ref(`users_stats/${currentUser.uid}/${statName}`).transaction((current) => (current || 0) + 1);
    }
}

const statsModal = document.getElementById('statsModal');
const openStatsBtn = document.getElementById('openStatsBtn');
const closeStatsBtn = document.getElementById('closeStatsBtn');

if (openStatsBtn && statsModal) {
    openStatsBtn.addEventListener('click', async () => {
        if(userDropdownMenu) userDropdownMenu.style.display = 'none';
        
        let votes = parseInt(localStorage.getItem('udg_stat_votes') || '0');
        let graffiti = parseInt(localStorage.getItem('udg_stat_graffiti') || '0');
        let cases = parseInt(localStorage.getItem('udg_stat_cases') || '0');

        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            const snap = await database.ref(`users_stats/${currentUser.uid}`).once('value');
            const data = snap.val();
            if (data) {
                votes = data.votes || votes;
                graffiti = data.graffiti || graffiti;
                cases = data.cases || cases;
            }
        }

        document.getElementById('statVotes').innerText = votes;
        document.getElementById('statGraffiti').innerText = graffiti;
        document.getElementById('statCases').innerText = cases;

        statsModal.classList.add('active');
    });
}
if(closeStatsBtn) closeStatsBtn.addEventListener('click', () => statsModal.classList.remove('active'));

const editTagModal = document.getElementById('editTagModal');
const openEditTagBtn = document.getElementById('openEditTagBtn');
const closeEditTagBtn = document.getElementById('closeEditTagBtn');
const editTagNameInput = document.getElementById('editTagNameInput');
const saveTagBtn = document.getElementById('saveTagBtn');

if (openEditTagBtn && editTagModal) {
    openEditTagBtn.addEventListener('click', () => {
        if(userDropdownMenu) userDropdownMenu.style.display = 'none';
        editTagNameInput.value = localStorage.getItem('savedGraffitiName') || (graffitiName ? graffitiName.value : "");
        editTagModal.classList.add('active');
    });
}
if(closeEditTagBtn) closeEditTagBtn.addEventListener('click', () => editTagModal.classList.remove('active'));

if(saveTagBtn) {
    saveTagBtn.addEventListener('click', () => {
        let newName = editTagNameInput.value.trim();
        if(newName !== "") {
            let finalName = newName.startsWith('@') ? newName : '@' + newName;
            localStorage.setItem('savedGraffitiName', finalName);
            if(graffitiName) graffitiName.value = finalName;
            showErrorAlert("TAG UPDATED", `อัปเดตฉายาเป็น <strong style="color:#ff007f;">${finalName}</strong> เรียบร้อยแล้ว! เตรียมลุยกำแพงได้เลย 🎨`, true);
            editTagModal.classList.remove('active');
        }
    });
}

// =================================================================
// ─── 🔴 DEMO DROPBOX ENGINE (ระบบตู้แดงหย่อนเพลงศิลปินหน้าใหม่) ───
// =================================================================
const demoDropboxModal = document.getElementById('demoDropboxModal');
const openDemoDropboxBtn = document.getElementById('openDemoDropboxBtn');
const closeDemoDropboxBtn = document.getElementById('closeDemoDropboxBtn');
const submitDemoBtn = document.getElementById('submitDemoBtn');

const demoArtistName = document.getElementById('demoArtistName');
const demoTrackTitle = document.getElementById('demoTrackTitle');
const demoTrackLink = document.getElementById('demoTrackLink');
const demoContact = document.getElementById('demoContact');

if (openDemoDropboxBtn && demoDropboxModal) {
    openDemoDropboxBtn.addEventListener('click', () => {
        demoDropboxModal.classList.add('active');
    });
}
if (closeDemoDropboxBtn) {
    closeDemoDropboxBtn.addEventListener('click', () => {
        demoDropboxModal.classList.remove('active');
    });
}

if (submitDemoBtn) {
    submitDemoBtn.addEventListener('click', async () => {
        const artist = demoArtistName.value.trim();
        const title = demoTrackTitle.value.trim();
        const link = demoTrackLink.value.trim();
        const contact = demoContact.value.trim();

        if (!artist || !title || !link || !contact) {
            showErrorAlert("INCOMPLETE DATA", "❌ กรุณากรอกข้อมูลให้ครบทุกช่องก่อนส่งเพลงเข้าตู้แดงครับน้า!");
            return;
        }

        const isValidLink = link.includes('youtube.com') || link.includes('youtu.be') || link.includes('soundcloud.com');
        if (!isValidLink) {
            showErrorAlert("INVALID LINK", "❌ ระบบรองรับเฉพาะลิงก์จาก <strong>YouTube</strong> หรือ <strong>SoundCloud</strong> เท่านั้นครับ BRO!");
            return;
        }

        const todayStr = new Date().toDateString();
        const lastDemoDate = localStorage.getItem('last_demo_submit');
        if (lastDemoDate === todayStr) {
            showErrorAlert("DAILY LIMIT REACHED", "❌ คุณส่งเพลงไปแล้วในวันนี้!<br>แอดมินขอเวลาฟังก่อนน้า พรุ่งนี้ค่อยหย่อนมาใหม่ครับ!");
            return;
        }

        const currentUser = firebase.auth().currentUser;
        const submitterName = currentUser ? currentUser.displayName : "Guest_Artist";
        const submitterUid = currentUser ? currentUser.uid : "Anonymous";

        try {
            submitDemoBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> SENDING...`;
            submitDemoBtn.style.opacity = '0.5';
            submitDemoBtn.style.pointerEvents = 'none';

            await database.ref('udg_demo_dropbox').push({
                artistName: artist,
                trackTitle: title,
                trackLink: link,
                contactInfo: contact,
                submittedBy: submitterName,
                submitterUid: submitterUid,
                timestamp: Date.now(),
                status: 'pending'
            });

            localStorage.setItem('last_demo_submit', todayStr); 
            demoArtistName.value = '';
            demoTrackTitle.value = '';
            demoTrackLink.value = '';
            demoContact.value = '';
            
            demoDropboxModal.classList.remove('active');
            showErrorAlert("TRACK SUBMITTED! 🔥", "ส่งเพลงเข้าตู้แดง UDG เรียบร้อยแล้ว!<br>ถ้าเพลงเดือดโดนใจทีมงาน รอรับการติดต่อกลับหรือรอเห็นบน RADAR ได้เลยครับ!", true);

        } catch (error) {
            showErrorAlert("SYSTEM ERROR", "เกิดข้อผิดพลาดในการส่งเพลง: " + error.message);
        } finally {
            submitDemoBtn.innerHTML = "SEND TRACK TO UDG";
            submitDemoBtn.style.opacity = '1';
            submitDemoBtn.style.pointerEvents = 'auto';
        }
    });
}

// =================================================================
// ─── 🛒 MERCH PRE-ORDER ENGINE (ระบบสั่งของพรีออเดอร์ + ImgBB API) ───
// =================================================================
const IMGBB_API_KEY = "ba210b7b494a630b713c297b74f51d65"; 

const merchModal = document.getElementById('merchModal');
const openMerchBtn = document.getElementById('openMerchBtn');
const closeMerchBtn = document.getElementById('closeMerchBtn');
const submitOrderBtn = document.getElementById('submitOrderBtn');

if (openMerchBtn && merchModal) openMerchBtn.addEventListener('click', () => merchModal.classList.add('active'));
if (closeMerchBtn) closeMerchBtn.addEventListener('click', () => merchModal.classList.remove('active'));

if (submitOrderBtn) {
    submitOrderBtn.addEventListener('click', async () => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            showErrorAlert("ACCESS DENIED", "❌ กรุณาล็อกอินเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้าครับ!");
            return;
        }

        const size = document.getElementById('orderSize').value;
        const name = document.getElementById('orderName').value.trim();
        const phone = document.getElementById('orderPhone').value.trim();
        const address = document.getElementById('orderAddress').value.trim();
        const slipFile = document.getElementById('orderSlip').files[0];

        if (!size || !name || !phone || !address || !slipFile) {
            showErrorAlert("INCOMPLETE FORM", "❌ กรุณากรอกข้อมูลให้ครบทุกช่อง และแนบรูปสลิปโอนเงินด้วยครับ!");
            return;
        }

        try {
            submitOrderBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> UPLOADING SLIP...`;
            submitOrderBtn.style.pointerEvents = 'none';
            submitOrderBtn.style.opacity = '0.5';

            const formData = new FormData();
            formData.append('image', slipFile);

            const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData
            });
            const imgbbData = await imgbbResponse.json();

            if (!imgbbData.success) {
                throw new Error("อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่ครับ");
            }

            const slipUrl = imgbbData.data.url; 

            await database.ref('udg_merch_orders').push({
                uid: currentUser.uid,
                customerName: name,
                phone: phone,
                address: address,
                size: size,
                slipImageUrl: slipUrl, 
                status: 'PENDING',
                timestamp: Date.now()
            });

            document.getElementById('orderSize').value = "";
            document.getElementById('orderName').value = "";
            document.getElementById('orderPhone').value = "";
            document.getElementById('orderAddress').value = "";
            document.getElementById('orderSlip').value = "";
            
            merchModal.classList.remove('active');
            showErrorAlert("ORDER RECEIVED! 🎉", "สั่งซื้อสำเร็จ! ระบบได้รับสลิปของคุณแล้ว แอดมินจะทำการตรวจสอบยอดโอนและดำเนินการจัดส่งตามคิวครับ", true);

        } catch (error) {
            showErrorAlert("SYSTEM ERROR", "เกิดข้อผิดพลาด: " + error.message);
        } finally {
            submitOrderBtn.innerHTML = "CONFIRM ORDER & UPLOAD SLIP";
            submitOrderBtn.style.pointerEvents = 'auto';
            submitOrderBtn.style.opacity = '1';
        }
    });
}

// =================================================================
// ─── 🤝 COLLAB WANTED BOARD ENGINE (ระบบประกาศหาคนทำเพลง) ───
// =================================================================
const liveCollabBoard = document.getElementById('live-collab-board');
const collabModal = document.getElementById('collabModal');
const openCollabModalBtn = document.getElementById('openCollabModalBtn');
const closeCollabModalBtn = document.getElementById('closeCollabModalBtn');
const submitCollabBtn = document.getElementById('submitCollabBtn');

database.ref('udg_collab_board').on('value', (snapshot) => {
    if (!liveCollabBoard) return;
    liveCollabBoard.innerHTML = '';
    const ads = snapshot.val();
    
    if (!ads) {
        liveCollabBoard.innerHTML = `<div style="padding:30px; color:#555; text-align:center; width:100%; grid-column: 1 / -1;">📭 ยังไม่มีประกาศหาทีมงานในขณะนี้... คุณสามารถเป็นคนแรกได้!</div>`;
        return;
    }

    let adsArray = Object.keys(ads).map(key => ({ id: key, ...ads[key] }));
    adsArray.sort((a, b) => b.timestamp - a.timestamp);

 adsArray.forEach(ad => {
        const dateStr = new Date(ad.timestamp).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
        const card = document.createElement('div');
        card.className = 'collab-card';
        
        let roleIcon = "👽";
        if(ad.role === "RAPPER") roleIcon = "🎤";
        if(ad.role === "BEATMAKER") roleIcon = "🎹";
        if(ad.role === "MIXING") roleIcon = "🎛️";
        if(ad.role === "COVER_ART") roleIcon = "🎨";
        if(ad.role === "MV_DIR") roleIcon = "🎬";

        // 🖼️ ถ้าระบบมีรูปภาพ ให้สร้างแท็ก HTML รูปภาพเตรียมไว้
        let imageRender = "";
        if (ad.imageUrl && ad.imageUrl !== "") {
            imageRender = `<div style="width: 100%; height: 160px; margin-bottom: 15px; border-radius: 4px; overflow: hidden; border: 1px solid #333;"><img src="${ad.imageUrl}" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.9);" alt="Collab Image"></div>`;
        }

        // แทรก imageRender ลงไปในการ์ด
        card.innerHTML = `
            <span class="c-role-tag c-role-${ad.role}">${roleIcon} ${ad.role.replace('_', ' ')}</span>
            ${imageRender}
            <h4 class="collab-title">${ad.title}</h4>
            <p class="collab-desc">${ad.desc}</p>
            <div class="collab-contact"><i class="fa-solid fa-address-card"></i> ${ad.contact}</div>
            <div class="collab-user">โพสต์โดย: ${ad.authorName} (${dateStr})</div>
        `;
        liveCollabBoard.appendChild(card);
    });
});

if (openCollabModalBtn && collabModal) {
    openCollabModalBtn.addEventListener('click', () => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            showErrorAlert("ACCESS DENIED", "❌ กรุณาล็อกอินเข้าสู่ระบบก่อนลงประกาศหาเพื่อนร่วมงานครับ!");
            return;
        }
        collabModal.classList.add('active');
    });
}
if (closeCollabModalBtn) closeCollabModalBtn.addEventListener('click', () => collabModal.classList.remove('active'));

if (submitCollabBtn) {
    submitCollabBtn.addEventListener('click', async () => {
        const currentUser = firebase.auth().currentUser;
        const role = document.getElementById('collabRole').value;
        const title = document.getElementById('collabTitle').value.trim();
        const desc = document.getElementById('collabDesc').value.trim();
        const contact = document.getElementById('collabContact').value.trim();
        
        // 🎯 ดึงไฟล์รูปภาพที่เลือกมา
        const imageFile = document.getElementById('collabImage').files[0];

        if (!role || !title || !desc || !contact) {
            showErrorAlert("INCOMPLETE FORM", "❌ กรุณากรอกข้อมูลให้ครบทุกช่องเพื่อความชัดเจนครับน้า!");
            return;
        }

        try {
            submitCollabBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> PUBLISHING...`;
            submitCollabBtn.style.pointerEvents = 'none';
            submitCollabBtn.style.opacity = '0.5';

            let imageUrl = "";

            // 📸 ถ้าน้าแนบรูปมา ให้ยิงขึ้น ImgBB ก่อน
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                
                // ใช้ API Key เดิมที่มีอยู่ในระบบ
                const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=ba210b7b494a630b713c297b74f51d65`, {
                    method: 'POST',
                    body: formData
                });
                const imgbbData = await imgbbResponse.json();
                
                if (imgbbData.success) {
                    imageUrl = imgbbData.data.url; // ได้ลิงก์รูปมาแล้ว
                } else {
                    throw new Error("อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่ครับ");
                }
            }

            // 💾 ส่งข้อมูลทั้งหมดลง Firebase Realtime Database
            await database.ref('udg_collab_board').push({
                uid: currentUser.uid,
                authorName: currentUser.displayName || "Anonymous",
                role: role,
                title: title,
                desc: desc,
                contact: contact,
                imageUrl: imageUrl, // แทรกตัวเลปรลิงก์รูปที่ได้มา
                timestamp: Date.now()
            });

            // เคลียร์ฟอร์ม
            document.getElementById('collabRole').value = "";
            document.getElementById('collabTitle').value = "";
            document.getElementById('collabDesc').value = "";
            document.getElementById('collabContact').value = "";
            document.getElementById('collabImage').value = "";
            
            collabModal.classList.remove('active');
            showErrorAlert("PUBLISHED! 🔥", "ลงประกาศเรียบร้อยแล้ว! ขอให้เจอทีมงานเดือดๆ มาร่วมทำเพลงเร็วๆ นี้นะครับ", true);

        } catch (error) {
            showErrorAlert("SYSTEM ERROR", "เกิดข้อผิดพลาด: " + error.message);
        } finally {
            submitCollabBtn.innerHTML = "PUBLISH AD";
            submitCollabBtn.style.pointerEvents = 'auto';
            submitCollabBtn.style.opacity = '1';
        }
    });
}

// =================================================================
// 🛡️ ดักจับผลลัพธ์และ Error หลังจาก Redirect กลับมาที่เว็บ
// =================================================================
firebase.auth().getRedirectResult().then((result) => {
    if (result.credential) {
        console.log("🔥 REDIRECT LOGIN SUCCESS!");
        // ไม่ต้องสั่งอะไรเพิ่ม เพราะ onAuthStateChanged จะทำงานต่อเอง
    }
}).catch((error) => {
    console.error("Redirect Auth Error:", error);
    
    // ดัก Error กรณีอีเมลชนกัน (เช่น ใช้อีเมลเดียวกันสมัครทั้งเฟซและกูเกิล)
    if (error.code === 'auth/account-exists-with-different-credential') {
        showErrorAlert("EMAIL CONFLICT", "❌ อีเมลนี้ถูกใช้ไปแล้วด้วยช่องทางอื่น!<br>กรุณาเลือกล็อกอินด้วยช่องทางที่คุณเคยสมัครไว้ครับ");
    } else {
        showErrorAlert("LOGIN ERROR", `เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${error.message}`);
    }
    
    // รีเซ็ตปุ่มกลับมาสภาพเดิม
    if (loginGoogleBtn) {
        loginGoogleBtn.innerHTML = `<i class="fa-brands fa-google"></i> CONTINUE WITH GOOGLE`;
        loginGoogleBtn.style.opacity = '1';
        loginGoogleBtn.style.pointerEvents = 'auto';
    }
    if (loginFacebookBtn) {
        loginFacebookBtn.innerHTML = `<i class="fa-brands fa-facebook"></i> CONTINUE WITH FACEBOOK`;
        loginFacebookBtn.style.opacity = '1';
        loginFacebookBtn.style.pointerEvents = 'auto';
    }
});