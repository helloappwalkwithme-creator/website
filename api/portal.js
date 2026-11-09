"use strict";

var http = require("../server/http");

module.exports = function (req, res) {
  return http.portalPost(req, res, process.env);
};
