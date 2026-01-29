/**
 * 辐射风格 options.js
 * 功能：管理拦截设置 + 终端机动效
 */

// 模拟 Pip-Boy 的简单合成音效
const playBeep = (freq = 400, duration = 0.05) => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

// 终端机打字效果
const typewriter = (element, text, speed = 30) => {
  let i = 0;
  element.innerHTML = '';
  element.setAttribute('data-text', text);
  const timer = setInterval(() => {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      if (i % 3 === 0) playBeep(600, 0.01); // 微弱的打字声
    } else {
      clearInterval(timer);
    }
  }, speed);
};

// 保存设置
const saveOptions = () => {
  const settings = {
    enabled: document.getElementById('enabled').value,
    contextMenu: document.getElementById('context-menu').value,
    blockedList: document.getElementById('blocked-list').value.split('\n').filter(s => s.trim() !== ''),
    resolution: document.getElementById('resolution').value,
    counterShow: document.getElementById('counter-show').value,
    counterPeriod: document.getElementById('counter-period').value
  };

  chrome.storage.sync.set(settings, () => {
    const status = document.createElement('div');
    status.style.cssText = "position:fixed; bottom:20px; right:20px; color:#18fa72; font-weight:bold;";
    status.textContent = ">>> 存储块已更新 [OK]";
    document.body.appendChild(status);
    playBeep(800, 0.1);
    setTimeout(() => status.remove(), 2000);
  });
};

// 加载设置
const restoreOptions = () => {
  chrome.storage.sync.get({
    enabled: 'YES',
    contextMenu: 'YES',
    blockedList: [],
    resolution: 'SHOW_BLOCKED_INFO_PAGE',
    counterShow: 'YES',
    counterPeriod: 'ALL_TIME'
  }, (items) => {
    document.getElementById('enabled').value = items.enabled;
    document.getElementById('context-menu').value = items.contextMenu;
    document.getElementById('blocked-list').value = items.blockedList.join('\n');
    document.getElementById('resolution').value = items.resolution;
    document.getElementById('counter-show').value = items.counterShow;
    document.getElementById('counter-period').value = items.counterPeriod;

    // 初始化打字效果
    // 针对terminal-title 进行替换
    const title = document.getElementById('terminal-title');
    const titleText = "网站拦截系统 V4.0";
    title.setAttribute('data-text', titleText);
    typewriter(title, titleText);
  });
};

// 监听输入变化自动保存
document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();

  const inputs = ['enabled', 'context-menu', 'blocked-list', 'resolution', 'counter-show', 'counter-period'];
  inputs.forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      playBeep(400, 0.05);
      saveOptions();
    });
  });

  // 处理拦截信息细节的显示/隐藏逻辑
  const resSelect = document.getElementById('resolution');
  const details = document.getElementById('blocked-info-page-details');

  const toggleDetails = () => {
    details.style.display = resSelect.value === 'SHOW_BLOCKED_INFO_PAGE' ? 'block' : 'none';
  };

  resSelect.addEventListener('change', toggleDetails);
  toggleDetails(); // 初始化状态
});
