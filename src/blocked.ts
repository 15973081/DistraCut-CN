import { VALIDATORS, CounterPeriod } from "./storage";
import getBlockedMessage from "./helpers/get-blocked-message";
import { setAllowCloseOnce } from "./helpers/allow-once";

// 获取浏览器API，兼容Chrome和Firefox
const browserAPI = typeof chrome !== 'undefined' ? chrome : typeof browser !== 'undefined' ? browser : null;

// 初始化被拦截页面
const initBlockedPage = async () => {
  try {
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
    
    // 允许用户临时继续访问一次
    const button = document.querySelector('.back-button') as HTMLElement | null;
    if (button) {
      button.addEventListener('click', async () => {
        button.style.transform = 'scale(0.95)';

        const fallback = () => {
          window.location.replace('about:blank');
        };

        try {
          if (url) {
            await setAllowCloseOnce({ url, timestamp: Date.now() });
            window.location.replace(url);
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
