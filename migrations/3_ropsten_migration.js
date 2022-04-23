const Bihu = artifacts.require("Bihu");
module.exports = function(deployer, network, accounts) {
 deployer.deploy(Bihu,{from: accounts[0]});
};
