// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CertificateNFT
 * @dev ERC721 certificate representing proof of carbon credit retirement (offset) for a user.
 *      Minting restricted to authorized marketplace contract (set by owner). Metadata URI should
 *      contain details: project info, amount of CO2 offset (in tonnes), issuance date, hash of
 *      off-chain verification docs.
 */
contract CertificateNFT is ERC721URIStorage, Ownable {
    uint256 private _nextId;
    address public marketplace; // authorized minter

    event MarketplaceUpdated(address indexed marketplace);
    event CertificateMinted(uint256 indexed tokenId, address indexed to, uint256 projectId, uint256 amount, string uri);

    mapping(uint256 => CertificateData) public certificateData; // tokenId => data

    struct CertificateData {
        uint256 projectId;
        uint256 amount; // amount of credits/tonnes represented
    }

    modifier onlyMarketplace() {
        require(msg.sender == marketplace, "Not marketplace");
        _;
    }

    constructor(address initialOwner) ERC721("Carbon Offset Certificate", "COC") Ownable(initialOwner) {}

    function setMarketplace(address _marketplace) external onlyOwner {
        marketplace = _marketplace;
        emit MarketplaceUpdated(_marketplace);
    }

    function mintCertificate(
        address to,
        uint256 projectId,
        uint256 amount,
        string calldata uri
    ) external onlyMarketplace returns (uint256 tokenId) {
        tokenId = ++_nextId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        certificateData[tokenId] = CertificateData({projectId: projectId, amount: amount});
        emit CertificateMinted(tokenId, to, projectId, amount, uri);
    }
}
