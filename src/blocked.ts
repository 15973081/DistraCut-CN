import { VALIDATORS, CounterPeriod } from "./storage";
import getBlockedMessage from "./helpers/get-blocked-message";
import { getDisciplineDays } from "./utils/discipline-days";

window.addEventListener("DOMContentLoaded", async () => {
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

    (document.getElementById("message") as HTMLParagraphElement).innerHTML = message;
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
        if (typeof chrome !== 'undefined' && chrome.storage?.session && chrome.tabs) {
          // 告诉 background：这是一次"用户主动关闭"
          chrome.storage.session.set({ allowCloseOnce: true }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
              const tab = tabs?.[0];
              if (tab?.id) {
                chrome.tabs.remove(tab.id);
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
  
  document.body.classList.add("ready");
});
