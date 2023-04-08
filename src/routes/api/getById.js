// src/routes/api/getById.js
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const mime = require('mime-types');
const logger = require('../../logger');
const path = require('path');

module.exports = async (req, res) => {
  var id = req.params.id;
  var extension = mime.lookup(id);

  if (req.params.id.includes('.')) {
    id = path.parse(req.params.id).name;
  }
  try {
    logger.info('getting the fragment using id');
    const fragment = await Fragment.byId(req.user, id);
    logger.info('getting fragment data from database');
    var fragmentData = await fragment.getData();
    var type;
    try {
      if (fragment.formats.includes(extension)) {
        logger.info(extension);
        type = extension;
      } else if (extension == false) {
        logger.info('fragment without extension');
        type = fragment.mimeType;
      }

      logger.info('converting data');
      var data = fragment.convertData(fragmentData, type);
      res.setHeader('Content-type', type);

      logger.info('sending data');
      res.status(200).send(data);
    } catch (error) {
      res.status(415).json(createErrorResponse(415, 'unable to convert data'));
    }
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};
