export function getActivityColorIndex(activityId = "") {
  const hash = String(activityId)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return hash % 6;
}
