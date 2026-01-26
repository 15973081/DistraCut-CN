import { Schema } from "./schema";

export * from "./schema";

// 获取存储API，兼容Chrome和Firefox
const getStorageAPI = () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return chrome.storage;
  }
  if (typeof browser !== 'undefined' && browser.storage) {
    return browser.storage;
  }
  throw new Error("Storage API not available");
};

const storageAPI = getStorageAPI();

// 简化存储API封装，直接使用Promise形式
const set = <T extends Partial<Schema>>(items: T) => {
  return storageAPI.local.set(items);
};

const get = <T extends keyof Schema>(keys: T[]) => {
  return storageAPI.local.get(keys) as Promise<Pick<Schema, T>>;
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
