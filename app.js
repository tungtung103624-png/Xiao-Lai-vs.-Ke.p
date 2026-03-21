// 【自訂 sleep 函數控制節奏】
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 遊戲狀態資料
const state = {
    hero: { hp: 150, maxHp: 150, atk: 700 },
    boss: { hp: 10000, maxHp: 10000, atk: 35 },
    cd: { heavy: 0, stun: 0 },
    isBossStunned: false,
    isGameOver: false,
    isMobile: window.innerWidth <= 900
};

// 監聽視窗大小改變
window.addEventListener('resize', () => { 
    state.isMobile = window.innerWidth <= 900; 
    document.getElementById('skill-sidebar').style.display = state.isMobile ? 'none' : 'block';
});

// 非同步打字機特效
async function typewriter(text, elementId, speed = 50) {
    const el = document.getElementById(elementId);
    el.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
        el.innerHTML += text.charAt(i);
        await sleep(speed);
    }
}

// 豐富的動態日誌
function addLog(msg, type = 'normal') {
    const logEl = document.getElementById('log');
    let colorClass = '';
    if (type === 'hero') colorClass = 'log-hero';
    else if (type === 'boss') colorClass = 'log-boss';
    else if (type === 'sys') colorClass = 'log-sys';
    else if (type === 'dmg') colorClass = 'log-dmg';
    else if (type === 'heal') colorClass = 'log-heal';
    else if (type === 'stun') colorClass = 'log-stun';
    
    logEl.innerHTML += `<span class="${colorClass}">> ${msg}</span><br><br>`;
    logEl.scrollTop = logEl.scrollHeight;
}

// 更新 UI (血條顏色與長度、按鈕狀態)
function updateUI() {
    const hHpPercent = Math.max(0, (state.hero.hp / state.hero.maxHp) * 100);
    const bHpPercent = Math.max(0, (state.boss.hp / state.boss.maxHp) * 100);
    
    const hBar = document.getElementById('hero-hp-bar');
    hBar.style.width = `${hHpPercent}%`;
    hBar.style.backgroundColor = hHpPercent < 30 ? 'red' : hHpPercent < 60 ? 'orange' : 'var(--primary-color)';
    document.getElementById('hero-hp-text').innerText = `${Math.floor(state.hero.hp)} / ${state.hero.maxHp}`;

    const bBar = document.getElementById('boss-hp-bar');
    bBar.style.width = `${bHpPercent}%`;
    bBar.style.backgroundColor = bHpPercent < 30 ? 'red' : 'var(--primary-color)';
    document.getElementById('boss-hp-text').innerText = `${Math.floor(state.boss.hp)} / ${state.boss.maxHp}`;

    const btnHeavy = document.getElementById('btn-heavy');
    const btnStun = document.getElementById('btn-stun');
    
    btnHeavy.innerHTML = state.cd.heavy > 0 ? `【穿雲箭】<br>(CD: ${state.cd.heavy})` : `【穿雲箭】<br>(高傷暴擊)`;
    btnHeavy.disabled = state.cd.heavy > 0 || state.isGameOver;

    btnStun.innerHTML = state.cd.stun > 0 ? `【瑪麗亞...】<br>(CD: ${state.cd.stun})` : `【瑪麗亞...】<br>(中斷暈眩)`;
    btnStun.disabled = state.cd.stun > 0 || state.isGameOver;

    document.getElementById('btn-attack').disabled = state.isGameOver;
    document.getElementById('btn-heal').disabled = state.isGameOver;
}

// 播放動畫 (必須先移除舊動畫並重繪)
async function playAnimation(elementId, animationDef, duration = 500) {
    const el = document.getElementById(elementId);
    el.style.animation = 'none';
    void el.offsetWidth;         
    el.style.animation = animationDef;
    await sleep(duration);
    if(!animationDef.includes('forwards')) {
        el.style.animation = 'none'; 
    }
}

