const startDateTime = new Date("2023-11-20T11:00:00+05:30");
const endDateTime = new Date(startDateTime.getTime() + 15 * 60000);

console.log("Start:", startDateTime.toISOString());
console.log("End:", endDateTime.toISOString());
