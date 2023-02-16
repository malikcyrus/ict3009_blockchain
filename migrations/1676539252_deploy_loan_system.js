const LoanSystem = artifacts.require('LoanSystem');

module.exports = function(_deployer) {
  _deployer.deploy(LoanSystem);
};
