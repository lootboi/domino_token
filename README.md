# Setup

## Prerequesites

In order to run this repository on your machine you will need the following:
- ```npm``` [Download](https://nodejs.org/en/download/) --> Package manager
- ```VS Code (or other IDE)``` [Download](https://code.visualstudio.com/)
- ```Github for VS CODE``` [Dowload](https://vscode.github.com/) (Makes it easier to clone repositories)

## Cloning the repository

After logging into your Github Account through VS Code or your preferred IDE, you can clone the repository.

To get a copy of the repository onto your machine, the easiest way to do this is through HTTPS. At the top of this page there should be a green button on the right with the word "Code" on it. Click this, if the HTTPS tab is not selected when the tab opens up, select it and copy the link that it provides. If you can't find it, here is the link:

```
https://github.com/lootboi/domino_token.git
```

Next, go back into VS Code and open up a new window. In the middle of the page there should be an option to Clone a repository from Github, select this and copy + paste the HTTPS link that we got earlier. Press enter, and the IDE will automatically create a copy of the repo on your machine. 

Lastly, open up the folder (which will be named the same as the repository name) through VS Code.

## Setup

You will need to create your own ```.env``` file using the ```ENV_EXAMPLE``` file as a template. You will need to utilize a private key, I suggest creating one [here](https://vanity-eth.tk/). If you want to utilize mainnet or testnet networks, this wallet will need to be funded with test ether or ether. In order for the private key to be recognized as such, you need to append it with ```0x``` or else it will not work. I kepy my etherscan API key in there cause it doesn't really matter but you can create your own as well [here](https://etherscan.io/)

The following commands will help you setup and test out the repository after cloning.

1. ```npm install``` --> Will install all of the dependancies necessary to interact with the project
2. ```npx hardhat compile``` --> Will compile all of the contracts within the "contracts" file
3. ```npx hardhat test``` --> Will run all of the scripts within the "test" folder

## Contracts

Domino_Faucet.sol: The Faucet of which NFT holders can receive Domino tokens from (wip)

Domino_Token.sol: The Domino (d.MNO) token contract

Key.sol: NFT that is used to interact with the faucet (wip)

## Tests

Currently there are 4 test scripts, one contract factory then one for each contract. The contractFactory creates instances of the contracts for each unit test to use. This is useful because we can write any number of unit tests without using the same instance. Ie. If we have 1 unit test where the state of the contract is changed, in the next test, the script will start with a "fresh" instance of the contracts. If you want to run one script individually, run:

````
npx hardhat test test/<scriptname>
````

If you would like to run specific tests out of a specific test script, first change "it()" to "it.only()" on the corresponding unit test, then run:

```
npx hardhat test/<scriptname>
```

If you want to test your scripts on a live network (mainnet or testnet) use the following appendages

```
npx hardhat test/<scriptname> --network <network name>
```
* This repository currently has Optimism Goerli and Optimism Mainnet configured for usage in the ```hardhat.config.js``` file

If you want to create a new unit test, use this framework:

```
it("Test Title Goes here", async function () {

    <Inster test here>

})
```

## Basic ethersJS notation

Any instance of a contract is referred to by any of the following names:
- keyContract
- domino
- faucet

Thus any function that you wish to call from a specific contract looks like this:

```await contractName.functionName(functionArguments)```

```await``` is necessary or else no information/function is actually called from the contract

If we want to be able to call the value of what a contracts function returns and use it to interact with other functionality, its often best to store it within a variable or constant:

```
var value = await contractName.contractFunction()
const value = await contractName.contractFunction()
```

That way we can use it in another function more easily, like this:

```
const value = await contractName.contractFunction()
expect(value).to.equal(0)
```
*Even if we are trying to read a public or constant value from within a contract, or there are no arguments that the function takes, we always have to end the function with ()

One annoying thing about crypto is that it utilizes bigNumbers (wei) unless otherwise specified within a contract (very rare). Because of this, pretty much every time you get a uint256 value returned to you, you will have to use ```ethers.utils.parseEther(< value >)``` which might look like this:

```
const erc20Supply = await erc20.totalSupply()
expect(erc20Supply).to.equal(ethers.utils.parseEther("10"))
```

This will get you stuck a lot initially but but if you remember your good friend ```ethers.utils.parseEther()``` to convert number values into wei and ```ethers.utils.formatEther``` to convert wei to ETH

## Other useful stuff

- Git Documentation: [here](https://git-scm.com/doc)
- Hardhat Documentation: [here](https://hardhat.org/docs)
- Ethers Documentation: [here](https://docs.ethers.io/v5/)

