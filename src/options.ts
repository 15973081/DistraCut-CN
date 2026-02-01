import storage, {
  Schema, Resolution, CounterPeriod, RESOLUTIONS, BLOCKED_EXAMPLE,
} from "./storage";

// 获取浏览器API，兼容Chrome和Firefox
const browserAPI = typeof chrome !== 'undefined' ? chrome : typeof browser !== 'undefined' ? browser : null;

// 模拟 Pip-Boy 的简单合成音效
const playBeep = (freq = 400, duration = 0.05) => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
const typewriter = (element: HTMLElement, text: string, speed = 30) => {
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

// 初始化选项页面
const initOptionsPage = async () => {
  try {
    // 获取DOM元素
    const elements = {
      enabled: document.getElementById("enabled") as HTMLSelectElement,
      contextMenu: document.getElementById("context-menu") as HTMLSelectElement,
      blockedList: document.getElementById("blocked-list") as HTMLTextAreaElement,
      resolution: document.getElementById("resolution") as HTMLSelectElement,
      counterShow: document.getElementById("counter-show") as HTMLSelectElement,
      counterPeriod: document.getElementById("counter-period") as HTMLSelectElement,
    };

    // 设置占位符
    if (elements.blockedList) {
      elements.blockedList.placeholder = BLOCKED_EXAMPLE.join("\n");
    }

    // 辅助函数
    const booleanToString = (b: boolean) => b ? "YES" : "NO";
    const stringToBoolean = (s: string) => s === "YES";
    const getEventTargetValue = (event: Event) => (event.target as HTMLTextAreaElement | HTMLSelectElement).value;
    const stringToBlocked = (string: string) => string.split("\n").map((s) => s.trim()).filter(Boolean);

    // 绑定事件监听器
    if (elements.enabled) {
      elements.enabled.addEventListener("change", (event) => {
        const enabled = stringToBoolean(getEventTargetValue(event));
        playBeep(400, 0.05);
        storage.set({ enabled }).then(() => {
          showSaveStatus();
        });
      });
    }

    if (elements.contextMenu) {
      elements.contextMenu.addEventListener("change", (event) => {
        const contextMenu = stringToBoolean(getEventTargetValue(event));
        playBeep(400, 0.05);
        storage.set({ contextMenu }).then(() => {
          showSaveStatus();
        });
      });
    }

    if (elements.blockedList) {
      elements.blockedList.addEventListener("input", (event) => {
        const blocked = stringToBlocked(getEventTargetValue(event));
        playBeep(400, 0.05);
        storage.set({ blocked }).then(() => {
          showSaveStatus();
        });
      });
    }

    if (elements.resolution) {
      elements.resolution.addEventListener("change", (event) => {
        const resolution = getEventTargetValue(event) as Resolution;
        playBeep(400, 0.05);
        storage.set({ resolution }).then(() => {
          showSaveStatus();
        });
      });
    }

    if (elements.counterShow) {
      elements.counterShow.addEventListener("change", (event) => {
        const counterShow = stringToBoolean(getEventTargetValue(event));
        playBeep(400, 0.05);
        storage.set({ counterShow }).then(() => {
          showSaveStatus();
        });
      });
    }

    if (elements.counterPeriod) {
      elements.counterPeriod.addEventListener("change", (event) => {
        const counterPeriod = getEventTargetValue(event) as CounterPeriod;
        playBeep(400, 0.05);
        storage.set({ counterPeriod }).then(() => {
          showSaveStatus();
        });
      });
    }

    // 显示保存状态
    const showSaveStatus = () => {
      const status = document.createElement('div');
      status.style.cssText = "position:fixed; bottom:20px; right:20px; color:#18fa72; font-weight:bold;";  
      status.textContent = ">>> 存储块已更新 [OK]";
      document.body.appendChild(status);
      playBeep(800, 0.1);
      setTimeout(() => status.remove(), 2000);
    };

    // 初始化UI
    const initUI = <T extends Partial<Schema>>(items: T) => {
      if (items.enabled !== undefined && elements.enabled) {
        elements.enabled.value = booleanToString(items.enabled);
      }

      if (items.contextMenu !== undefined && elements.contextMenu) {
        elements.contextMenu.value = booleanToString(items.contextMenu);
      }

      if (items.blocked !== undefined && elements.blockedList) {
        const valueAsBlocked = stringToBlocked(elements.blockedList.value);
        if (JSON.stringify(valueAsBlocked) !== JSON.stringify(items.blocked)) {
          elements.blockedList.value = items.blocked.join("\r\n");
        }
      }

      if (items.resolution !== undefined && elements.resolution) {
        elements.resolution.value = items.resolution;
        RESOLUTIONS.forEach((oneResolution) => {
          document.body.classList.remove(`resolution-${oneResolution}`);
        });
        document.body.classList.add(`resolution-${items.resolution}`);
      }

      if (items.counterShow !== undefined && elements.counterShow) {
        elements.counterShow.value = booleanToString(items.counterShow);
        document.body.classList.toggle("counter-show", items.counterShow);
      }

      if (items.counterPeriod !== undefined && elements.counterPeriod) {
        elements.counterPeriod.value = items.counterPeriod;
      }
    };

    // 获取初始配置
    const keys: (keyof Schema)[] = [
      "enabled",
      "contextMenu",
      "blocked",
      "resolution",
      "counterShow",
      "counterPeriod",
    ];

    const local = await storage.get(keys);
    initUI(local);
    document.body.classList.add("ready");

    // 初始化打字效果
    const title = document.getElementById('terminal-title');
    if (title) {
      const titleText = "网站拦截系统 V4.0";
      title.setAttribute('data-text', titleText);
      typewriter(title, titleText);
    }

    // 处理拦截信息细节的显示/隐藏逻辑
    const resSelect = document.getElementById('resolution');
    const details = document.getElementById('blocked-info-page-details');

    const toggleDetails = () => {
      if (resSelect && details) {
        details.style.display = resSelect.value === 'SHOW_BLOCKED_INFO_PAGE' ? 'block' : 'none';
      }
    };

    if (resSelect) {
      resSelect.addEventListener('change', toggleDetails);
    }
    toggleDetails(); // 初始化状态

    // 监听存储变化
    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      browserAPI.storage.local.onChanged.addListener((changes) => {
        keys.forEach((key) => {
          if (changes[key]) {
            initUI({ [key]: changes[key].newValue });
          }
        });
      });
    }
  } catch (error) {
    console.error("Error initializing options page:", error);
  }
};

// 监听DOM加载完成
window.addEventListener("DOMContentLoaded", initOptionsPage);
