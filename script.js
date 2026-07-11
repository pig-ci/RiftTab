  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('✅ SW 註冊成功:', reg.scope))
      .catch(err => console.warn('❌ SW 註冊失敗:', err));
  }
const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`封鎖或無法讀取 localStorage [${key}]:`, e);
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`無法寫入 localStorage [${key}]:`, e);
    }
  }
};

// ================= 1. 高精度時鐘與番茄鐘計時系統 (requestAnimationFrame) =================
let isTimerRunning = false;
let currentMode = storage.get('rift_timer_mode') || 'focus'; 
let timeLeft = parseInt(storage.get('rift_time_left'), 10) || (25 * 60);

const timerDisplay = document.getElementById('timer-display');
const timerStatus = document.getElementById('timer-status');

// 核心計時狀態變數
let lastTickTime = 0;
let lastClockTime = 0;

function updateTimerDisplay() {
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  timerDisplay.textContent = `${mins}:${secs}`;
  
  storage.set('rift_time_left', timeLeft);
  storage.set('rift_timer_mode', currentMode);
}

// 核心循環：利用動畫影格進行毫秒級別的比對
function animationLoop(timestamp) {
  // A. 每隔 1000 毫秒更新一次普通時鐘
  if (!lastClockTime || timestamp - lastClockTime >= 1000) {
    updateClock();
    lastClockTime = timestamp;
  }

  // B. 番茄鐘計時邏輯
  if (isTimerRunning) {
    if (!lastTickTime) lastTickTime = timestamp;

    // 當時間跨度超過 1 秒 (1000ms) 時觸發
    if (timestamp - lastTickTime >= 1000) {
      timeLeft--;
      updateTimerDisplay();
      lastTickTime = timestamp; // 重置基準時間戳記

      if (timeLeft <= 0) {
        isTimerRunning = false;
        timerDisplay.classList.remove('running');
        playNotificationSound();

        // 自動切換模式
        if (currentMode === 'focus') {
          currentMode = 'break';
          timeLeft = 5 * 60; 
          timerStatus.textContent = 'SESSION COMPLETE! START BREAK';
        } else {
          currentMode = 'focus';
          timeLeft = 25 * 60; 
          timerStatus.textContent = 'BREAK COMPLETE! CLICK TO FOCUS';
        }
        updateTimerDisplay();
      }
    }
    // 持續請求下一影格
    requestAnimationFrame(animationLoop);
  }
}

// 傳統的普通時鐘更新功能
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}`;

  const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };
  document.getElementById('date').textContent = now.toLocaleDateString('en-US', options);
}

// 初始化番茄鐘顯示狀態與啟動首影格
updateTimerDisplay();
timerStatus.textContent = currentMode === 'focus' ? 'PAUSED' : 'BREAK PAUSED';
requestAnimationFrame(animationLoop);

// ================= 2. 番茄鐘操作互動 =================
function toggleTimer() {
  if (isTimerRunning) {
    isTimerRunning = false;
    timerDisplay.classList.remove('running');
    timerStatus.textContent = currentMode === 'focus' ? 'PAUSED' : 'BREAK PAUSED';
  } else {
    isTimerRunning = true;
    timerDisplay.classList.add('running');
    timerStatus.textContent = currentMode === 'focus' ? 'FOCUSING...' : 'TAKING A BREAK...';
    
    // 重置計時器的影格基準時間戳記，防止從暫停回復時發生跳秒
    lastTickTime = performance.now(); 
    requestAnimationFrame(animationLoop);
  }
}

// 修正後的雙擊重置邏輯：根據當前模式 (currentMode) 來決定重置的時間
timerDisplay.addEventListener('click', toggleTimer);
timerDisplay.addEventListener('dblclick', () => {
  isTimerRunning = false;
  
  if (currentMode === 'focus') {
    timeLeft = 25 * 60; // 專注模式下重置為 25 分鐘
    timerStatus.textContent = 'RESET (FOCUS)';
  } else {
    timeLeft = 5 * 60;  // 休息模式下重置為 5 分鐘
    timerStatus.textContent = 'RESET (BREAK)';
  }
  
  updateTimerDisplay();
  timerDisplay.classList.remove('running');
});

function playNotificationSound() {
  if (!audioCtx) initAudio();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);

  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}


// ================= 3. 查字區（芫荽字體）邏輯 =================
const wordInput = document.getElementById('word-input');
const wordDisplay = document.getElementById('word-display');
const wordHint = document.getElementById('word-hint');

const savedWord = storage.get('rift_saved_word');
if (savedWord) {
  wordDisplay.textContent = savedWord;
  wordInput.value = savedWord;
  wordInput.style.display = 'none';
  wordDisplay.style.display = 'block';
  wordHint.style.display = 'block';
}

wordInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const value = wordInput.value.trim();
    if (value) {
      wordDisplay.textContent = value;
      wordInput.style.display = 'none';
      wordDisplay.style.display = 'block';
      wordHint.style.display = 'block';
      storage.set('rift_saved_word', value);
    }
  }
});

wordDisplay.addEventListener('click', function() {
  wordDisplay.style.display = 'none';
  wordHint.style.display = 'none';
  wordInput.style.display = 'block';
  wordInput.focus();
  wordInput.select();
});


// ================= 4. 白噪音邏輯 =================
let audioCtx = null;
let currentNoiseNode = null;
let gainNode = null; 

const volumeSlider = document.getElementById('volume-slider');
const savedVolume = storage.get('rift_noise_volume');
if (savedVolume !== null) {
  volumeSlider.value = savedVolume;
}

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function createWhiteNoise() {
  const bufferSize = 2 * audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;
  return whiteNoise;
}

function toggleWhiteNoise() {
  initAudio();
  const btn = document.getElementById('btn-white');

  if (currentNoiseNode) {
    currentNoiseNode.stop();
    currentNoiseNode.disconnect(); 
    currentNoiseNode = null;
    btn.classList.remove('playing');
    btn.textContent = 'WHITE NOISE';
    return;
  }

  currentNoiseNode = createWhiteNoise();

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.3 * volumeSlider.value; 

  currentNoiseNode.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  currentNoiseNode.start();
  btn.classList.add('playing');
  btn.textContent = 'STOP NOISE';
}

volumeSlider.addEventListener('input', function() {
  storage.set('rift_noise_volume', this.value); 
  if (gainNode && audioCtx) {
    gainNode.gain.linearRampToValueAtTime(0.3 * this.value, audioCtx.currentTime + 0.05);
  }
});

document.getElementById('btn-white').addEventListener('click', toggleWhiteNoise);
