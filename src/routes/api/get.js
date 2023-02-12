/**
 * Get a list of fragments for the current user
 */
const logger = require('../../logger');
const { createSuccessResponse } = require('../../response');

module.exports = (req, res) => {
  // TODO: this is just a placeholder to get something working...
  if (res) {
    logger.debug('getting fragments');
    res.status(200).json(
      createSuccessResponse({
        fragments: [],
      })
    );
  }
};
