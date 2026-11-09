"use strict";

var http = require("../server/http");

module.exports = function (req, res) {
  return http.checkoutPost(req, res, process.env);
};
