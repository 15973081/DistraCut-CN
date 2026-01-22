import storage from "../storage";
import blockSite from "./block-site";
import removeProtocol from "./remove-protocol";

console.log("测试中文：仅拦截当前页面");

// 创建上下文菜单
const createContextMenu = () => {
  // 创建父菜单
  const parentId = chrome.contextMenus.create({
    id: "block_site",
    title: "网站拦截",
    documentUrlPatterns: ["https://*/*", "http://*/*"],
  });

  // 创建"仅拦截当前页面"子菜单
  const blockOneId = "block_one";
  chrome.contextMenus.create({
    parentId,
    id: blockOneId,
    title: "仅拦截当前页面",
  });

  // 创建"拦截整个网站"子菜单
  const blockAllId = "block_all";
  chrome.contextMenus.create({
    parentId,
    id: blockAllId,
    title: "拦截整个网站",
  });

  // 监听菜单点击事件
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const tabId = tab?.id;
    if (!tabId || ![blockOneId, blockAllId].includes(String(info.menuItemId))) {
      return;
    }

    const url = info.pageUrl;
    // 根据选择的菜单项确定拦截的URL
    const blockedUrl = info.menuItemId === blockOneId
      ? removeProtocol(url) // 仅拦截当前页面
      : new URL(url).host; // 拦截整个网站

    // 获取当前拦截列表并添加新的网站
    storage.get(["blocked"]).then(({ blocked }) => {
      const updatedBlocked = [...blocked, blockedUrl];
      storage.set({ blocked: updatedBlocked });
      // 立即拦截当前标签页
      blockSite({ blocked: updatedBlocked, tabId, url });
    });
  });
};

// 重新创建上下文菜单（根据条件）
export default (meetsCreateCondition: boolean) => {
  // 先移除所有现有菜单
  chrome.contextMenus.removeAll(() => {
    // 如果满足创建条件，则创建菜单
    if (meetsCreateCondition) {
      createContextMenu();
    }
  });
};
