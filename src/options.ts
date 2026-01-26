import storage, {
  Schema, Resolution, CounterPeriod, RESOLUTIONS, BLOCKED_EXAMPLE,
} from "./storage";

// 获取浏览器API，兼容Chrome和Firefox
const browserAPI = typeof chrome !== 'undefined' ? chrome : typeof browser !== 'undefined' ? browser : null;

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
        storage.set({ enabled });
      });
    }

    if (elements.contextMenu) {
      elements.contextMenu.addEventListener("change", (event) => {
        const contextMenu = stringToBoolean(getEventTargetValue(event));
        storage.set({ contextMenu });
      });
    }

    if (elements.blockedList) {
      elements.blockedList.addEventListener("input", (event) => {
        const blocked = stringToBlocked(getEventTargetValue(event));
        storage.set({ blocked });
      });
    }

    if (elements.resolution) {
      elements.resolution.addEventListener("change", (event) => {
        const resolution = getEventTargetValue(event) as Resolution;
        storage.set({ resolution });
      });
    }

    if (elements.counterShow) {
      elements.counterShow.addEventListener("change", (event) => {
        const counterShow = stringToBoolean(getEventTargetValue(event));
        storage.set({ counterShow });
      });
    }

    if (elements.counterPeriod) {
      elements.counterPeriod.addEventListener("change", (event) => {
        const counterPeriod = getEventTargetValue(event) as CounterPeriod;
        storage.set({ counterPeriod });
      });
    }

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
