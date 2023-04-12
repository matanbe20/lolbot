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

const getUserData = async (userName, usersList = {}) => {
  if (usersList && usersList[userName]) {
    return usersList[userName];
  } else {
    const usersEnhanced = {
      ...usersList,
      [userName]: {
        inventory: [],
      },
    };
    await setData(USERS_LIST, usersEnhanced);
    return usersEnhanced[userName];
  }
};

const fetchChampion = async (userName, avatar) => {
  try{
    const usersList = JSON.parse(await getAsync(USERS_LIST)) || {};
  const userData = (await getUserData(userName, usersList)) || {};
  if (
    userData &&
    new Date(userData.lastRequestDate).getTime() > Date.now() - WAIT_TIME
  ) {
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
  let { name, id } = await fetchChampions();
  const championName = name.replace(/\s/g, "");
  let championIndex = findChampionIndex(championName, userData.inventory);
  if (championIndex === -1) {
    userData.inventory.push({
      name: championName,
      id,
      level: 1,
    });
  } else {
    userData.inventory[championIndex].level += 1;
  }
  userData.lastRequestDate = new Date();
  userData.avatarUrl = avatar;
  await setData(USERS_LIST, {
    ...usersList,
    [userName]: userData,
  });
  return {
    isAllowed: true,
    name,
    id,
    level: championIndex === -1 ? 1 : userData.inventory[championIndex].level,
  };
  }catch(e){
    console.error("Error while fetchChampion", JSON.stringify(e))
  }
};

const setData = async (key, data) => {
  redisClient.set(key, JSON.stringify(data));
};

const getInventory = async (userName) => {
  try{
    const usersList = JSON.parse(await getAsync(USERS_LIST)) || [];
  const userData = await getUserData(userName, usersList);
  const inventory = userData.inventory;
  return inventory
    .map((item) => `**${item.name}** Lv. ${item.level}`)
    .join("\n");
  }catch(e) {
    console.error("Error while getInventory", JSON.stringify(e))
  }
};

module.exports = {
  fetchChampion,
  getInventory,
};
