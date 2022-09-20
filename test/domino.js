const { expect } = require("chai");
const { ethers } = require("hardhat");
const { initSmartContracts, hasReason } = require("./contractFactory");

describe("Domino", function() {
    beforeEach("Check Deployment", async function () {

        [ domino ] = await initSmartContracts();
        [owner, staker, addr1] = await ethers.getSigners();

    })
    it("Check initial values", async function () {

        const stakers = await domino.stakers(0);
        expect(stakers).to.equal('0x000000000000000000000000000000000000dEaD');
        expect(await domino.index()).to.equal(1);
        expect(await domino.stakerCount()).to.equal(0);
        expect(await domino.maxStakers()).to.equal(100);
        expect(await domino.cooldown()).to.equal(86400);

    })
    it("Check ownership functionality", async function () {

        // Check that the initial owner is the deployment address
        const dominoOwner = await domino.owner();
        expect(dominoOwner).to.equal(owner.address);

        // Expect that non-owners cannot transferOwnership
        try {
            await domino.connect(addr1).transferOwnership(staker.address);
        }
        catch(e) {
            error = e;
        }
        expect(hasReason(error, "Ownable, Caller is not the owner"));

        // Transfer ownership and verify said ownership
        await domino.transferOwnership(addr1.address);
        expect(await domino.owner()).to.equal(addr1.address);

    })
    it("Mint total max suppply - Expect Success", async function () {

        // As the owner of the contract, we must give our address minting permission
        await domino.addMintingCaller(owner.address);

        // Mint 9,999,999 tokens
        await domino.mint(owner.address, 10000000);
        expect(await domino.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("10000000"));
        expect(await domino.totalSupply()).to.equal(ethers.utils.parseEther("10000000"));

    })
    it("Mint through the mintBatch() function - Expect success", async function () {
    
        const mintAmount = ethers.utils.parseEther("1000000");

        await domino.addMintingCaller(owner.address);
        await domino.mintBatch([owner.address, staker.address, addr1.address], [mintAmount, mintAmount, mintAmount]);
        expect(await domino.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1000000"));
        expect(await domino.balanceOf(staker.address)).to.equal(ethers.utils.parseEther("1000000"));
        expect(await domino.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("1000000"));
    
    })
    it("Attempt to mint without Mint permission - Expect Fail", async function () {

        // Attempt to mint without permission - Expect fail
        try {
            await domino.connect(addr1).mint(addr1.address, 1);
        }
        catch(ex) {
            error = ex;
        }
        expect(hasReason(error, "MintAccess: caller is not approved"));

    })
    it("Attempt to add Minter as Owner - Expect Success", async function () {

        // Attempt to mint without permission - Expect fail
        try {
            await domino.mint(addr1.address, 1);
        }
        catch(ex) {
            error = ex;
        }
        expect(hasReason(error, "MintAccess: caller is not approved"));

        // Add the owner as a minter
        await domino.addMintingCaller(owner.address);
        await domino.mint(addr1.address, 1);
        expect(await domino.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("1"));
        
    
    })
    it("Attempt to mint more than max supply - Exepct Fail", async function () {

        //Attempt to mint over the MAX_CAP - Expect fail
        try {
            await domino.mint(owner.address, 10000000);
            await domino.mint(owner.address, 1);
        }
        catch(e) {
            error = e
        }
        expect(hasReason(error, "Max number of tokens minted"));

    })
    it("Attempt to stake while already staked - Expect Fail", async function () {

        // Add minting permission to owner
        await domino.addMintingCaller(owner.address);
        // Mint 1M Domino to the staker
        await domino.mint(staker.address, 1000000);
        // Stake 1M Domino as the staker
        await domino.connect(staker).stake();

        // Attempt to stake 1M Domino as the staker again - Expect fail
        try {
            await domino.connect(staker).stake();
        }
        catch(e) {
            error = e;
        }
        expect(hasReason(error, "You are already staking"));

    })
    it("Attempt to transfer Domino while staked - Expect Fail", async function () {

        await domino.addMintingCaller(owner.address);
        await domino.mint(staker.address, 1000000);
        await domino.connect(staker).stake();

        // Attempt to transfer 1M Domino as the the staker while staked - Expect fail
        try {
            await domino.connect(staker).transfer(owner.address, ethers.utils.parseEther("1000000"));
        }
        catch(ex) {
            error = ex;
        }
        expect(hasReason(error, "You can't transfer while staking!"));

    })
    it("Attempt to stake without having enough Domino - Expect Fail", async function () {

        // Attempt to stake without having enough Domino - Expect fail
        try {
            await domino.connect(addr1).stake();
        }
        catch(e) {
            error = e;
        }
        expect(hasReason(error, "You don't have enough tokens to stake"));

    })
    it("Attempt to unstake while the user is not currently staked - Expect Fail", async function () {

        await domino.addMintingCaller(owner.address);
        await domino.mint(staker.address, 1000000);
        await domino.connect(staker).stake();
        // Unstake as the staker
        await domino.connect(staker).unStake();

        // Attempt to unstake as the staker again - Expect fail
        try {
            await domino.connect(staker).unStake();
        }
        catch(e) {
            error = e;
        }
        expect(hasReason(error, "You aren't staking!"));

    })
    it("Attempt to unstake before the cooldown period has ended - Expect Fail", async function () {

        await domino.addMintingCaller(owner.address);
        await domino.mint(staker.address, 1000000);
        await domino.connect(staker).stake();
        await domino.connect(staker).unStake();

        // Attempt to stake as the staker before the cooldown has ended - Expect fail
        try {
            await domino.connect(staker).stake();
        }
        catch(e) {
            error = e;
        }
        expect(hasReason(error, "You are cooling down!"));

    })
    it("Attempt to stake again after the cooldown period has ended - Expect Success", async function () {

        await domino.addMintingCaller(owner.address);
        await domino.mint(staker.address, 1000000);
        await domino.connect(staker).stake();
        await domino.connect(staker).unStake();

        // Falsify time passing so that the cooldown period has ended
        await ethers.provider.send("evm_increaseTime", [86400]);
        await ethers.provider.send("evm_mine");
        await domino.connect(staker).stake();

        // Try to stake while already staked to verify that the cooldown has ended - Expect fail
        try {
            await domino.connect(staker).stake();
        }
        catch(e) {
            error = e;
        }
        expect(hasReason(error, "You are already staking"));

    })
    it("Attempt to call changeMaxStakers() as a non-owner - Expect Fail", async function () {

        try {
            await domino.connect(addr1).changeMaxStakers(200);
        }
        catch(e) {
            error = e;
        }
        expect(hasReason(error, "Ownable, Caller is not the owner"));

    })
    it("Attempt to call changeMaxStakers() as the owner - Expect Success", async function () {

        // Change maxStakers to 200 as the contract owner
        await domino.changeMaxStakers(200);
        expect(await domino.maxStakers()).to.equal(200);

    })
    it("Attempt to change cooldown without ownership - Expect Fail", async function () {
    
        try {
            await domino.connect(addr1).changeCooldown(86400);
        }
        catch(e) {
            error = e;
        }
        expect(hasReason(error, "Ownable, Caller is not the owner"));
    
    })
    it("Attempt to change cooldown with ownership - Expect Success", async function () {
        
        expect(await domino.cooldown()).to.equal(86400);
        await domino.changeCooldown(100);
        expect(await domino.cooldown()).to.equal(100);
        
    })
    it("Attempt to change Taxed Amount without ownership - Expect Fail", async function () {
    
        expect(await domino.taxed()).to.equal(90);
        try {
            await domino.connect(addr1).changeTaxedAmount(80);
        }
        catch(e) {
            error = e;
        }
        expect(hasReason(error, "Ownable, Caller is not the owner"));
        expect(await domino.taxed()).to.equal(90);
    
    })
    it("Attempt to change Taxed Amount with ownership - Expect Success", async function () {
            
        expect(await domino.taxed()).to.equal(90);
        await domino.changeTaxedAmount(80);
        expect(await domino.taxed()).to.equal(80);
            
    })
    it("Attempt to change maxTransfer amount without ownership - Expect Fail", async function () {
        
        expect(await domino.maxTransfer()).to.equal(ethers.utils.parseEther("1000000"));
        try {
            await domino.connect(addr1).changeMaxTransfer(2000000);
        }
        catch(e) {
            error = e;
        }
        expect(hasReason(error, "Ownable, Caller is not the owner"));
        expect(await domino.maxTransfer()).to.equal(ethers.utils.parseEther("1000000"));
        
    })
    it("Attempt to change maxTransfer amount with ownership - Expect Success", async function () {

        expect(await domino.maxTransfer()).to.equal(ethers.utils.parseEther("1000000"));
        await domino.changeMaxTransfer(2000000);
        expect(await domino.maxTransfer()).to.equal(2000000);
        
    })
    it("Attempt to transfer - Expect Success", async function () {
    
        await domino.addMintingCaller(owner.address);
        await domino.mint(owner.address, 9000000)
        await domino.mint(staker.address, 1000000);
        //There must be a staker for the transfer to work
        await domino.connect(staker).stake();
        await domino.transfer(addr1.address, ethers.utils.parseEther("1000000"));

    })
})