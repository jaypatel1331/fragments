const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
var md = require('markdown-it')();

module.exports = async (req, res) => {
  try {
    // check for the required id with .txt extension and extract the id from the url
    var fraId = req.params.id;
    // if id contains extension then extract the Id
    if (fraId.includes('.')) {
      fraId = fraId.split('.').slice(0, -1).join('.');
    }

    // save the fragment data to the variable
    const fragment = await Fragment.byId(req.user, fraId);
    const fragmentData = await fragment.getData();

    // if the fragment is html then convert it to markdown
    if (req.params.id.includes('.html') && fragment.type === 'text/markdown') {
      res.setHeader('Content-Type', 'text/html');
      logger.debug('sending html data to after converting from markdown');
      res.status(200).send(md.render(fragmentData.toString()));
    } else {
      res.setHeader('Content-Type', fragment.type);
      res.status(200).send(fragmentData);
    }
  } catch (error) {
    logger.warn({ error }, 'error sending fragment data to user');
    res.status(404).json(createErrorResponse(404, error));
  }
};
