var hasReason = (error, text) => {
    return error.toString().indexOf(text) > -1;
  }

var initSmartContracts = async () => {

    const mintAmount = ethers.utils.parseEther("8000000")

    let contractFactory = await hre.ethers.getContractFactory("DominoToken");
    const domino = await contractFactory.deploy();
    await domino.deployed()
    // console.log("Domino Contract Deployed at: " + domino.address); 

    contractFactory = await hre.ethers.getContractFactory("DominoFaucet");
    const faucet = await contractFactory.deploy(domino.address);
    await faucet.deployed();

    contractFactory = await hre.ethers.getContractFactory("theKey");
    const keyContract = await contractFactory.deploy();
    await faucet.deployed();

    return [ domino, faucet, keyContract ];
}

module.exports = {
    initSmartContracts,
    hasReason
}

