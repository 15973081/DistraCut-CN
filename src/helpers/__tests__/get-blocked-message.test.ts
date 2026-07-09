import getBlockedMessage from "../get-blocked-message";

test("getBlockedMessage() returns blocked message", () => {
  expect(getBlockedMessage({
    url: "http://youtube.com/",
    rule: "youtube.com",
  })).toBe('<span id="url">http://youtube.com/</span> <b>已锁定</b> | 违规计数: ID_<span id="rule">youtube.com</span>');

  expect(getBlockedMessage({
    url: "http://youtube.com/",
    rule: "youtube.com",
    countParams: {
      count: 42,
      period: "ALL_TIME",
    },
  })).toBe('<span id="url">http://youtube.com/</span> <b>已锁定</b> | 违规计数: ID_<span id="rule">youtube.com</span> (42次 总共)');

  expect(getBlockedMessage({
    url: "http://youtube.com/",
    rule: "youtube.com",
    countParams: {
      count: 5,
      period: "TODAY",
    },
  })).toBe('<span id="url">http://youtube.com/</span> <b>已锁定</b> | 违规计数: ID_<span id="rule">youtube.com</span> (5次 今天)');

  expect(getBlockedMessage({
    url: "http://youtube.com/",
    rule: "youtube.com",
    countParams: {
      count: 12,
      period: "THIS_WEEK",
    },
  })).toBe('<span id="url">http://youtube.com/</span> <b>已锁定</b> | 违规计数: ID_<span id="rule">youtube.com</span> (12次 本周)');

  expect(getBlockedMessage({
    url: "http://youtube.com/",
    rule: "youtube.com",
    countParams: {
      count: 38,
      period: "THIS_MONTH",
    },
  })).toBe('<span id="url">http://youtube.com/</span> <b>已锁定</b> | 违规计数: ID_<span id="rule">youtube.com</span> (38次 本月)');
});
