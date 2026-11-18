function canTestToday(activityDates: readonly Date[], today = new Date()): boolean {
  const todayKey = today.toDateString();
  return !activityDates.some((activityDate) => activityDate.toDateString() === todayKey);
}

export { canTestToday };
