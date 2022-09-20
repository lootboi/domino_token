const { expect } = require("chai");
const { ethers } = require("hardhat");
const { initSmartContracts, hasReason } = require("./contractFactory");

describe("Key", function() {
    beforeEach("Check Deployment", async function () {

        [ keyContract ] = await initSmartContracts();
        [owner, staker, addr1] = await ethers.getSigners();

    })
    it("Unpause mint as owner- Expect Success", async function () {
;       
        await keyContract.pauseMint(false);
        expect(paused).to.equal(false);

    })
})