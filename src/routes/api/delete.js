// src/routes/api/getById.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    var id = req.params.id;
    await Fragment.delete(req.user, id);
    logger.info(`deleted fragment with id: ${id}`);
    res.status(200).json(createSuccessResponse(200));
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};
