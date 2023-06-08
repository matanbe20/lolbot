const fetch = require('isomorphic-unfetch');
const { randomInteger } = require('./utils');

const fetchChampions = async () => {
  const version = await fetchLatestApiVersion();
  const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
  const result = await res.json();
  const champions = result.data;
  const keys = Object.keys(champions);
  const championsArray = keys.map((key) => ({
    name: champions[key].name,
    id: key,
  }));

  const randomChampIndex = randomInteger(0, championsArray.length - 1);
  return championsArray[randomChampIndex];
};

const fetchLatestApiVersion = async () => {
  try {
    const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await versionsResponse.json();
    return versions.at(0) || '';
  } catch (err) {
    return '13.1.1'; // fallback version
  }
}

module.exports = { fetchChampions };
