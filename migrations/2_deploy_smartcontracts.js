const ownable = artifacts.require("ownable");
const hospital = artifacts.require("hospital");
const patient = artifacts.require("patient");

module.exports = function (deployer) {
  deployer.deploy(ownable);
  deployer.deploy(hospital);
  deployer.deploy(patient);
};
