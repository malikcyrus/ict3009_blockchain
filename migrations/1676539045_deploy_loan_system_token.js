const LoanSystemWithTokens = artifacts.require('LoanSystemWithTokens');

module.exports = function(_deployer) {
  _deployer.deploy(LoanSystemWithTokens);
};