// 開場前言執行
async function initGame() {
    const proKo = document.getElementById('pro-ko');
    const proHan = document.getElementById('pro-han');
    const proBoss = document.getElementById('pro-boss');
    const prologueTextEl = document.getElementById('prologue-text');
    
    proKo.style.display = 'inline-block';
    await sleep(100);
    proKo.style.opacity = 1;
    await typewriter("柯文哲抓了抓頭：「每天晚上都在嗡嗡嗡，結果現在連系統都被駭客入侵了，這完全不符合科學嘛！」", 'prologue-text', 40);
    await sleep(1500); 
    proKo.style.opacity = 0;
    await sleep(800);
    proKo.style.display = 'none';
    prologueTextEl.innerHTML = ''; 

    proHan.style.display = 'inline-block';
    await sleep(100);
    proHan.style.opacity = 1;
    await typewriter("韓國瑜拿著麥克風大喊：「一碗滷肉飯！一瓶礦泉水！就算遇到 Debug，我們也要把系統弄到發大財啦！」", 'prologue-text', 40);
    await sleep(1500); 
    proHan.style.opacity = 0;
    await sleep(800);
    proHan.style.display = 'none';
    prologueTextEl.innerHTML = ''; 

    proBoss.style.display = 'inline-block';
    await sleep(100);
    proBoss.style.opacity = 1;
    await typewriter("賴清德推了推眼鏡，眼神銳利：「這世界需要的是絕對的清廉與 SOP。惡意代碼『功德圓滿.exe』已啟動，準備肅清所有混亂。」", 'prologue-text', 40);
    await sleep(2000); 

    // 切換畫面
    document.getElementById('prologue').style.display = 'none';
    document.getElementById('main-wrapper').style.display = 'flex'; 
    document.getElementById('skill-sidebar').style.display = state.isMobile ? 'none' : 'block';

    addLog("SYSTEM_BOOT: 終端機連線成功，緊急協議『大A的逆襲』已啟動，戰鬥開始。", "sys");
    updateUI();
}

// 玩家回合邏輯
async function playerAction(action) {
    if (state.isGameOver) return;
    document.querySelectorAll('button').forEach(b => b.disabled = true);

    const heroImgId = 'hero-imgs';
    const bossImgId = 'boss-imgs';
    const dashAnim = state.isMobile ? 'dash-hero-mobile 0.5s ease' : 'dash-hero-desktop 0.5s ease';

    if (action === 'attack') {
        addLog("柯文哲推了推眼鏡，眼中閃爍著數據流：「我跟你講，這個數據分析起來就是這樣，該打的地方就要打！」", "hero");
        await playAnimation(heroImgId, dashAnim);
        const dmg = state.hero.atk + Math.floor(Math.random() * 100 - 50); 
        state.boss.hp -= dmg;
        addLog(`>> 阿北執行了 std::attack()，程式碼衝撞了賴清德的系統核心，造成了 <span class="log-dmg">${dmg}</span> 點實質傷害。`, "sys");
        playAnimation(bossImgId, 'glitch 0.5s ease');
        await sleep(800);
    } 
    else if (action === 'heavy') {
        addLog("韓國瑜氣聚丹田，大喝一聲：「一支穿雲箭，千軍萬馬來相見！」「發大財啦！」頓時天搖地動，金光閃閃！", "hero");
        state.cd.heavy = 3; 
        await playAnimation(heroImgId, dashAnim);
        const dmg = (state.hero.atk * 2.5) + Math.floor(Math.random() * 200); 
        state.boss.hp -= dmg;
        addLog(`>> 韓國瑜輸入了 sudo rm -rf /！這招直接暴力摧毀了賴清德的防禦機制，引發嚴重暴擊，造成了 <span class="log-dmg">${dmg}</span> 點巨大傷害！`, "sys");
        playAnimation(bossImgId, 'glitch 0.8s ease');
        await sleep(1000);
    }
    else if (action === 'stun') {
        addLog("韓國瑜喝了一口礦泉水，開始魔幻走位，邊跳邊喊：「瑪麗亞，莎莎亞！大家一起來！」", "hero");
        state.cd.stun = 4; 
        await playAnimation(heroImgId, dashAnim);
        const dmg = 50; 
        state.boss.hp -= dmg;
        state.isBossStunned = true;
        addLog(`>> 執行了 Ctrl+C (中斷)。造成 <span class="log-dmg">${dmg}</span> 點微弱傷害，但賴清德被這毫無邏輯的舞步搞得一頭霧水，陷入 <span class="log-stun">「暈眩(Stunned)」</span> 狀態！`, "sys");
        playAnimation(bossImgId, 'glitch 0.5s ease');
        await sleep(800);
    }
    else if (action === 'heal') {
        addLog("柯文哲拿出平板狂點：「來來來，SOP拿出來，先止血再說，不然等一下加護病房都進不去！」", "hero");
        const healAmt = 60;
        state.hero.hp = Math.min(state.hero.hp + healAmt, state.hero.maxHp);
        addLog(`>> 執行 debug_heal()，阿北與國瑜的系統穩定度恢復了 <span class="log-heal">${healAmt}</span> 點 HP。`, "sys");
        await sleep(800);
    }

    updateUI();
    await checkWinCondition();

    if (!state.isGameOver) {
        await bossTurn();
    }
}

