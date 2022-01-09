const fetch = require('isomorphic-unfetch');
const { randomInteger } = require('./utils');

const fetchChampions = async () => {
  const res = await fetch(
    "http://ddragon.leagueoflegends.com/cdn/12.1.1/data/en_US/champion.json"
  );
  const result = await res.json();
  const champions = result.data;
  const keys = Object.keys(champions);
  const championsArray = keys.map((key) => {
    return {
      name: champions[key].name,
      id: key,
    };
  });

  const randomChampIndex = randomInteger(0, championsArray.length - 1);
  console.log(championsArray[randomChampIndex].name);
  return championsArray[randomChampIndex].name;
};

module.exports = { fetchChampions };
