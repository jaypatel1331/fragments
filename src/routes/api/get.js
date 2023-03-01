const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  if (res) {
    logger.debug('getting fragments');
    res.status(200).json(
      createSuccessResponse({
        fragments: await Fragment.byUser(req.user, req.query.expand),
      })
    );
  }
};
