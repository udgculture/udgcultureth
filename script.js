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

const artistKeys = {
    '@Dxshane': 'shane999',
    '@JayQ': 'jayq888',
    '@UndergroundCultureTH': 'udc2026'
};

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

    if (!username.startsWith('@')) {
        username = '@' + username;
    }

    if (currentRoom === 'general_1') {
        rudeWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            text = text.replace(regex, '***');
            username = username.replace(regex, '***');
        });
    }

    let isArtist = false;
    let artistEmoji = ""; 
    
    const matchedArtist = Object.keys(artistKeys).find(key => key.toLowerCase() === username.toLowerCase());
    
    if (matchedArtist) {
        username = matchedArtist; 
        const currentTime = Date.now();
        const verifiedTime = localStorage.getItem(`verified_time_${username}`);
        const hasVerified = localStorage.getItem(`verified_${username}`);
        const sessionDuration = 30 * 60 * 1000; 

        if (hasVerified === artistKeys[username] && verifiedTime && (currentTime - verifiedTime < sessionDuration)) {
            isArtist = true;
        } else {
            const userPasscode = await requestArtistPasscode(username);
            if (userPasscode === null) return; 

            if (userPasscode === artistKeys[username]) {
                isArtist = true;
                localStorage.setItem(`verified_${username}`, userPasscode);
                localStorage.setItem(`verified_time_${username}`, currentTime);
                await showErrorAlert('VERIFIED SUCCESS', 'ยืนยันตัวตนสำเร็จ! ระบบจะจำเครื่องนี้ไว้ แร็ปรัวได้ 30 นาทีไม่ต้องกรอกรหัสซ้ำครับ 🔥');
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

    database.ref(`graffiti_rooms/${currentRoom}`).push({
        username: username,
        text: text,
        color: randomColor,
        role: isArtist ? 'artist' : 'user',
        emoji: artistEmoji, 
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
        
        newMsg.innerHTML = `
            <div class="msg-content">
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
graffitiInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sprayGraffiti();
});

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
// ─── ระบบจัดอันดับและสถานีโหวตโมดอล (VOTE SYSTEM — SPEED RUN EDITION) ───
// =================================================================

const musicTracksData = {
    "track_01": { id: "track_01", title: "รอ รอ รอ", artist: "Dxshane feat. JayQ", ytId: "78gSbjE71m8" }, 
    "track_02": { id: "track_02", title: "ซึมเศร้าก็เด้าได้ (Remix)", artist: "S!NS feat. THXWXN, MACNA", ytId: "_H7sCARrYJU" }, 
    "track_03": { id: "track_03", title: "หนุ่มบ้านนอก (Remix)", artist: "Aniydy, JayQ", ytId: "L2OSHr5UikU" },
    "track_04": { id: "track_04", title: "Miss คิด", artist: "Ezchill", ytId: "L2OSHr5UikU" },
    "track_05": { id: "track_05", title: "U CAN'T SEE ME", artist: "YOUNGGU X P6ICK", ytId: "KHyw-tyxrE4" },
    "track_06": { id: "track_06", title: "พิษภัย II", artist: "FIIXD, 1MILL, 4BANG, KING KRAZY & SUNNYBONE", ytId: "YmqfFYvpIwc" },
    "track_07": { id: "track_07", title: "NOBODY", artist: "N4 x wh0dafvckis19", ytId: "LDfk_7RJctc" }
};

const liveChartDisplay = document.getElementById('live-chart-display');
const modalVotingList = document.getElementById('modal-voting-list');
const voteSearchInput = document.getElementById('voteSearchInput');

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
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'disablekb': 1
        },
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
};

function getWeekIdentifier(dateObj) {
    const d = new Date(dateObj);
    const day = d.getDay();
    const hours = d.getHours();
    
    let target = new Date(d);
    let diff = (day >= 5) ? (day - 5) : (day + 2);
    if (day === 5 && hours < 10) {
        diff = -7; 
    } else if (day === 5 && hours >= 10) {
        diff = 0;
    } else {
        diff = diff * -1;
    }
    
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
    
    Object.keys(musicTracksData).forEach(trackKey => {
        const track = musicTracksData[trackKey];
        const votes = currentWeekVotes[track.id] ? currentWeekVotes[track.id] : 0;
        
        if (query !== "" && !track.title.toLowerCase().includes(query) && !track.artist.toLowerCase().includes(query)) {
            return;
        }
        
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
    
    if (modalVotingList.innerHTML === '') {
        modalVotingList.innerHTML = `<div style="padding:20px; color:#444; text-align:center; font-size:0.85rem;">❌ ไม่พบเพลงหรือศิลปินที่คุณพิมพ์หา...</div>`;
    }
}

// 🎯 🔐 LIGHTWEIGHT VERSION: ตัดระบบ IP ทิ้งถาวร! โหวตลื่นปรึ๊ด การันตีแจ้งเตือนดีดหน้าสุดทุกรอบชัวร์ 100%
function submitTrackVote(trackId) {
    const now = new Date();
    const weekId = getWeekIdentifier(now); 
    const todayStr = now.toDateString();

    // ดักล็อกสิทธิ์คนกดซ้ำผ่าน LocalStorage ระดับเบราว์เซอร์เครื่อง
    const lastVoteDate = localStorage.getItem(`last_vote_${trackId}`);
    if (lastVoteDate === todayStr) {
        showErrorAlert('VOTE LIMIT!', '❌ YOU ALREADY VOTED TODAY!<br>(น้ากดโหวตเพลงนี้ไปแล้ววันนี้ พรุ่งนี้ค่อยมาดันแต้มใหม่นะครับ BRO!)');
        return;
    }

    // ยิงคะแนนตรงเข้า Firebase Realtime Database ทันที ไม่ต้องรอประมวลผลท่อ API นอก
    const trackVoteRef = database.ref(`weekly_music_votes/${weekId}/${trackId}`);
    trackVoteRef.transaction((currentVotes) => {
        return (currentVotes || 0) + 1;
    }, (error, committed) => {
        if (committed) {
            localStorage.setItem(`last_vote_${trackId}`, todayStr);
            showErrorAlert('VOTE SUCCESS', '🔥 แต้มคะแนนสะสมของน้าถูกส่งเข้าระบบประจำสัปดาห์นี้เรียบร้อยแล้ว! ขอบคุณที่ช่วยดัน Culture ครับ BRO!');
        } else {
            showErrorAlert('DATABASE ERROR', '❌ เกิดข้อผิดพลาดหลังบ้าน ไม่สามารถบันทึกแต้มได้ ลองกดใหม่อีกครั้งครับน้า');
        }
    });
}

database.ref('weekly_music_votes').on('value', (snapshot) => {
    const allWeeksData = snapshot.val() ? snapshot.val() : {};
    const now = new Date();
    const currentWeekId = getWeekIdentifier(now);          
    const currentWeekVotes = allWeeksData[currentWeekId] ? allWeeksData[currentWeekId] : {};
    
    globalCurrentWeekVotes = currentWeekVotes;
    
    if (voteSearchInput) {
        renderModalVotingStation(currentWeekVotes, voteSearchInput.value);
    } else {
        renderModalVotingStation(currentWeekVotes, "");
    }

    let sortedList = Object.keys(musicTracksData).map(key => {
        const track = musicTracksData[key];
        return { ...track, votes: currentWeekVotes[track.id] ? currentWeekVotes[track.id] : 0 };
    });

    sortedList.sort((a, b) => b.votes - a.votes);
    
    if (liveChartDisplay) {
        liveChartDisplay.innerHTML = '';
        const topFiveList = sortedList.slice(0, 5);

        topFiveList.forEach((track, index) => {
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

if (voteSearchInput) {
    voteSearchInput.addEventListener('input', (e) => {
        renderModalVotingStation(globalCurrentWeekVotes, e.target.value);
    });
}

const voteModal = document.getElementById('voteModal');
const openVoteModalBtn = document.getElementById('openVoteModalBtn');
const closeVoteModalBtn = document.getElementById('closeVoteModalBtn');

if (openVoteModalBtn && voteModal && closeVoteModalBtn) {
    openVoteModalBtn.addEventListener('click', () => {
        if (voteSearchInput) voteSearchInput.value = ""; 
        renderModalVotingStation(globalCurrentWeekVotes, ""); 
        voteModal.classList.add('active');
        if (voteSearchInput) {
            setTimeout(() => voteSearchInput.focus(), 100); 
        }
    });
    
    closeVoteModalBtn.addEventListener('click', () => {
        voteModal.classList.remove('active');
    });
    
    voteModal.addEventListener('click', (e) => {
        if (e.target === voteModal) voteModal.classList.remove('active');
    });
}

function triggerPlayerFromChart(trackId) {
    const targetTrack = musicTracksData[trackId];
    const miniPlayer = document.getElementById('mini-audio-player');
    const pTitle = document.getElementById('player-title');
    const pArtist = document.getElementById('player-artist');

    if (targetTrack && miniPlayer && ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        pTitle.innerText = targetTrack.title;
        pArtist.innerText = targetTrack.artist;
        
        ytPlayer.loadVideoById(targetTrack.ytId);
        miniPlayer.classList.add('active');
    }
}

// =================================================================
// ─── ระบบปุ่มควบคุมป๊อปอัปเครื่องเล่นมินิส่งสัญญาณ YouTube CONTROLLER ───
// =================================================================
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

function stopProgressTimer() {
    if (updateTimerInterval) clearInterval(updateTimerInterval);
}

if (playerPlayBtn) {
    playerPlayBtn.addEventListener('click', () => {
        if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
            const state = ytPlayer.getPlayerState();
            if (state === 1) {
                ytPlayer.pauseVideo();
            } else {
                ytPlayer.playVideo();
            }
        }
    });
}