import { CounterPeriod } from "../storage";
import { GetBlockedUrlParams } from "./get-blocked-url";

const periodStrings: Record<CounterPeriod, string> = {
  ALL_TIME: "总共",
  THIS_MONTH: "本月",
  THIS_WEEK: "本周",
  TODAY: "今天",
};

export default ({ url, rule, countParams: cp }: GetBlockedUrlParams): string =>
  `<span id="url">${url}</span> <b>已被拦截</b>，规则：<span id="rule">${rule}</span>`
  + (cp ? ` (${cp.count}次 ${periodStrings[cp.period]})` : "");
