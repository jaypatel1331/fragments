const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.info('checking content type');
    if (fragment.type === req.get('Content-Type')) {
      logger.info('setting data for fragment');
      await fragment.setData(req.body);
      res.status(200).json(
        createSuccessResponse({
          status: 'ok',
          fragment: fragment,
        })
      );
    } else {
      res
        .status(400)
        .json(createErrorResponse(400, "unable to set data, content type doesn't match"));
    }
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};
