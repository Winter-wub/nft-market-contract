import { expect } from "chai";
import { Signer } from "ethers";
import { ethers, upgrades } from "hardhat";
import { NFT_721, TokenManagement, } from "../typechain-types";


describe('TokenManagement', function () {
  let tokenManagement: TokenManagement;
  let owner: Signer;
  let user: Signer;
  let token721Contract: NFT_721;
  let tokenId721 = 0;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const TokenManagement = await ethers.getContractFactory('TokenManagement');
    const proxy = await upgrades.deployProxy(TokenManagement);
    tokenManagement = await proxy.deployed() as TokenManagement;

    // Deploy ERC721  contract for testing
    // Replace `YourTokenContract` with the actual contract name
    const TokenContract = await ethers.getContractFactory('NFT_721');
    token721Contract = await TokenContract.deploy();

    await token721Contract.safeMint(await user.getAddress())

  });

  it('should allow depositing ERC721 tokens', async function () {
    // Approve TokenManagement contract to transfer ERC721 tokens
    await token721Contract.connect(user).approve(tokenManagement.address, tokenId721);

    // Deposit ERC721 token
    await tokenManagement.connect(user).deposit721(token721Contract.address, tokenId721);

    // Check if the token is in the TokenManagement contract
    const tokenOwner = await token721Contract.ownerOf(tokenId721);
    expect(tokenOwner).to.equal(tokenManagement.address);
  });

  it('should allow withdrawing unlocked ERC721 tokens', async function () {
    await token721Contract.connect(user).approve(tokenManagement.address, tokenId721);
    // Deposit ERC721 token
    await tokenManagement.connect(user).deposit721(token721Contract.address, tokenId721);
    // Withdraw ERC721 token
    await tokenManagement.connect(user).withdraw721(token721Contract.address, tokenId721);

    // Check if the token is transferred back to the owner
    const tokenOwner = await token721Contract.ownerOf(tokenId721);
    expect(tokenOwner).to.equal(await user.getAddress());
  });

  it('should lock and prevent withdrawing locked ERC721 tokens', async function () {
    await token721Contract.connect(user).approve(tokenManagement.address, tokenId721);
    // Deposit ERC721 token
    await tokenManagement.connect(user).deposit721(token721Contract.address, tokenId721);

    // Lock ERC721 token
    await tokenManagement.lock721(token721Contract.address, tokenId721);

    // Attempt to withdraw locked ERC721 token
    await expect(tokenManagement.connect(user).withdraw721(token721Contract.address, tokenId721)).to.be.revertedWith(
      'This token is locked from withdrawal'
    );

    // Unlock ERC721 token
    await tokenManagement.unlock721(token721Contract.address, tokenId721);

    // Withdraw unlocked ERC721 token
    await tokenManagement.connect(user).withdraw721(token721Contract.address, tokenId721);

    // Check if the token is transferred back to the owner
    const tokenOwner = await token721Contract.ownerOf(tokenId721);
    expect(tokenOwner).to.equal(await user.getAddress());
  });
});



