export const differenceDay = ({
  todayDate,
  lastCheckinDay,
}: {
  todayDate: Date;
  lastCheckinDay: Date;
}) => {
  const dayDifference = Math.floor(
    // @ts-ignore
    (todayDate - lastCheckinDay) / (1000 * 60 * 60 * 24),
  );

  return dayDifference;
};
