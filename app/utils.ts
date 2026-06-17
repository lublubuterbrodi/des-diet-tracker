export const getRomaniaDate = () => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Bucharest",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
};
  
export const getFormattedRomaniaDate = () => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    day: "numeric",
    month: "long",
  }).format(new Date());
};