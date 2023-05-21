// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract TokenManagement is
    ERC721Holder,
    Initializable,
    PausableUpgradeable,
    OwnableUpgradeable
{
    using Address for address;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Pausable_init();
        __Ownable_init();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    mapping(address => mapping(uint256 => uint256)) private balances721;
    mapping(address => mapping(uint256 => bool)) private locked721;

    function deposit721(address tokenContract, uint256 tokenId) public {
        IERC721 token = IERC721(tokenContract);
        address owner = token.ownerOf(tokenId);
        require(owner == msg.sender, "You are not the owner of this token");
        token.safeTransferFrom(msg.sender, address(this), tokenId);
        balances721[tokenContract][tokenId]++;
    }

    function withdraw721(address tokenContract, uint256 tokenId) public {
        IERC721 token = IERC721(tokenContract);
        require(
            balances721[tokenContract][tokenId] > 0,
            "No balance available for this token"
        );
        require(
            !locked721[tokenContract][tokenId],
            "This token is locked from withdrawal"
        );
        balances721[tokenContract][tokenId]--;
        token.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function lock721(address tokenContract, uint256 tokenId) public onlyOwner {
        require(
            balances721[tokenContract][tokenId] > 0,
            "No balance available for this token"
        );
        locked721[tokenContract][tokenId] = true;
    }

    function unlock721(
        address tokenContract,
        uint256 tokenId
    ) public onlyOwner {
        require(
            balances721[tokenContract][tokenId] > 0,
            "No balance available for this token"
        );
        locked721[tokenContract][tokenId] = false;
    }
}
