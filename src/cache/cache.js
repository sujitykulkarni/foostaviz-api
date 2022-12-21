const NodeCache = require("node-cache");
module.exports = new NodeCache();

const CACHE_KEYS = {
  TEAMS: "teams",
  EVENTS: "events",
};
module.exports.CACHE_KEYS = CACHE_KEYS;
