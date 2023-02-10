const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
module.exports = async (req, res) => {
  try {
    console.log('req.body', req.user);
    const fragment = await Fragment.byId(req.user, req.params.id);
    res.setHeader('Content-Type', fragment.type);
    const fragmentData = await fragment.getData();
    res.status(200).send(fragmentData);
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};
