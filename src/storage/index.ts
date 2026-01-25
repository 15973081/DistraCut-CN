import { Schema } from "./schema";

export * from "./schema";

// 统一获取浏览器API，兼容Chrome和Firefox
const getBrowserAPI = () => {
  if (typeof chrome !== 'undefined') {
    return chrome;
  } else if (typeof browser !== 'undefined') {
    return browser;
  }
  return null;
};

const browserAPI = getBrowserAPI();

// 统一存储API调用，兼容Chrome和Firefox
const storageAPI = browserAPI && browserAPI.storage ? browserAPI.storage : null;

if (!storageAPI) {
  throw new Error("Storage API not available");
}

const set = <T extends Partial<Schema>>(items: T) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const result = storageAPI.local.set(items);
      if (result && typeof result.then === 'function') {
        result.then(resolve).catch(reject);
      } else {
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
};

const get = <T extends keyof Schema>(keys: T[]) => {
  return new Promise<Pick<Schema, T>>((resolve, reject) => {
    try {
      // 尝试使用Promise形式

      // vscode会显示下方报错，实际上是可以运行的，不用担心
      const result = storageAPI.local.get(keys);
      if (result && typeof result.then === 'function') {
        result.then(resolve).catch(reject);
      } else {
        // 回退到回调形式
        storageAPI.local.get(keys, (data) => {
          // 简化错误处理，直接尝试获取lastError
          const lastError = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) ||
                           (browserAPI && browserAPI.runtime && browserAPI.runtime.lastError);
          if (lastError) {
            reject(lastError);
          } else {
            resolve(data as Pick<Schema, T>);
          }
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getAll = () => get([
  "enabled",
  "contextMenu",
  "blocked",
  "counter",
  "counterShow",
  "counterPeriod",
  "resolution",
]);

export default {
  set,
  get,
  getAll,
};
