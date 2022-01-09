function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

findChampionIndex = (champion, inventory) => {
  for (let i = 0; i < inventory.length; i++) {
    if (inventory[i].name === champion) {
      return i;
    }
  }
  return -1;
}

function parseMillisecondsIntoReadableTime(milliseconds){
  //Get hours from milliseconds
  var hours = milliseconds / (1000*60*60);
  var absoluteHours = Math.floor(hours);
  var h = absoluteHours > 9 ? absoluteHours : absoluteHours;

  //Get remainder from hours and convert to minutes
  var minutes = (hours - absoluteHours) * 60;
  var absoluteMinutes = Math.floor(minutes);
  var m = absoluteMinutes > 9 ? absoluteMinutes : '0' +  absoluteMinutes;

  //Get remainder from minutes and convert to seconds
  var seconds = (minutes - absoluteMinutes) * 60;
  var absoluteSeconds = Math.floor(seconds);
  var s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;


  return '**'+ h + ' hours, ' + m + ' minutes & ' + s + ' seconds**';
}

module.exports = { randomInteger, parseMillisecondsIntoReadableTime };
