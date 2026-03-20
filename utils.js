function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const findChampionIndex = (champion, inventory = []) => {
  for (let i = 0; i < inventory.length; i++) {
    if (inventory[i].name === champion) {
      return i;
    }
  }
  return -1;
};

function parseMillisecondsIntoReadableTime(milliseconds) {
  //Get hours from milliseconds
  const hours = milliseconds / (1000 * 60 * 60);
  const absoluteHours = Math.floor(hours);
  const h = absoluteHours > 9 ? absoluteHours : absoluteHours;

  //Get remainder from hours and convert to minutes
  const minutes = (hours - absoluteHours) * 60;
  const absoluteMinutes = Math.floor(minutes);
  const m = absoluteMinutes > 9 ? absoluteMinutes : "0" + absoluteMinutes;

  //Get remainder from minutes and convert to seconds
  const seconds = (minutes - absoluteMinutes) * 60;
  const absoluteSeconds = Math.floor(seconds);
  const s = absoluteSeconds > 9 ? absoluteSeconds : "0" + absoluteSeconds;

  return "**" + h + " hours, " + m + " minutes & " + s + " seconds**";
}

module.exports = { randomInteger, parseMillisecondsIntoReadableTime, findChampionIndex };
