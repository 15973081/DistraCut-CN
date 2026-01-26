import storage from "../storage";
import findRule from "./find-rule";
import * as counterHelper from "./counter";
import getBlockedUrl from "./get-blocked-url";

interface BlockSiteOptions {
  blocked: string[];
  tabId: number;
  url: string;
}

/** 安全更新 Tab，兼容 Firefox 和 Chrome */
async function safeUpdateTab(tabId: number, updateProperties: chrome.tabs.UpdateProperties & { loadReplace?: boolean }) {
  if (typeof browser !== 'undefined') {
    await browser.tabs.update(tabId, updateProperties);
  } else if (typeof chrome !== 'undefined') {
    const { loadReplace, ...props } = updateProperties;
    await chrome.tabs.update(tabId, props);
  }
}

/** 安全移除 Tab，兼容 Firefox 和 Chrome */
async function safeRemoveTab(tabId: number) {
  if (typeof browser !== 'undefined') {
    await browser.tabs.remove(tabId);
  } else if (typeof chrome !== 'undefined') {
    await chrome.tabs.remove(tabId);
  }
}

export default async function blockSite({ blocked, tabId, url }: BlockSiteOptions) {
  if (!blocked.length || !tabId || !url.startsWith("http")) return;

  try {
    const foundRule = findRule(url, blocked);
    if (!foundRule || foundRule.type === "allow") {
      const { counter } = await storage.get(["counter"]);
      counterHelper.flushObsoleteEntries({ blocked, counter });
      await storage.set({ counter });
      return;
    }

    const { counter, counterShow, counterPeriod, resolution } = await storage.get([
      "counter",
      "counterShow",
      "counterPeriod",
      "resolution",
    ]);

    // 清理过期计数
    counterHelper.flushObsoleteEntries({ blocked, counter });

    // 添加计数
    const timeStamp = Date.now();
    const count = counterHelper.add(foundRule.path, timeStamp, {
      counter,
      countFromTimeStamp: counterHelper.counterPeriodToTimeStamp(counterPeriod, timeStamp),
    });
    await storage.set({ counter });

    // 执行阻断动作
    if (resolution === "CLOSE_TAB") {
      await safeRemoveTab(tabId);
    } else if (resolution === "SHOW_BLOCKED_INFO_PAGE") {
      const urlToLoad = getBlockedUrl({
        url,
        rule: foundRule.path,
        countParams: counterShow ? { count, period: counterPeriod } : undefined,
      });
      await safeUpdateTab(tabId, { url: urlToLoad, loadReplace: true });
    }
  } catch (error) {
    console.error("Error in blockSite:", error);
  }
}
