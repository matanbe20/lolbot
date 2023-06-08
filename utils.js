var fs = require("fs");
var util = require("util");
var log_file = fs.createWriteStream(__dirname + "/debug.log", { flags: "w" });
var log_stdout = process.stdout;

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
  var hours = milliseconds / (1000 * 60 * 60);
  var absoluteHours = Math.floor(hours);
  var h = absoluteHours > 9 ? absoluteHours : absoluteHours;

  //Get remainder from hours and convert to minutes
  var minutes = (hours - absoluteHours) * 60;
  var absoluteMinutes = Math.floor(minutes);
  var m = absoluteMinutes > 9 ? absoluteMinutes : "0" + absoluteMinutes;

  //Get remainder from minutes and convert to seconds
  var seconds = (minutes - absoluteMinutes) * 60;
  var absoluteSeconds = Math.floor(seconds);
  var s = absoluteSeconds > 9 ? absoluteSeconds : "0" + absoluteSeconds;

  return "**" + h + " hours, " + m + " minutes & " + s + " seconds**";
}

function getTime() {
  var currentdate = new Date();
  var datetime =
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

module.exports = { randomInteger, findChampionIndex, parseMillisecondsIntoReadableTime };
