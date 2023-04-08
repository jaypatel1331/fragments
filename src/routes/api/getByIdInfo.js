const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.info('got the fragment using id');
    res.status(200).json(
      createSuccessResponse({
        status: 'ok',
        fragments: fragment,
      })
    );
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};
