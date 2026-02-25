const { getAccumulatorState } = require("../services/revocationStore");

function getRevocationState(req, res) {
    res.json(getAccumulatorState());
}

module.exports = { getRevocationState };