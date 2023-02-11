const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
module.exports = async (req, res) => {
  try {
    var fraId = req.params.id;

    var ext = '';
    if (fraId.indexOf('.txt') !== -1) {
      ext = '.txt';
      fraId = fraId.substring(0, fraId.indexOf(ext));
    }

    const fragment = await Fragment.byId(req.user, fraId);
    res.setHeader('Content-Type', fragment.type);
    const fragmentData = await fragment.getData();
    res.status(200).send(fragmentData);
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};
