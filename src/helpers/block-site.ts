import storage from "../storage";
import findRule from "./find-rule";
import * as counterHelper from "./counter";
import getBlockedUrl from "./get-blocked-url";

// 获取浏览器API，兼容Chrome和Firefox
const browserAPI = typeof chrome !== 'undefined' ? chrome : typeof browser !== 'undefined' ? browser : null;

interface BlockSiteOptions {
  blocked: string[]
  tabId: number
  url: string
}

export default async (options: BlockSiteOptions) => {
  try {
    const { blocked, tabId, url } = options;
    if (!blocked.length || !tabId || !url.startsWith("http")) {
      return;
    }

    const foundRule = findRule(url, blocked);
    if (!foundRule || foundRule.type === "allow") {
      const { counter } = await storage.get(["counter"]);
      counterHelper.flushObsoleteEntries({ blocked, counter });
      await storage.set({ counter });
      return;
    }

    const { counter, counterShow, counterPeriod, resolution } = await storage.get(["counter", "counterShow", "counterPeriod", "resolution"]);
    counterHelper.flushObsoleteEntries({ blocked, counter });

    const timeStamp = Date.now();
    const count = counterHelper.add(foundRule.path, timeStamp, {
      counter,
      countFromTimeStamp: counterHelper.counterPeriodToTimeStamp(counterPeriod, new Date().getTime()),
    });
    await storage.set({ counter });

    if (!browserAPI) return;

    switch (resolution) {
      case "CLOSE_TAB":
        browserAPI.tabs.remove(tabId);
        break;
      case "SHOW_BLOCKED_INFO_PAGE": {
        const commonUpdateProperties = {
          url: getBlockedUrl({
            url,
            rule: foundRule.path,
            countParams: counterShow ? { count, period: counterPeriod } : undefined,
          }),
        };

        // 兼容Firefox的loadReplace选项，vscode显示正常，webstorm显示update不正常原因是因为：
        //browserAPI 类型是 联合类型：两个 API 的 tabs.update 签名不同：但为了保护firefox兼容性，只能这样做
        if (typeof browser !== 'undefined') {
          browserAPI.tabs.update(tabId, { ...commonUpdateProperties, loadReplace: true });
        } else {
          browserAPI.tabs.update(tabId, commonUpdateProperties);
        }
        break;
      }
    }
  } catch (error) {
    console.error("Error in blockSite:", error);
  }
};
