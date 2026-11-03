import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { SITE } from "@/config";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (
  date: Date,
  format = "MMM D",
  postTimezone: string | undefined = undefined,
) =>
  dayjs(date)
    .tz(postTimezone || SITE.timezone)
    .format(format);
