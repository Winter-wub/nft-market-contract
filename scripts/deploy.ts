import { ethers, upgrades } from "hardhat";

async function main() {
  const TokenManagement = await ethers.getContractFactory("TokenManagement");
  const token = await upgrades.deployProxy(TokenManagement);
  const deployInfo = await token.deployed();

  console.log(`deployed at ${token.address} hash: ${deployInfo.deployTransaction.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
