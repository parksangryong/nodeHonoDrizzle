import dayjs from "dayjs";

export const formatFullDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};

export const formatDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD");
};

export const formatTime = (date: string) => {
  return dayjs(date).format("HH:mm:ss");
};

export const koreaTime = () => {
  return dayjs().add(9, "hour");
};
