"use strict";
const errorHandler = (err, _req, res, _next) => {
  console.log(err);

  res.status(err.code || 500).json({
    message: err.message || "internal server error",
  });
};

module.exports = errorHandler;
