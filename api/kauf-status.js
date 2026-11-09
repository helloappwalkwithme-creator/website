"use strict";

var http = require("../server/http");

module.exports = function (req, res) {
  return http.statusGet(req, res, process.env);
};
