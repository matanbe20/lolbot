const fs = require("fs");
const util = require("util");
const log_file = fs.createWriteStream(__dirname + "/debug.log", { flags: "w" });
const log_stdout = process.stdout;

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

findChampionIndex = (champion, inventory = []) => {
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

function getTime() {
  const currentdate = new Date();
  const datetime =
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " @ " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds();

  return datetime;
}

console.log = function (d) {
  log_file.write(getTime() + " - " + util.format(d) + "\n");
  log_stdout.write(getTime() + " - " + util.format(d) + "\n");
};

module.exports = { randomInteger, parseMillisecondsIntoReadableTime };
