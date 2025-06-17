const fetch = require('isomorphic-unfetch');
const { randomInteger } = require('./utils');


const fetchLatestApiVersion = async () => {
  const fallbackVersion = '13.1.1'
  try {
    const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await versionsResponse.json();
    return versions.at(0) || fallbackVersion;
  } catch (err) {
    return fallbackVersion; // fallback version
  }
}

const fetchChampions = async () => {
  //TODO: add last version check before ---- https://ddragon.leagueoflegends.com/api/versions.json
  const api_version = await fetchLatestApiVersion();
  const res = await fetch(
    `http://ddragon.leagueoflegends.com/cdn/${api_version}/data/en_US/champion.json`
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
  return championsArray[randomChampIndex];
};

const fetchChampionDetails = async (championId) => {
  const api_version = await fetchLatestApiVersion();
  const res = await fetch(
    `http://ddragon.leagueoflegends.com/cdn/${api_version}/data/en_US/champion/${championId}.json`
  );
  const result = await res.json();
  const championDetails = result.data[championId];
  return championDetails.skins;
};

module.exports = { fetchChampions, fetchChampionDetails };
