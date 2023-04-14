const response = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
module.exports = async (req, res) => {
  try {
    // create new fragment
    logger.debug('body of the user fragment', req.user);

    const fragment = new Fragment({
      ownerId: req.user,
      type: req.get('content-type'),
    });

    // save the new fragment data to the database
    logger.info('saving the fragment data to the database');
    await fragment.save();
    logger.info('setting the fragment data');
    await fragment.setData(req.body);
    logger.info('posting the fragment data to the database');
    res.setHeader('Content-type', fragment.type);
    res.setHeader('Location', `${req.protocol}://${req.get('host')}/v1/fragments/${fragment.id}`);
    res.status(201).json(
      response.createSuccessResponse({
        status: 'ok',
        fragment: fragment,
      })
    );
  } catch (err) {
    res.status(415).json(response.createErrorResponse(415, err));
  }
};
