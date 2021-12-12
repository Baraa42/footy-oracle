import { ref, watch } from "vue";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday"; // impor
import isTomorrow from "dayjs/plugin/isTomorrow"; // impor
import utc from "dayjs/plugin/utc"; // impor
import timezone from "dayjs/plugin/timezone"; // impor
import timezones from "timezones-list";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs().format();

const timezoneList: Array<any> = timezones;

const current = ref(dayjs());

const guessedTimezone = timezoneList.find((item: any) => dayjs.tz.guess() === item.tzCode);
const selectedTimezone = ref(guessedTimezone ? guessedTimezone : timezoneList[0]);

export const useTimezone = () => {
  const currentTimestamp = dayjs().unix();

  const parseTimestamp = (timestamp: number) => {
    const parsed = dayjs.unix(timestamp).tz(selectedTimezone.value.tzCode);
    return parsed;
  };

  const difference = (timestamp: number) => {
    const parsed = parseTimestamp(timestamp);
    return current.value.diff(parsed, "m");
  };

  const differenceInDay = (timestampA: number, timestampB: number) => {
    const parsedA = parseTimestamp(timestampA);
    const parsedB = parseTimestamp(timestampB);
    return parsedA.diff(parsedB, "d");
  };

  const relativeTime = (timestamp: number) => {
    const parsed = parseTimestamp(timestamp);
    return parsed.from(dayjs());
  };

  const isRunning = (timestamp: number): boolean => {
    if (timestamp < currentTimestamp) {
      return true;
    } else {
      return false;
    }
  };

  const format = (timestamp: number, format: string): any => {
    const parsed = parseTimestamp(timestamp);
    return parsed.format(format);
  };

  const isToday = (timestamp: number): boolean => {
    const parsed = parseTimestamp(timestamp);
    return parsed.isToday();
  };

  const isTomorrow = (timestamp: number): boolean => {
    const parsed = parseTimestamp(timestamp);
    return parsed.isTomorrow();
  };

  const getTime = (timestamp: number): any => {
    const parsed = parseTimestamp(timestamp);
    return parsed.format("HH:mm");
  };

  const getDate = (timestamp: number): any => {
    const parsed = parseTimestamp(timestamp);
    return parsed.format("DD. MMM");
  };

  const getDateTime = (timestamp: number): any => {
    const parsed = parseTimestamp(timestamp);
    return parsed.format("DD. MMM HH:mm");
  };

  const humanizeDate = (date: string): string => {
    const now = dayjs();
    const parsedDate = dayjs(date, "YYYY-MM-DD").tz(selectedTimezone.value.tzCode);

    if (parsedDate.isToday()) {
      return "Today";
    } else if (parsedDate.isTomorrow()) {
      return "Tomorrow";
    } else if (parsedDate.diff(now, "d") + 1 <= 7) {
      return parsedDate.format("dddd");
    }

    return parsedDate.format("ddd DD. MMM");
  };

  return {
    currentTimestamp,
    timezoneList,
    selectedTimezone,
    parseTimestamp,
    isToday,
    isTomorrow,
    getTime,
    format,
    getDate,
    getDateTime,
    isRunning,
    relativeTime,
    differenceInDay,
    difference,
    humanizeDate,
  };
};
