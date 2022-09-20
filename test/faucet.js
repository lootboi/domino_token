const { expect } = require("chai");
const { ethers } = require("hardhat");
const { initSmartContracts, hasReason } = require("./contractFactory");

describe("Faucet", function() {
    beforeEach("Check Deployment", async function () {

        [ domino, faucet ] = await initSmartContracts();
        [ owner, staker, addr1 ] = await ethers.getSigners();

    })
    it("Check initial variables - Expect Success", async function () {

        const wait = await faucet.waitTime();

        expect(await faucet.dripAmount()).to.equal(ethers.utils.parseEther("1000"));
        expect((wait).toNumber()).to.equal(1800);
        expect(await faucet.remainingDomino()).to.equal(0);

    })
    it("Fund Faucet - Expect success", async function () {

        await domino.addMintingCaller(owner.address);
        await domino.mint(faucet.address, 8000000);

        expect(await domino.balanceOf(faucet.address)).to.equal(ethers.utils.parseEther("8000000"));

    })
    it("Ensure that remainingTokens accurately reflects remaining amount - Expect Success", async function () {

        await domino.addMintingCaller(owner.address);
        await domino.mint(faucet.address, 8000000);
        await domino.mint(staker.address, 1000000);
        await domino.connect(staker).stake();
        await faucet.requestDomino();

        expect(await faucet.remainingDomino()).to.equal(ethers.utils.parseEther("7999000"));
        expect(await domino.balanceOf(faucet.address)).to.equal(ethers.utils.parseEther("7999000"));
        expect(await domino.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("9"));
        
    })
    it("Attempt to use faucet before cooldown period is over - Expect Failure", async function () {

        await domino.addMintingCaller(owner.address);
        await domino.mint(faucet.address, 8000000);
        await domino.mint(staker.address, 1000000);
        await domino.connect(staker).stake();
        await faucet.requestDomino();

        try {
            await faucet.requestDomino();
        }
        catch (err) {
            error = err;
        }
        expect(hasReason(error, "Facuet: You have to wait 30 minutes before requesting again")).to.equal(true);

    })
    it("Attempt to use faucet after cooldown period is over - Expect Success", async function () {

        await domino.addMintingCaller(owner.address);
        await domino.mint(faucet.address, 8000000);
        await domino.mint(staker.address, 1000000);
        await domino.connect(staker).stake();
        await faucet.connect(addr1).requestDomino();
        await ethers.provider.send("evm_increaseTime", [1800]);
        await ethers.provider.send("evm_mine");

        await faucet.connect(addr1).requestDomino();

        // 10% of each transfer is sent to the staking address
        expect(await domino.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("18"));
        // console.log("addr1 Balance : " + await domino.balanceOf(addr1.address));
        // expect(await domino.balanceOf(faucet.address)).to.equal(ethers.utils.parseEther("7999820"));

    })
    it("Attempt to change cooldown period as owner - Expect Success", async function () {

        await faucet.updateWaitTime(600);

        expect(await faucet.waitTime()).to.equal(600);

    })
    it("Attempt to change cooldown period as non-owner - Expect Failure", async function () {
            
        try {
            await faucet.connect(addr1).updateWaitTime(600);
        }
        catch (err) {
            error = err;
        }
        expect(hasReason(error, "Ownable: caller is not the owner")).to.equal(true);
    
    })
    it("Attempt to change drip amount as owner - Expect Success", async function () {

        await faucet.updateDripAmount(ethers.utils.parseEther("2000"));

        expect(await faucet.dripAmount()).to.equal(ethers.utils.parseEther("2000"));

    })
    it("Attempt to change drip amount as non-owner - Expect Failure", async function () {
                
        try {
            await faucet.connect(addr1).updateDripAmount(ethers.utils.parseEther("2000"));
        }
        catch (err) {
            error = err;
        }
        expect(hasReason(error, "Ownable: caller is not the owner")).to.equal(true);
        
    })
    it("Check that getRemainingDomino returns an accurate value - Expect Success", async function () {

        expect(await faucet.getRemainingDomino()).to.equal(0);

        await domino.addMintingCaller(owner.address);
        await domino.mint(faucet.address, 8000000);
        await domino.mint(staker.address, 1000000);
        await domino.connect(staker).stake();
        await faucet.requestDomino();

        expect(await faucet.getRemainingDomino()).to.equal(ethers.utils.parseEther("7999000"));

    })

})