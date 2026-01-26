import { VALIDATORS, CounterPeriod } from "./storage";
import getBlockedMessage from "./helpers/get-blocked-message";
import { getDisciplineDays } from "./utils/discipline-days";

// 获取浏览器API，兼容Chrome和Firefox
const browserAPI = typeof chrome !== 'undefined' ? chrome : typeof browser !== 'undefined' ? browser : null;

// 初始化被拦截页面
const initBlockedPage = async () => {
  try {
    // 显示自律天数
    const disciplineDays = await getDisciplineDays();
    const focusDaysElement = document.getElementById("focus-days");
    if (focusDaysElement) {
      focusDaysElement.textContent = disciplineDays.toString();
    }
    
    // 处理被拦截信息
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    const rule = params.get("rule");
    
    if (url && rule) {
      const count = parseInt(params.get("count") || "");
      const period = params.get("period");
      const countParams = (!isNaN(count) && VALIDATORS.counterPeriod(period))
        ? { count, period: period as CounterPeriod }
        : undefined;

      const message = getBlockedMessage({
        url,
        rule,
        countParams,
      });

      const messageElement = document.getElementById("message");
      if (messageElement) {
        messageElement.innerHTML = message;
      }
    }
    
    // 关闭标签页功能
    const button = document.querySelector('.back-button') as HTMLElement | null;
    if (button) {
      button.addEventListener('click', () => {
        button.style.transform = 'scale(0.95)';

        const fallback = () => {
          window.location.replace('about:blank');
        };

        try {
          if (browserAPI && browserAPI.storage?.session && browserAPI.tabs) {
            // 告诉 background：这是一次"用户主动关闭"
            browserAPI.storage.session.set({ allowCloseOnce: true }, () => {
              browserAPI.tabs.query({ active: true, currentWindow: true }, tabs => {
                const tab = tabs?.[0];
                if (tab?.id) {
                  browserAPI.tabs.remove(tab.id);
                } else {
                  fallback();
                }
              });
            });
          } else {
            fallback();
          }
        } catch (e) {
          fallback();
        }

        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 150);
      });
    }
  } catch (error) {
    console.error("Error initializing blocked page:", error);
  } finally {
    document.body.classList.add("ready");
  }
};

// 监听DOM加载完成
window.addEventListener("DOMContentLoaded", initBlockedPage);
