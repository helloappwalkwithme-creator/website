"use strict";

var http = require("../server/http");

module.exports = function (req, res) {
  return http.webhookPost(req, res, process.env);
};

module.exports.config = {
  api: { bodyParser: false }
};
