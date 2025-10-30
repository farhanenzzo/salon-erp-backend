import { formatDistanceToNow } from "date-fns";

export const getRelativeTime = (timestamp) => {
  console.log("timestamp", timestamp);
  const formatedDate = formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  });
  console.log("formatedDate", formatedDate);

  return formatedDate;
};
