"use strict";

var http = require("../server/http");

module.exports = function (req, res) {
  return http.kaufbar(req, res, process.env);
};
