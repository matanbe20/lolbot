const redis = require("redis");
const redisClient = redis.createClient({
  port: 11411,
  host: "redis-11411.c267.us-east-1-4.ec2.cloud.redislabs.com",
  password: process.env.db_pass,
});
const { promisify } = require("util");
const { fetchChampions, fetchChampionDetails } = require("./repository");
const { parseMillisecondsIntoReadableTime, randomInteger } = require("./utils");
const getAsync = promisify(redisClient.get).bind(redisClient);
const USERS_LIST = "users";
const HOURS = 0.1;
const WAIT_TIME = 1000 * 60 * 60 * HOURS;

const getUserData = async (user, usersList = {}) => {
  if (usersList && usersList[user.id]) {
    return usersList[user.id];
  } else {
    const usersEnhanced = {
      ...usersList,
      [user.id]: {
        inventory: [],
      },
    };
    await setData(USERS_LIST, usersEnhanced);
    return usersEnhanced[user.id];
  }
};

const fetchChampion = async (user, avatar) => {
  try{
    const usersList = JSON.parse(await getAsync(USERS_LIST)) || {};
  const userData = (await getUserData(user, usersList)) || {};
  if (
    userData && userData.lastRequestDate &&
    new Date(userData.lastRequestDate).getTime() > Date.now() - WAIT_TIME
  ) {
    return {
      isAllowed: false,
      reason:
        `Sorry **${user.username}**, you have to wait ` +
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

  let skins = [];
  try {
    skins = await fetchChampionDetails(id);
  } catch (error) {
    console.error("Failed to fetch champion skins:", error);
  }

  let selectedSkin = { name: "Default", num: 0 }; // Default skin

  if (skins && skins.length > 0) {
    const randomSkinIndex = randomInteger(0, skins.length - 1);
    selectedSkin = skins[randomSkinIndex];
  }

  if (championIndex === -1) {
    userData.inventory.push({
      name: championName,
      id,
      level: 1,
      skins: [{ name: selectedSkin.name, num: selectedSkin.num }], // New structure
    });
  } else {
    userData.inventory[championIndex].level += 1;
    // Initialize skins array if it doesn't exist (for backward compatibility)
    if (!Array.isArray(userData.inventory[championIndex].skins)) {
      userData.inventory[championIndex].skins = [];
    }
    // Check if the selected skin already exists
    const skinExists = userData.inventory[championIndex].skins.some(skin => skin.num === selectedSkin.num);
    if (!skinExists) {
      userData.inventory[championIndex].skins.push({ name: selectedSkin.name, num: selectedSkin.num });
    }
    // Remove old .skin property if it exists (optional cleanup, good for consistency)
    if (userData.inventory[championIndex].hasOwnProperty('skin')) {
      delete userData.inventory[championIndex].skin;
    }
  }
  userData.lastRequestDate = new Date();
  userData.avatarUrl = avatar;
  userData.username = user.username;
  await setData(USERS_LIST, {
    ...usersList,
    [user.id]: userData,
  });
  return {
    isAllowed: true,
    name,
    id,
    level: championIndex === -1 ? 1 : userData.inventory[championIndex].level,
    skinName: selectedSkin.name,
    skinNum: selectedSkin.num,
  };
  }catch(e){
    console.error("Error while fetchChampion", JSON.stringify(e))
  }
};

const setData = async (key, data) => {
  redisClient.set(key, JSON.stringify(data));
};

const getInventory = async (user) => {
  try{
    const usersList = JSON.parse(await getAsync(USERS_LIST)) || [];
  const userData = await getUserData(user, usersList);
  const inventory = userData.inventory;
  return inventory
    .map((item) => {
      const skinCount = (Array.isArray(item.skins) ? item.skins.length : 0);
      return `**${item.name}** Lv. ${item.level} (${skinCount} skins)`;
    })
    .join("\n");
  }catch(e) {
    console.error("Error while getInventory", JSON.stringify(e))
  }
};

module.exports = {
  fetchChampion,
  getInventory,
};
