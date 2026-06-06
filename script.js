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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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

function showErrorAlert(title, message) {
    if (!errorModalTitle || !errorModalMessage || !errorModal) {
        alert(title + "\n" + message.replace(/<br>/g, '\n').replace(/<[^>]*>/g, ''));
        return Promise.resolve();
    }
    errorModalTitle.innerText = title;
    errorModalMessage.innerHTML = message;
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
// ─── 🗳️ 🎵 NEW CENTRAL WEEKLY SET CHART ENGINE ───
// =================================================================
const liveChartDisplay = document.getElementById('live-chart-display');
const modalVotingList = document.getElementById('modal-voting-list');
const voteSearchInput = document.getElementById('voteSearchInput');

let musicTracksData = {}; 
let globalCurrentWeekVotes = {};
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

function getWeekIdentifier(dateObj) {
    const d = new Date(dateObj);
    const day = d.getDay();
    const hours = d.getHours();
    let target = new Date(d);
    let diff = (day >= 5) ? (day - 5) : (day + 2);
    if (day === 5 && hours < 10) { diff = -7; } 
    else if (day === 5 && hours >= 10) { diff = 0; } 
    else { diff = diff * -1; }
    target.setDate(d.getDate() + diff);
    target.setHours(10, 0, 0, 0);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    return `week_${yyyy}_${mm}_${dd}`;
}

function renderModalVotingStation(currentWeekVotes, filterText = "") {
    if (!modalVotingList) return;
    modalVotingList.innerHTML = '';
    const query = filterText.toLowerCase().trim();
    
    const trackKeys = Object.keys(musicTracksData);
    if (trackKeys.length === 0) {
        modalVotingList.innerHTML = `<div style="color:#555; text-align:center; padding:20px; font-size:0.9rem;">🎵 วันศุกร์สัปดาห์ใหม่เริ่มขึ้นแล้ว!<br>รอแอดมินสาดเพลงเซ็ตโหวตประจำสัปดาห์นี้เข้าสู่ระบบครับน้า BRO!</div>`;
        return;
    }

    trackKeys.forEach(trackKey => {
        const track = musicTracksData[trackKey];
        const votes = currentWeekVotes[track.id] ? currentWeekVotes[track.id] : 0;
        if (query !== "" && !track.title.toLowerCase().includes(query) && !track.artist.toLowerCase().includes(query)) return;
        
        const voteRow = document.createElement('div');
        voteRow.className = 'vote-station-item';
        voteRow.style.marginBottom = '10px';
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
    const weekId = getWeekIdentifier(now); 
    const todayStr = now.toDateString();
    const lastVoteDate = localStorage.getItem(`last_vote_${trackId}`);
    if (lastVoteDate === todayStr) {
        showErrorAlert('VOTE LIMIT!', '❌ YOU ALREADY VOTED TODAY!<br>(น้ากดโหวตเพลงนี้ไปแล้ววันนี้ พรุ่งนี้ค่อยมาดันแต้มใหม่นะครับ BRO!)');
        return;
    }
    const trackVoteRef = database.ref(`weekly_music_votes/${weekId}/${trackId}`);
    trackVoteRef.transaction((currentVotes) => { return (currentVotes || 0) + 1; }, (error, committed) => {
        if (committed) {
            localStorage.setItem(`last_vote_${trackId}`, todayStr);
            showErrorAlert('VOTE SUCCESS', '🔥 คะแนนถูกส่งเข้าระบบประจำสัปดาห์เรียบร้อยแล้ว ขอบคุณที่ช่วยดันชาร์ต UDG ครับ BRO!');
        }
    });
}

function setupWeeklySetMusicEngine() {
    const currentWeekId = getWeekIdentifier(new Date());

    database.ref(`udg_weekly_tracks_vault/${currentWeekId}`).on('value', (trackSnapshot) => {
        const weeklyTracks = trackSnapshot.val();
        musicTracksData = weeklyTracks ? weeklyTracks : {}; 

        database.ref(`weekly_music_votes/${currentWeekId}`).on('value', (voteSnapshot) => {
            const currentWeekVotes = voteSnapshot.val() ? voteSnapshot.val() : {};
            globalCurrentWeekVotes = currentWeekVotes;
            
            if (voteSearchInput) { renderModalVotingStation(currentWeekVotes, voteSearchInput.value); } 
            else { renderModalVotingStation(currentWeekVotes, ""); }

            let sortedList = Object.keys(musicTracksData).map(key => {
                const track = musicTracksData[key];
                return { ...track, votes: currentWeekVotes[track.id] ? currentWeekVotes[track.id] : 0 };
            });
            
            if (liveChartDisplay) {
                liveChartDisplay.innerHTML = '';
                if (sortedList.length === 0) {
                    liveChartDisplay.innerHTML = `<div style="padding:20px; color:#444; text-align:center; font-size:0.85rem;">⏳ WAITING FOR THIS WEEK'S MUSIC SET DROPS...</div>`;
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

setupWeeklySetMusicEngine();

if (voteSearchInput) {
    voteSearchInput.addEventListener('input', (e) => { renderModalVotingStation(globalCurrentWeekVotes, e.target.value); });
}

const voteModal = document.getElementById('voteModal');
const openVoteModalBtn = document.getElementById('openVoteModalBtn');
const closeVoteModalBtn = document.getElementById('closeVoteModalBtn');

if (openVoteModalBtn && voteModal && closeVoteModalBtn) {
    openVoteModalBtn.addEventListener('click', () => {
        if (voteSearchInput) voteSearchInput.value = ""; 
        renderModalVotingStation(globalCurrentWeekVotes, ""); 
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
// ─── 📰 🔥 CENTRAL APP FEED: ระบบดูดฟีดข่าวสาร ───
// =================================================================
const liveNewsGrid = document.getElementById('live-news-grid');
const liveFeaturedCard = document.getElementById('live-featured-card');
const liveRadarGrid = document.getElementById('live-radar-grid');

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

database.ref('udg_news_drops').on('value', (snapshot) => {
    if (!liveNewsGrid) return; liveNewsGrid.innerHTML = '';
    const allNewsData = snapshot.val();
    if (!allNewsData) {
        liveNewsGrid.innerHTML = `<div style="padding:40px; color:#444; text-align:center; grid-column:1/-1; font-size:0.95rem; font-weight:300; letter-spacing:0.5px;">📰 NO CONTENT CURRENTLY AVAILABLE. SPECIAL UPDATES COMING SOON.</div>`;
        return;
    }
    let newsList = Object.keys(allNewsData).map(key => { return { newsId: key, ...allNewsData[key] }; });
    newsList.sort((a, b) => b.timestamp - a.timestamp);
    newsList.forEach(news => {
        const articleCard = document.createElement('article');
        articleCard.className = 'news-card';
        articleCard.innerHTML = `
            <div class="news-img"><img src="${news.image}" alt="News Image" onerror="this.src='image/ขาวใส.png'"></div>
            <div class="news-content">
                <span class="news-tag">${news.tag}</span>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-excerpt">${news.excerpt}</p>
                <button type="button" style="background:transparent; border:none; color:#1a1a1a; font-size:0.75rem; margin-top:15px; cursor:pointer; display:block; padding:0;" onclick="deleteNewsItemByAdmin('${news.newsId}')">REMOVE NEWS</button>
            </div>`;
        liveNewsGrid.appendChild(articleCard);
    });
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

let currentAdIndex = 0;
let cloudAdsList = [];
let adRotationInterval = null;

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
        liveAdContent.innerHTML = `
            <h3>${fallbackDefaultAd.title}</h3>
            <p>${fallbackDefaultAd.description}</p>
        `;
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
        liveAdContent.innerHTML = `
            <h3>${activeAd.title}</h3>
            <p>${activeAd.description}</p>
        `;
    }

    currentAdIndex = (currentAdIndex + 1) % cloudAdsList.length;
}

database.ref('udg_live_advertisements').on('value', (snapshot) => {
    const data = snapshot.val();
    cloudAdsList = [];
    currentAdIndex = 0;

    if (data) {
        Object.keys(data).forEach(key => {
            cloudAdsList.push(data[key]);
        });
    }

    renderActiveAd();

    if (adRotationInterval) clearInterval(adRotationInterval);

    if (cloudAdsList.length > 1) {
        adRotationInterval = setInterval(() => {
            renderActiveAd();
        }, 10000);
    }
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
        Object.keys(data).forEach(key => {
            currentLogosList.push(data[key]);
        });
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

    let sortedGigs = Object.keys(gigsData).map(key => {
        return { gigId: key, ...gigsData[key] };
    });
    
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
// ─── 🔐 MEMBER LOGIN & 🎡 CYBER LUCKY WHEEL ENGINE (FULL SPEC) ───
// =================================================================
const authProviderModal = document.getElementById('authProviderModal');
const openAuthModalBtn = document.getElementById('openAuthModalBtn');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const loginGoogleBtn = document.getElementById('loginGoogleBtn');
const loginFacebookBtn = document.getElementById('loginFacebookBtn');
const userProfileDisplay = document.getElementById('userProfileDisplay');
const authUserName = document.getElementById('authUserName');

const userDropdownMenu = document.getElementById('userDropdownMenu');
const signOutBtn = document.getElementById('signOutBtn');

const luckyWheelCanvas = document.getElementById('luckyWheelCanvas');
const spinWheelBtn = document.getElementById('spinWheelBtn');
const myCouponsList = document.getElementById('myCouponsList');
const userVisibleRewardsPool = document.getElementById('userVisibleRewardsPool');

let wheelItemsList = []; 
let isWheelSpinning = false;

// 🎨 1. ฟังก์ชันสั่งเขียนลายเส้นและระบายเฉดสีเรนเดอร์วงล้อลง Canvas แบบ Dynamic ตามระบบคลาวด์
function drawLuckyWheelGraph(itemsArray) {
    if (!luckyWheelCanvas) return;
    const ctx = luckyWheelCanvas.getContext('2d');
    const len = itemsArray.length;
    const center = luckyWheelCanvas.width / 2;
    ctx.clearRect(0, 0, luckyWheelCanvas.width, luckyWheelCanvas.height);

    if (len === 0) {
        ctx.style.transform = 'none';
        ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(center, center, center - 10, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = "#444"; ctx.font = "13px Kanit"; ctx.textAlign = "center"; ctx.fillText("⏳ รอแอดมินสาดรางวัลเข้าคลาวด์...", center, center + 5);
        return;
    }

    const arcAngle = (2 * Math.PI) / len;
    const neonColors = ['#0f0f0f', '#161616', '#0a0a0a', '#1c1c1c']; 

    itemsArray.forEach((item, i) => {
        const angle = i * arcAngle;
        ctx.fillStyle = neonColors[i % neonColors.length];
        ctx.beginPath(); ctx.moveTo(center, center);
        ctx.arc(center, center, center - 5, angle, angle + arcAngle); ctx.lineTo(center, center); ctx.fill();
        ctx.strokeStyle = "rgba(0, 255, 255, 0.15)"; ctx.lineWidth = 1; ctx.stroke();

        ctx.save(); ctx.translate(center, center); ctx.rotate(angle + arcAngle / 2);
        ctx.fillStyle = i % 2 === 0 ? "#00ffff" : "#ffffff";
        ctx.font = "bold 11px 'Space Grotesk', 'Kanit'"; ctx.textAlign = "right";
        
        let textDisplay = item.name.length > 15 ? item.name.substring(0, 13) + ".." : item.name;
        ctx.fillText(textDisplay, center - 25, 4); ctx.restore();
    });

    ctx.fillStyle = "#00ffff"; ctx.beginPath(); ctx.arc(center, center, 14, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.stroke();
}

// 🎨 2. ฟังก์ชันพ่นป้ายแท็กนีออนโชว์รายการของที่มีสิทธิ์ให้ลุ้นรอบวงล้อ (เพิ่มความดูดีสะใจ!)
// 🎨 2. ฟังก์ชันพ่นป้ายแท็กนีออนโชว์รายการของที่มีให้ลุ้นรอบวงล้อ (ฉบับซ่อนเรทเปอร์เซ็นต์ ไม่ให้ผู้ใช้เห็น)
function renderVisibleRewardsPoolList(itemsArray) {
    if (!userVisibleRewardsPool) return;
    userVisibleRewardsPool.innerHTML = '';
    
    if (itemsArray.length === 0) {
        userVisibleRewardsPool.innerHTML = `<span style="color:#444; font-size:0.8rem;">⏳ ไม่มีตั๋วคูปองสแตนบายในระบบคลาวด์ขณะนี้</span>`;
        return;
    }
    
    itemsArray.forEach(item => {
        const badge = document.createElement('span');
        badge.style.cssText = "background: rgba(0, 255, 255, 0.03); border: 1px solid #222; color: #ccc; padding: 4px 10px; font-size: 0.78rem; border-radius: 4px; font-weight: 500; font-family: monospace; display: inline-block; box-shadow: inset 0 0 5px rgba(0,255,255,0.01);";
        // 🎯 ตัด item.rateWeight ออกเรียบร้อย โชว์แค่ชื่อรางวัลเท่ๆ ครับน้า
        badge.innerHTML = `🎁 <span style="color:#fff; font-weight:bold;">${item.name}</span>`;
        userVisibleRewardsPool.appendChild(badge);
    });
}

// 📡 3. ดาวเทียมคอยส่องดูถังรายการของรางวัลจาก Firebase มาปั่นหน้าล้อและลิสต์ของรางวัลแบบเรียลไทม์
database.ref('udg_lucky_wheel_rewards').on('value', (snapshot) => {
    const data = snapshot.val(); wheelItemsList = [];
    if (data) {
        Object.keys(data).forEach(k => { wheelItemsList.push({ id: k, ...data[k] }); });
    }
    drawLuckyWheelGraph(wheelItemsList);
    renderVisibleRewardsPoolList(wheelItemsList);
});

// 📡 4. ส่องกล้องประวัติเจาะตู้เซฟส่วนตัวคลังคูปอง (เวอร์ชันเพิ่มระบบแสดงรหัสตั๋วลับเพื่อยืนยันตัวตน)
function listenToMySavedCouponsVault(uid) {
    if (!myCouponsList) return;
    database.ref(`users_rewards_vault/${uid}`).on('value', (snapshot) => {
        myCouponsList.innerHTML = '';
        const coupons = snapshot.val();
        if (!coupons) {
            myCouponsList.innerHTML = `
                <div style="color:#333; text-align:center; padding-top:60px; font-size:0.85rem;">
                    🎁 ตู้เซฟของคุณยังว่างเปล่า<br>กดสาดวงล้อฝั่งซ้ายเพื่อประเดิมรับรางวัลชิ้นแรกค่าย UDG ได้เลยคร้าบน้า BRO!
                </div>`;
            return;
        }
        Object.keys(coupons).forEach(k => {
            const item = coupons[k];
            const dateObj = new Date(item.wonTimestamp);
            const dateStr = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
            const timeStr = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น.";
            
            // ดักดึงรหัสตั๋วลับจำเพาะตัว (ถ้ารุ่นเก่าไม่มีให้ขึ้นคำว่า NO-ID)
            const ticketIdDisplay = item.ticketId ? item.ticketId : "NO-ID";

            const div = document.createElement('div');
            div.style.cssText = "background:#070707; border:1px solid #222; border-left:3px solid #00ffff; padding:12px; border-radius:4px; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); margin-bottom:8px;";
            div.innerHTML = `
                <div>
                    <strong style="color:#fff; font-family:monospace; font-size:0.92rem; text-shadow:0 0 5px rgba(255,255,255,0.1);">🎫 ${item.rewardName}</strong>
                    <!-- 🎯 ไฮไลท์รหัสตั๋วลับสีเหลืองนีออนเพื่อให้ลูกค้าใช้แคปมาเคลมสิทธิ์ -->
                    <span style="display:block; margin-top:4px; font-family:monospace; color:#fff000; font-size:0.8rem; font-weight:bold; background:rgba(255,240,0,0.05); padding:2px 6px; border-radius:3px; border:1px solid rgba(255,240,0,0.1); width:fit-content;">CODE: ${ticketIdDisplay}</span>
                    <span style="color:#444; font-size:0.68rem; display:block; margin-top:5px;"><i class="fa-solid fa-clock"></i> ได้รับเมื่อ: ${dateStr} - ${timeStr}</span>
                </div>
                <span style="color:#39ff14; font-size:0.68rem; font-weight:800; background:rgba(57,255,20,0.04); padding:3px 8px; border-radius:3px; border:1px solid rgba(57,255,20,0.15); letter-spacing:0.5px;">READY</span>
            `;
            myCouponsList.appendChild(div);
        });
        myCouponsList.scrollTop = myCouponsList.scrollHeight;
    });
}

// 🎰 9. มอเตอร์หลักส่งคำสั่งสุ่มวงล้อพ่วงการสร้าง "รหัสตั๋วลับผูกคู่ไอดีบัญชี" ส่งเข้าคลาวด์
if (spinWheelBtn) {
    spinWheelBtn.addEventListener('click', async () => {
        const currentUser = firebase.auth().currentUser;
        
        if (!currentUser) {
            showErrorAlert("ACCESS DENIED", "❌ YOU MUST LOGIN FIRST!<br>(น้าต้องเข้าสู่ระบบล็อกอินด้านบนสุดเว็บก่อน จึงจะได้รับสิทธิ์กดสุ่มรับคูปองส่วนลดประจำวันครับ BRO!)");
            return;
        }
        if (isWheelSpinning) return;
        if (wheelItemsList.length === 0) { alert("❌ วงล้อระบบคลาวด์ยังว่างเปล่า รอแอดมินสาดรางวัลก่อนครับน้า"); return; }

        const uid = currentUser.uid;
        const displayName = currentUser.displayName || "ANONYMOUS USER"; 
        const todayKey = new Date().toDateString(); 

        const checkSnapshot = await database.ref(`users_wheel_cooldown/${uid}/${todayKey}`).once('value');
        if (checkSnapshot.exists()) {
            showErrorAlert("DAILY LIMIT REACHED", "❌ LIMIT 1 SPIN PER DAY!<br>(น้ากดสุ่มรางวัลประจำวันนี้ไปเรียบร้อยแล้ว จำกัดหมุนได้ 1 ครั้งต่อวัน พรุ่งนี้แวะมาลุ้นแต้มลดราคาชุดใหม่นะคร้าบน้า BRO!)");
            return;
        }

        isWheelSpinning = true;
        spinWheelBtn.style.opacity = '0.5'; spinWheelBtn.innerText = "SPINNING...";

        const targetIndex = calculateWeightedRewardIndex();
        const targetRewardItem = wheelItemsList[targetIndex];

        const arcAngle = 360 / wheelItemsList.length;
        const stopAngleDeg = 270 - (targetIndex * arcAngle) - (arcAngle / 2); 
        const totalRotationDeg = 1800 + stopAngleDeg; 

        luckyWheelCanvas.style.transform = `rotate(${totalRotationDeg}deg)`;

        setTimeout(async () => {
            database.ref(`users_wheel_cooldown/${uid}/${todayKey}`).set({ spun: true, timestamp: Date.now() });

            // 🎯 เจนรหัสตั๋วลับสตรีทไซเบอร์สุ่ม 5 หลักขึ้นมาป้องกันการปลอมแปลง (เช่น UDG-A8F23)
            const randomSecretCode = "UDG-" + Math.random().toString(36).substring(2, 7).toUpperCase();

            // สาดคูปองบันทึกชื่อพ่วงรหัสตั๋วลับเฉพาะตัวส่งขึ้นระบบคลาวด์
            database.ref(`users_rewards_vault/${uid}`).push({
                rewardName: targetRewardItem.name,
                userName: displayName, 
                ticketId: randomSecretCode, // ส่งรหัสลับเข้าคลาวด์ไปพร้อมกัน
                wonTimestamp: Date.now()
            });

            await showErrorAlert("🏆 CONGRATULATIONS!", `ยินดีด้วยคร้าบน้า! น้านำโชคสุ่มได้รับรางวัล:<br><strong style="color:#00ffff; font-size:1.3rem;">[ ${targetRewardItem.name} ]</strong><br><br>รหัสยืนยันตัวตนตั๋วของคุณคือ: <strong style="color:#fff000; font-family:monospace; font-size:1.1rem;">${randomSecretCode}</strong><br>ระบบบันทึกเข้าตู้เซฟฝั่งขวาจอเรียบร้อยแล้วครับ BRO! 🔥`);

            isWheelSpinning = false;
            luckyWheelCanvas.style.transition = 'none';
            luckyWheelCanvas.style.transform = `rotate(${stopAngleDeg % 360}deg)`;
            setTimeout(() => { luckyWheelCanvas.style.transition = 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)'; }, 50);
            spinWheelBtn.style.opacity = '1'; spinWheelBtn.innerText = "SPIN NOW";

        }, 4000);
    });
}
// 💥 10. ระบบยิงป๊อปอัปดักรับผลล็อกอิน Google Sign-in
if (loginGoogleBtn) {
    loginGoogleBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        firebase.auth().signInWithPopup(provider)
            .then((result) => { handleAuthSuccess(result.user); })
            .catch((error) => {
                if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
                    firebase.auth().signInWithRedirect(provider);
                } else {
                    showErrorAlert("GOOGLE AUTH ERROR", `ล็อกอินไม่สำเร็จ: ${error.message}`);
                }
            });
    });
}

// 💥 11. ระบบยิงป๊อปอัปดักรับผลล็อกอิน Facebook Sign-in
if (loginFacebookBtn) {
    loginFacebookBtn.addEventListener('click', () => {
        const provider = new firebase.auth.FacebookAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => { handleAuthSuccess(result.user); })
            .catch((error) => {
                if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
                    firebase.auth().signInWithRedirect(provider);
                } else {
                    showErrorAlert("FACEBOOK AUTH ERROR", `ล็อกอินไม่สำเร็จ: ${error.message}`);
                }
            });
    });
}

// 🎯 12. จดจำเซสชันAuto-Login และรับค่ากรณีไหลกลับมาจากช่องทางเปลี่ยนหน้ามือถือ Redirect
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        handleAuthSuccess(user);
        listenToMySavedCouponsVault(user.uid);
    } else {
        if (myCouponsList) myCouponsList.innerHTML = `<div style="color:#333; text-align:center; padding-top:60px; font-size:0.85rem;">⏳ กรุณาล็อกอินเพื่อเปิดใช้งานตู้เซฟประวัติส่วนตัวของคุณ...</div>`;
    }
});

firebase.auth().getRedirectResult()
    .then((result) => { if (result && result.user) handleAuthSuccess(result.user); })
    .catch((error) => { console.error("Redirect Auth Error:", error); });