// 魔王回合邏輯
async function bossTurn() {
    // 結算 CD
    if (state.cd.heavy > 0) state.cd.heavy--;
    if (state.cd.stun > 0) state.cd.stun--;

    addLog("【大魔王賴清德 回合】", "sys");
    await sleep(800);

    // 判斷暈眩
    if (state.isBossStunned) {
        addLog("賴清德皺起眉頭，被韓國瑜的舞步搞得頭暈目眩：「這...這到底是什麼亂七八糟的步伐？完全不符合標準作業程序！」", "boss");
        addLog(`>> 賴清德本回合陷入 <span class="log-stun">暈眩</span>，無法發動攻擊。`, "sys");
        state.isBossStunned = false; 
    } else {
        addLog("賴清德冷酷地舉起手：「你們的行為太過混亂，必須接受道德的重整與制裁！」", "boss");
        const dashAnim = state.isMobile ? 'dash-boss-mobile 0.5s ease' : 'dash-boss-desktop 0.5s ease';
        await playAnimation('boss-imgs', dashAnim);
        
        const dmg = state.boss.atk + Math.floor(Math.random() * 10 - 5);
        state.hero.hp -= dmg;
        addLog(`>> 賴清德發射了【清廉光束】，強大的政策威壓讓阿北與國瑜受到 <span class="log-dmg">${dmg}</span> 點系統傷害。`, "sys");
        playAnimation('hero-imgs', 'glitch 0.5s ease');
        await sleep(800);
    }

    updateUI();
    await checkWinCondition();
    
    if (!state.isGameOver) {
        addLog("【勇者回合：請輸入指令】", "sys");
        updateUI(); 
    }
}

// 檢查勝負狀態
async function checkWinCondition() {
    if (state.boss.hp <= 0) {
        state.boss.hp = 0;
        state.isGameOver = true;
        updateUI();
        addLog("賴清德的資料鐵王座崩塌了：「不...我的完美黨綱...怎麼會敗給這種不科學的組合...」", "boss");
        addLog(">> MISSION ACCOMPLISHED. 阿北與國瑜成功打破了輪迴！系統重新獲得自由！", "sys");
        await playAnimation('boss-imgs', 'drop-dead 1.5s forwards', 1500);
    } 
    else if (state.hero.hp <= 0) {
        state.hero.hp = 0;
        state.isGameOver = true;
        updateUI();
        addLog("柯文哲與韓國瑜承受不住無盡的 SOP 檢討與公文堆疊，最終被系統格式化了...", "sys");
        await playAnimation('hero-imgs', 'drop-dead 1.5s forwards', 1500);
        addLog(">> GAME OVER. 綠色執政，品質保證。", "sys");
    }
}

// 綁定視窗載入事件啟動遊戲
window.onload = initGame;