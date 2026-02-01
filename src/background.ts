import initStorage from "./storage/init";
import storage from "./storage";
import recreateContextMenu from "./helpers/recreate-context-menu";
import blockSite from "./helpers/block-site";

// 全局状态变量
let __enabled: boolean = false;
let __contextMenu: boolean = false;
let __blocked: string[] = [];

// 获取浏览器API，兼容Chrome和Firefox
const browserAPI = typeof chrome !== 'undefined' ? chrome : typeof browser !== 'undefined' ? browser : null;

// 初始化扩展
const initExtension = async () => {
  if (!browserAPI) return;
  
  try {
    // 初始化存储
    await initStorage();
    
    // 获取初始配置
    const { enabled, contextMenu, blocked } = await storage.get(["enabled", "contextMenu", "blocked"]);
    __enabled = enabled || false;
    __contextMenu = contextMenu || false;
    __blocked = blocked || [];

    // 重建上下文菜单
    recreateContextMenu(__enabled && __contextMenu);
    
    // 注册所有监听器
    registerListeners();
    
    // 监听存储变化
    browserAPI.storage.local.onChanged.addListener((changes) => {
      if (changes["enabled"] !== undefined) {
        __enabled = changes["enabled"].newValue as boolean;
      }

      if (changes["contextMenu"] !== undefined) {
        __contextMenu = changes["contextMenu"].newValue as boolean;
      }

      if (changes["enabled"] || changes["contextMenu"]) {
        recreateContextMenu(__enabled && __contextMenu);
      }

      if (changes["blocked"] !== undefined) {
        __blocked = changes["blocked"].newValue as string[];
      }
    });
  } catch (error) {
    console.error("初始化扩展失败:", error);
  }
};

// 注册所有监听器
const registerListeners = () => {
  if (!browserAPI) return;
  
  // 注册点击事件监听器
  if (browserAPI.action) {
    browserAPI.action.onClicked.addListener(() => {
      browserAPI.runtime.openOptionsPage();
    });
  }
  
  // 注册webNavigation监听器
  if (browserAPI.webNavigation) {
    browserAPI.webNavigation.onBeforeNavigate.addListener((details) => {
      if (!__enabled || !__blocked || __blocked.length === 0) {
        return;
      }

      const { tabId, url, frameId } = details;
      if (!url || !url.startsWith("http") || frameId !== 0) {
        return;
      }

      blockSite({ blocked: __blocked, tabId, url });
    });
  }
  
  // 注册tabs监听器
  if (browserAPI.tabs) {
    browserAPI.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (!tabId || !__enabled || !__blocked || __blocked.length === 0) {
        return;
      }

      const { url } = changeInfo;
      if (!url || !url.startsWith("http")) {
        return;
      }

      blockSite({ blocked: __blocked, tabId, url });
    });
  }
};

// 启动扩展
initExtension();
