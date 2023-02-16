const LoanToken = artifacts.require('LoanToken')

module.exports = function(_deployer) {
  _deployer.deploy(LoanToken, 999999);
};
