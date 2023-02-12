const response = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
require('dotenv').config();
const url = process.env.API_URL;
module.exports = async (req, res) => {
  try {
    // post the fragment data to the variable
    logger.debug('body of the user fragment', req.user);

    const fragment = new Fragment({
      ownerId: req.user,
      type: req.get('content-type'),
    });

    // save the fragment data to the database
    await fragment.save();
    await fragment.setData(req.body);
    res.setHeader('Content-type', fragment.type);
    res.setHeader('Location', url + '/v1/fragments/' + fragment.id);
    res.status(201).json(
      response.createSuccessResponse({
        status: 'ok',
        fragment: [fragment],
      })
    );
  } catch (err) {
    logger.warn({ err }, 'unable to send the fragment data to the database');
    res.status(415).json(response.createErrorResponse(415, err));
  }
};
