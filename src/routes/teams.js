const teams = require("express").Router();
const axios = require("axios");
const cache = require("../cache/cache");
const { CACHE_KEYS } = cache;

const fetchTeams = async () =>
  await axios.get("https://fantasy.premierleague.com/api/bootstrap-static/");
/**
 * List of elements
 */
teams.get("/", async (req, res) => {
  try {
    const teamsCache = cache.get(CACHE_KEYS.TEAMS);
    if (teamsCache) {
      res.send(teamsCache);
      return;
    } else {
      const { data } = await fetchTeams();
      cache.set(CACHE_KEYS.TEAMS, data["teams"]);
      res.send(data["teams"]);
    }
  } catch (error) {
    res.sendStatus(500);
    next(error);
  }
});

module.exports = teams;
module.exports.api = {
  fetchTeams,
};
