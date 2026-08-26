// 统一时间工具（与客户端 Unity 侧方案对齐）
// - 存储与比较一律使用 Unix 秒级时间戳（整数）
// - 解析兼容三级策略：
//   1) 纯数字识别为 Unix 秒/毫秒时间戳，以 1e11 为阈值区分；
//   2) 固定格式优先匹配：ISO 8601 带时区、HTTP GMT 头（RFC 1123），正则识别后用
//      Date.UTC 纯算术换算，全程不经引擎的日期字符串解析，不依赖本机区域/语言；
//   3) 宽松兜底解析历史格式（yyyy/M/d、"YYYY-MM-DD HH:mm:ss"、MM/dd/yyyy，
//      首段 >12 时按 dd/MM 解释），一律按本机时区解释。
import { date } from "quasar";

// 秒/毫秒阈值：秒级时间戳到 5138 年也不会达到 1e11，毫秒级均远大于它
const NUMERIC_TS_THRESHOLD = 1e11;

function _fromNumber(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  const sec = Math.abs(n) < NUMERIC_TS_THRESHOLD ? n : Math.floor(n / 1000);
  return sec > 0 ? sec : null;
}

// 固定格式层：正则识别 + Date.UTC 算术换算。
// 刻意不走 Date.parse——ECMA 只规范了 ISO 子集，RFC 1123 仅是引擎间事实标准；
// 手工换算后，结果只由输入本身决定，与引擎实现和本机设置彻底无关。

const MONTH_INDEX = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

// HTTP 日期头（RFC 1123 / RFC 9110 IMF-fixdate）：Tue, 01 May 2024 04:00:00 GMT
const HTTP_DATE_RE =
  /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{2}):(\d{2}):(\d{2}) GMT$/;

function _tryParseHttpDate(text) {
  const m = HTTP_DATE_RE.exec(text);
  if (!m) return null;
  const d = +m[1];
  const mo = MONTH_INDEX[m[2]];
  if (mo == null || d < 1 || d > 31 || +m[4] > 23 || +m[5] > 59 || +m[6] > 59) {
    return null;
  }
  return Math.floor(Date.UTC(+m[3], mo - 1, d, +m[4], +m[5], +m[6]) / 1000);
}

// ISO 8601 date-time 且必须自带时区：
// 2024-05-01T12:00:00Z / ...t12:00:00.123456z / ...T12:00:00+08:00 / ...+0800
const ISO_TS_RE =
  /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(?:([Zz])|([+-])(\d{2}):?(\d{2}))$/;

function _tryParseIso(text) {
  const m = ISO_TS_RE.exec(text);
  if (!m) return null;
  const mo = +m[2];
  const d = +m[3];
  if (
    mo < 1 ||
    mo > 12 ||
    d < 1 ||
    d > 31 ||
    +m[4] > 23 ||
    +m[5] > 59 ||
    +m[6] > 60
  ) {
    return null;
  }
  // 小数秒截断到毫秒（ISO 允许任意位数，秒级存储只需 ms 参与进位）
  const fracMs = Number((m[7] || "0").slice(0, 3).padEnd(3, "0"));
  let ms = Date.UTC(+m[1], mo - 1, d, +m[4], +m[5], +m[6], fracMs);
  if (!m[8]) {
    // 自带数字偏移 +/-HH:mm 或 +/-HHMM：减去偏移得到 UTC 时刻
    const offMin = +m[10] * 60 + +m[11];
    ms -= m[9] === "+" ? offMin * 60000 : -offMin * 60000;
  }
  return Math.floor(ms / 1000);
}

// 宽松兜底：历史格式，按本机时区解释；可选时间部分 HH:mm 或 HH:mm:ss
const TIME_PART = "(?:[T\\s](\\d{1,2}):(\\d{2})(?::(\\d{2}))?(?:\\.\\d+)?)?";
const LOOSE_FORMAT_RES = [
  // 年开头：2024/5/1、2024-05-01、2024.5.1、2024-05-01 12:00:00、2024年5月1日
  new RegExp(
    "^(\\d{4})[\\-/\\.年](\\d{1,2})[\\-/\\.月](\\d{1,2})日?" + TIME_PART + "$",
  ),
  // 月/日/年：5/1/2024、05/01/2024 12:00 —— 首段 >12 时视为 日/月/年（兼容 dd/MM 历史数据）
  new RegExp("^(\\d{1,2})/(\\d{1,2})/(\\d{4})" + TIME_PART + "$"),
];

function _buildLocalDate(y, mo, d, h = 0, mi = 0, s = 0) {
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || s > 59) {
    return null;
  }
  const dt = new Date(y, mo - 1, d, h, mi, s);
  return Number.isFinite(dt.getTime()) ? Math.floor(dt.getTime() / 1000) : null;
}

function _tryParseLoose(text) {
  let m = LOOSE_FORMAT_RES[0].exec(text);
  if (m) {
    return _buildLocalDate(
      +m[1],
      +m[2],
      +m[3],
      +(m[4] || 0),
      +(m[5] || 0),
      +(m[6] || 0),
    );
  }
  m = LOOSE_FORMAT_RES[1].exec(text);
  if (m) {
    let mo = +m[1];
    let d = +m[2];
    if (mo > 12 && d <= 12) {
      [mo, d] = [d, mo]; // 首段超出月份范围，按 dd/MM 解释
    }
    return _buildLocalDate(
      +m[3],
      mo,
      d,
      +(m[4] || 0),
      +(m[5] || 0),
      +(m[6] || 0),
    );
  }
  return null;
}

/**
 * 任意输入 → Unix 秒级时间戳（整数）；无法识别返回 null。
 * 顺序：数字 → 固定格式（ISO/GMT，按自带时区）→ 宽松历史格式（本机时区）
 */
function toUnixSeconds(val) {
  if (val == null || val === "") return null;
  if (val instanceof Date) return _fromNumber(val.getTime());
  if (typeof val === "number") return _fromNumber(val);
  const text = String(val).trim();
  if (!text) return null;
  if (/^-?\d+$/.test(text)) return _fromNumber(Number(text));
  return _tryParseIso(text) ?? _tryParseHttpDate(text) ?? _tryParseLoose(text);
}

function nowUnixSeconds() {
  return Math.floor(Date.now() / 1000);
}

/** 写入用：转纯数字秒级字符串；无法识别返回空串 */
function toTimestampString(val) {
  const sec = toUnixSeconds(val);
  return sec == null ? "" : String(sec);
}

/** 写入用：当前时刻的秒级时间戳字符串 */
function nowTimestampString() {
  return String(nowUnixSeconds());
}

/** 展示用：任意输入 → 本地时间文本（唯一格式化出口） */
function fmtTs(val, pattern = "YYYY-MM-DD HH:mm:ss") {
  const sec = toUnixSeconds(val);
  return sec == null
    ? "未知时间"
    : date.formatDate(new Date(sec * 1000), pattern);
}

export {
  toUnixSeconds,
  nowUnixSeconds,
  toTimestampString,
  nowTimestampString,
  fmtTs,
};
