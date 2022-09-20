pragma solidity ^0.8.0;

import "./utils/Ownable.sol";

interface DOMINO {
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract DominoFaucet is Ownable {
    uint256 public remainingDomino;
    uint256 public dripAmount = 1000000000000000000000;
    uint256 public waitTime = 30 minutes;

    DOMINO public dominoContract;
    
    mapping(address => uint256) lastAccessTime;

    constructor(address _tokenInstance) {
        require(_tokenInstance != address(0));
        dominoContract = DOMINO(_tokenInstance);
    }

    function initialize() public onlyOwner {
        remainingDomino = dominoContract.balanceOf(address(this));
    }

    function requestDomino() public {
        require(allowedToWithdraw(msg.sender), "Facuet: You have to wait 30 minutes before requesting again");
        dominoContract.transfer(msg.sender, dripAmount);
        uint256 newTotal =  dominoContract.balanceOf(address(this));
        remainingDomino = newTotal;
        lastAccessTime[msg.sender] = block.timestamp + waitTime;
    }

    function allowedToWithdraw(address _address) public view returns (bool) {
        if(lastAccessTime[_address] == 0) {
            return true;
        } else if(block.timestamp >= lastAccessTime[_address]) {
            return true;
        }
        return false;
    }

    function updateWaitTime(uint256 _newWaitTime) public onlyOwner {
        waitTime = _newWaitTime;
    }

    function updateDripAmount(uint256 _newDripAmount) public onlyOwner {
        dripAmount = _newDripAmount;
    }

    function getRemainingDomino() public view returns (uint256) {
        return remainingDomino;
    }

    function getDripAmount() public view returns (uint256) {
        return dripAmount;
    }

    function getWaitTime() public view returns (uint256) {
        return waitTime;
    }
    
}