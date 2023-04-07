const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    logger.debug('getting fragments');
    res.status(200).json(
      createSuccessResponse({
        fragments: await Fragment.byUser(req.user, req.query.expand),
      })
    );
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};
