require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-contract-sizer');
require("hardhat-gas-reporter");
// import 'hardhat-gas-reporter';
// import 'hardhat-spdx-license-identifier';
// import 'hardhat-contract-sizer';
// import '@nomiclabs/hardhat-etherscan';


const { API_URL, PRIVATE_KEY, API_KEY } = process.env;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }},
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }},
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }},
      {
        version: "0.5.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }},
      ]
  },
  etherscan: {
    apiKey: API_KEY,
  },
  networks: {
    rinkeby: {
      url: API_URL,
      accounts: [PRIVATE_KEY],
    },
    "optimism": {
      url: "https://mainnet.optimism.io",
      accounts: [process.env.PRIVATE_KEY],
    },
    "optimistic-goerli": {
      url: "https://goerli.optimism.io",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: "" // create an account at https://coinmarketcap.com/api/ to get an API key
  },
  contractSizer: {
    runOnCompile: true
  },
  mocha: {
    timeout: 1000000,
  }
};
