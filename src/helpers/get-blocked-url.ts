import { CounterPeriod } from "../storage";

// 获取浏览器API，兼容Chrome和Firefox
const browserAPI = typeof chrome !== 'undefined' ? chrome : typeof browser !== 'undefined' ? browser : null;

export const __getBlockedHtmlUrl = () => {
  if (!browserAPI) return "blocked.html";
  return browserAPI.runtime.getURL("blocked.html");
};

export interface GetBlockedUrlParams {
  url: string
  rule: string
  countParams?: {
    count: number
    period: CounterPeriod
  }
}

export default ({ url, rule, countParams }: GetBlockedUrlParams): string => {
  const params = new URLSearchParams({ url, rule });
  if (countParams) {
    params.append("count", countParams.count.toString());
    params.append("period", countParams.period);
  }

  return `${__getBlockedHtmlUrl()}?${params.toString()}`;
};
