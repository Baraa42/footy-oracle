//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import "hardhat/console.sol";

contract LPNFT is ERC721, Ownable {

    using Strings for uint256;

    struct BetDetails {
      string matchId;
      uint256 betId;
    }

    // Optional mapping for token URIs
    mapping (uint256 => string) private _tokenURIs;
    uint nextFreeTokenId;

    constructor(string memory _name, string memory _symbol)
      ERC721(_name, _symbol)
    {
       console.log("Deploying LP NFT:", _name);
       nextFreeTokenId = 1;
    }

    function _setTokenURI(uint256 tokenId, string memory ipfsLocation) internal virtual {
      require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
      _tokenURIs[tokenId] = ipfsLocation;
    }

    function tokenURI(uint256 tokenId)
     public view virtual override returns (string memory) {
      require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
      return _tokenURIs[tokenId];
    }

    function redeemCollectible(address from, uint256 tokenId) external {
        require(_exists(tokenId), "ERC721: token doesn't exist");
        require(ownerOf(tokenId) == from, "ERC721: transfer caller is not owner");

      console.log("Trying to burn: ", tokenId);
      _burn(tokenId);
      console.log("Burn completed");
    }

    function mint(address _to, uint256 _tokenId, string calldata ipfsLocation) external {
      console.log("Trying to mint for ", _to, " tokenId = ", _tokenId);
      // call to ERC721 mint function
      _mint(_to, _tokenId);
      console.log("Mint completed");

      // Wrap it with details we need
      _setTokenURI(_tokenId, ipfsLocation);
      nextFreeTokenId = _tokenId + 1;
    }

    function getNextFreeTokenId() public view returns (uint) {
      return nextFreeTokenId;
    }
  }