const elements = require("express").Router();
const axios = require("axios");
const cache = require("../cache/cache");
const elementSummaryRouter = require("./elementSummary");
/**
 * List of elements
 */
elements.get("/", async (req, res, next) => {
  try {
    const { data } = await axios.get(
      "https://fantasy.premierleague.com/api/bootstrap-static/"
    );
    cache.set("teams", data["teams"]);
    cache.set("events", data["events"]);
    res.send(data["elements"]);
  } catch (error) {
    res.sendStatus(500);
    next(error);
  }
});

elements.use("/summary", elementSummaryRouter);

module.exports = elements;
