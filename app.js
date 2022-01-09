const redis = require("redis");
const redisClient = redis.createClient({
  port: 11411,
  host: "redis-11411.c267.us-east-1-4.ec2.cloud.redislabs.com",
  password: process.env.db_pass,
});
const { promisify } = require("util");
const { fetchChampions } = require("./repository");
const { parseMillisecondsIntoReadableTime } = require("./utils");
const getAsync = promisify(redisClient.get).bind(redisClient);
const USERS_LIST = "users";
const WAIT_TIME = 1000 * 60 * 60 * 3;

const getUserData = async (userName, usersList = []) => {
  if (usersList && usersList[userName]) {
    return usersList[userName];
  } else {
    await setData(USERS_LIST, {
      ...usersList,
      [userName]: {
        inventory: [],
      },
    });
  }
  return usersList[userName];
};

const fetchChampion = async (userName) => {
  const usersList = JSON.parse(await getAsync(USERS_LIST)) || [];
  const userData = await getUserData(userName, usersList);
  if (new Date(userData.lastRequestDate).getTime() > Date.now() - WAIT_TIME) {
    return {
      isAllowed: false,
      reason:
        `Sorry **${userName}**, you have to wait ` +
        parseMillisecondsIntoReadableTime(
          WAIT_TIME -
            Math.abs(new Date(userData.lastRequestDate).getTime() - Date.now())
        ) +
        " before requesting a new champion",
    };
  }
  let champion = await fetchChampions();
  champion = champion.replace(/\s/g, "");
  let championIndex = findChampionIndex(champion, userData.inventory);
  if (championIndex === -1) {
    userData.inventory.push({
      name: champion,
      level: 1,
    });
  } else {
    userData.inventory[championIndex].level += 1;
  }
  userData.lastRequestDate = new Date();
  await setData(USERS_LIST, {
    ...usersList,
    [userName]: userData,
  });
  return {
    isAllowed: true,
    champion,
    level: championIndex === -1 ? 1 : userData.inventory[championIndex].level,
  };
};

const setData = async (key, data) => {
  redisClient.set(key, JSON.stringify(data));
};

const getInventory = async (userName) => {
  const usersList = JSON.parse(await getAsync(USERS_LIST)) || [];
  const userData = await getUserData(userName, usersList);
  const inventory = userData.inventory;
  return inventory
    .map((item) => `**${item.name}** Lv. ${item.level}`)
    .join("\n");
};

module.exports = {
  fetchChampion,
  getInventory,
};
