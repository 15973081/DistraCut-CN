import storage from "../storage";

const INSTALL_DATE_KEY = "installDate";
const DISCIPLINE_DAYS_KEY = "disciplineDays";

// 获取浏览器API，兼容Chrome和Firefox
const browserAPI = typeof chrome !== 'undefined' ? chrome : typeof browser !== 'undefined' ? browser : null;

/**
 * 初始化自律天数功能
 * 在插件首次安装时记录安装时间
 */
export const initDisciplineDays = () => {
  if (browserAPI && browserAPI.runtime) {
    browserAPI.runtime.onInstalled.addListener((details) => {
      if (details.reason === "install") {
        // 记录首次安装时间
        const installDate = new Date().toISOString();
        storage.set({ [INSTALL_DATE_KEY]: installDate });
        // 初始化自律天数为 1
        storage.set({ [DISCIPLINE_DAYS_KEY]: 1 });
      }
    });
  }
};

/**
 * 计算自律天数
 * 使用自然日计算，不考虑具体时间
 * @returns 自律天数
 */
export const calculateDisciplineDays = async (): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { installDate } = await storage.get([INSTALL_DATE_KEY]);
    if (!installDate) {
      // 如果没有安装日期，返回 0
      return 0;
    }
    
    const installDateObj = new Date(installDate);
    installDateObj.setHours(0, 0, 0, 0);
    
    // 计算两个日期之间的天数差
    const timeDiff = today.getTime() - installDateObj.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // 确保天数至少为 1
    const disciplineDays = Math.max(1, dayDiff);
    
    // 更新存储的自律天数
    storage.set({ [DISCIPLINE_DAYS_KEY]: disciplineDays });
    
    return disciplineDays;
  } catch (error) {
    console.error("Error calculating discipline days:", error);
    return 0;
  }
};

/**
 * 获取自律天数
 * @returns 自律天数
 */
export const getDisciplineDays = async (): Promise<number> => {
  try {
    const { disciplineDays } = await storage.get([DISCIPLINE_DAYS_KEY]);
    if (disciplineDays) {
      return disciplineDays;
    }
    
    // 如果没有存储的天数，重新计算
    return await calculateDisciplineDays();
  } catch (error) {
    console.error("Error getting discipline days:", error);
    return 0;
  }
};
