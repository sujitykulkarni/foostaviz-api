const fixtures = require("express").Router();
const axios = require("axios");
const cache = require("../cache/cache");
const {
  api: { fetchTeams },
} = require("./teams");
const { CACHE_KEYS } = cache;

const fetchFixtures = async () =>
  await axios.get("https://fantasy.premierleague.com/api/fixtures/");

/**
 * Fixture correlation by difficulty to score
 */
fixtures.get("/correlation/difficulty/score", async (req, res, next) => {
  try {
    const { data } = await fetchFixtures();
    let teamsData = cache.get(CACHE_KEYS.TEAMS);
    if (!teamsData) {
      teamsData = await fetchTeams();
      cache.set(CACHE_KEYS.TEAMS, data["teams"]);
    }
    const difficulty = data
      .filter(({ finished }) => finished)
      .map((fixture) => {
        const team = teamsData.find((team) => team.code === fixture.team_h);
        return {
          short_name: team.short_name,
          code: team.code,
          event: fixture.event,
          id: fixture.id,
          team_h_difficulty: fixture.team_h_difficulty,
          team_a_difficulty: fixture.team_a_difficulty,
          team_a_score: fixture.team_a_score,
          team_h_score: fixture.team_h_score,
        };
      });
    res.send(difficulty);
  } catch (error) {
    res.sendStatus(500);
    next(error);
  }
});

/**
 * Fixture details
 */
fixtures.get("/gameweeks", async (req, res, next) => {
  try {
    const eventsCache = cache.get(CACHE_KEYS.EVENTS);
    if (eventsCache) {
      res.send(eventsCache);
    } else {
      const { data } = await axios.get(
        "https://fantasy.premierleague.com/api/bootstrap-static/"
      );
      cache.set(CACHE_KEYS.EVENTS, data["events"]);
      res.send(data["events"]);
    }
  } catch (error) {
    res.sendStatus(500);
    next(error);
  }
});

/**
 * Single Fixture details
 */
fixtures.get("/:fixtureId", async (req, res, next) => {
  try {
    const { fixtureId } = req.params;
    const { data } = await axios.get(
      "https://fantasy.premierleague.com/api/fixtures/",
      {
        param: { event: fixtureId },
      }
    );
    res.send(data);
  } catch (error) {
    res.sendStatus(500);
    next(error);
  }
});

/**
 * Single Fixture details
 */
fixtures.get("/", async (req, res, next) => {
  try {
    const { data } = await fetchFixtures();
    res.send(data);
  } catch (error) {
    res.sendStatus(500);
    next(error);
  }
});

module.exports = fixtures;
