const elementSummary = require("express").Router();
const axios = require("axios");
const reduce = require("lodash/reduce");
const partition = require("lodash/partition");
const cache = require("../cache/cache");

/**
 * Compute statistics with home and away distinction
 * @param {*} historyData A player's history data
 * @returns Array of objects defining statistics for a given
 * criteria based on home and away values
 */
const makeHistoryStats = (historyData) => {
  const getTotal = (data, key) =>
    reduce(
      data.map((item) => item[key]),
      (sum, n) => sum + n,
      0
    );
  const [home, away] = partition(historyData, "was_home");
  return [
    "total_points",
    "minutes",
    "goals_scored",
    "assists",
    "clean_sheets",
    "goals_conceded",
    "transfers_in",
    "transfers_out",
  ]
    .map((key) => ({
      stat_key: key,
      home: getTotal(home, key),
      away: getTotal(away, key),
    }))
    .concat({
      stat_key: "matches",
      home: home.length,
      away: away.length,
    });
};

/**
 * Retrieve team strength
 * @param {*} code team code
 * @returns {number} Promise that resolves with the team's strength value
 */
const getTeamStrength = (code) => {
  return new Promise(async (resolve, reject) => {
    try {
      let strength = null;
      const teamsCache = cache.get("teams");
      if (teamsCache) {
        const team = teamsCache.find((item) => item.id === code);
        if (team) {
          strength = team.strength;
        }
      } else {
        const {
          data: { teams },
        } = await axios.get(
          "https://fantasy.premierleague.com/api/bootstrap-static/"
        );
        cache.set("teams", teams);
        const team = teams.find((item) => item.id === code);
        if (team) {
          strength = team.strength;
        }
      }
      resolve(strength);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Compute player's points with respect to the opponent team strength
 * @param {*} history A player's history data
 * @returns Array of player's points with respect to the opponent team strength
 */
const makeStatsByOppnStrength = async (history) => {
  return await Promise.all(
    history.map(
      async ({
        opponent_team,
        total_points,
        minutes,
        selected,
        transfers_in,
        transfers_out,
      }) => ({
        opponent_team,
        total_points,
        minutes,
        selected,
        transfers_in,
        transfers_out,
        opponent_strength: await getTeamStrength(opponent_team),
      })
    )
  );
};

/**
 * List of elements
 */
elementSummary.get("/:elementId", async (req, res, next) => {
  try {
    const { elementId } = req.params;
    const { data } = await axios.get(
      `https://fantasy.premierleague.com/api/element-summary/${elementId}/`
    );
    const { history } = data;
    const home_vs_away = makeHistoryStats(history);
    const opponent_strength_stats = await makeStatsByOppnStrength(history);
    res.send({ ...data, stats: { home_vs_away, opponent_strength_stats } });
  } catch (error) {
    res.sendStatus(500);
    next(error);
  }
});

module.exports = elementSummary;
