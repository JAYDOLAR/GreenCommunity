// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ICertificateNFT {
    function mintCertificate(address to, uint256 projectId, uint256 amount, string calldata uri) external returns (uint256);
}

/**
 * @title CarbonCreditMarketplace
 * @notice Manages sustainability projects, carbon credit supply & purchases. Each project maps to
 *         an ERC1155 token ID whose total supply equals the number of credits issued. Credits can
 *         be purchased with native token (e.g., ETH / MATIC) or minted for fiat purchases by owner.
 *         Certificates (ERC721) are optionally minted for proof of retirement using a separate contract.
 */
contract CarbonCreditMarketplace is ERC1155, Ownable, ReentrancyGuard {
    struct Project {
        uint256 id;               // token id == project id
        uint256 totalCredits;     // total issued credits (max mintable)
        uint256 soldCredits;      // credits sold so far
        uint256 pricePerCredit;   // price in wei for 1 credit
        string metadataURI;       // off-chain metadata (IPFS/HTTPS) for project
        bool active;              // if true project is sellable
        uint16 autoRetireBps;     // per-project auto-retire (0 means use global setting)
    }

    // projectId => Project
    mapping(uint256 => Project) public projects;
    // simple incremental id if caller wants autoincrement
    uint256 public lastProjectId;
    // certificate contract (optional)
    ICertificateNFT public certificate; 
    // percentage (in basis points) of credits automatically retired & certificated at purchase (e.g., 10000 = 100%)
    uint16 public autoRetireBps = 0; // global fallback (deprecated in favor of per-project override)

    event ProjectRegistered(uint256 indexed projectId, uint256 totalCredits, uint256 pricePerCredit, string uri);
    event ProjectActivated(uint256 indexed projectId, bool active);
    event CreditsPurchased(uint256 indexed projectId, address indexed buyer, uint256 amount, uint256 valuePaid);
    event FiatCreditsGranted(uint256 indexed projectId, address indexed buyer, uint256 amount, string receiptId);
    event CertificateContractSet(address indexed certificate);
    event AutoRetireUpdated(uint16 bps);

    error ProjectNotActive();
    error InvalidAmount();
    error SupplyExceeded();
    error PriceMismatch();

    constructor(string memory globalURI, address initialOwner) ERC1155(globalURI) Ownable(initialOwner) {}

    // ---------------- Project Management ----------------
    function registerProject(
        uint256 projectId,
        uint256 totalCredits,
        uint256 pricePerCredit,
        string calldata metadataURI
    ) external onlyOwner {
        if (projectId == 0) {
            projectId = ++lastProjectId; // allow autoincrement when 0 passed
        } else if (projectId > lastProjectId) {
            lastProjectId = projectId;
        }
        Project storage p = projects[projectId];
        require(p.id == 0, "Exists");
        projects[projectId] = Project({
            id: projectId,
            totalCredits: totalCredits,
            soldCredits: 0,
            pricePerCredit: pricePerCredit,
            metadataURI: metadataURI,
            active: true,
            autoRetireBps: 0
        });
        emit ProjectRegistered(projectId, totalCredits, pricePerCredit, metadataURI);
    }

    function setProjectActive(uint256 projectId, bool active) external onlyOwner {
        Project storage p = _requireProject(projectId);
        p.active = active;
        emit ProjectActivated(projectId, active);
    }

    function setCertificateContract(address _certificate) external onlyOwner {
        certificate = ICertificateNFT(_certificate);
        emit CertificateContractSet(_certificate);
    }

    function setAutoRetireBps(uint16 bps) external onlyOwner {
        require(bps <= 10000, "bps");
        autoRetireBps = bps;
        emit AutoRetireUpdated(bps);
    }

    function setProjectAutoRetireBps(uint256 projectId, uint16 bps) external onlyOwner {
        require(bps <= 10000, "bps");
        Project storage p = _requireProject(projectId);
        p.autoRetireBps = bps;
        emit AutoRetireUpdated(bps);
    }

    // ---------------- Purchase Logic (Crypto) ----------------
    function buyCredits(uint256 projectId, uint256 amount, string calldata certificateURI) external payable nonReentrant {
        Project storage p = _requireProject(projectId);
        if (!p.active) revert ProjectNotActive();
        if (amount == 0) revert InvalidAmount();
        if (p.soldCredits + amount > p.totalCredits) revert SupplyExceeded();

        uint256 cost = p.pricePerCredit * amount;
        if (msg.value != cost) revert PriceMismatch();

        p.soldCredits += amount;

        // Mint tradable credits to user
        _mint(msg.sender, projectId, amount, "");

        emit CreditsPurchased(projectId, msg.sender, amount, msg.value);

        // Optional auto-retire: choose per-project override or global
        uint16 retireSetting = p.autoRetireBps > 0 ? p.autoRetireBps : autoRetireBps;
        if (address(certificate) != address(0) && retireSetting > 0) {
            uint256 retireAmt = (amount * retireSetting) / 10000;
            if (retireAmt > 0) {
                _burn(msg.sender, projectId, retireAmt);
                certificate.mintCertificate(msg.sender, projectId, retireAmt, certificateURI);
            }
        }
    }

    // Owner mints credits for a fiat purchase (off-chain payment verified) and can immediately retire & certify.
    function grantFiatPurchase(
        uint256 projectId,
        address buyer,
        uint256 amount,
        string calldata receiptId,
        bool retireImmediately,
        string calldata certificateURI
    ) external onlyOwner {
        Project storage p = _requireProject(projectId);
        if (!p.active) revert ProjectNotActive();
        if (amount == 0) revert InvalidAmount();
        if (p.soldCredits + amount > p.totalCredits) revert SupplyExceeded();

        p.soldCredits += amount;
        _mint(buyer, projectId, amount, "");
        emit FiatCreditsGranted(projectId, buyer, amount, receiptId);

        if (retireImmediately && address(certificate) != address(0)) {
            _burn(buyer, projectId, amount);
            certificate.mintCertificate(buyer, projectId, amount, certificateURI);
        }
    }

    // User can retire some of their credits manually to receive a certificate.
    function retireCredits(
        uint256 projectId,
        uint256 amount,
        string calldata certificateURI
    ) external {
        require(address(certificate) != address(0), "cert disabled");
        if (amount == 0) revert InvalidAmount();
        _burn(msg.sender, projectId, amount);
        certificate.mintCertificate(msg.sender, projectId, amount, certificateURI);
    }

    // Withdraw native currency from contract (accumulated crypto sales)
    function withdraw(address payable to, uint256 amount) external onlyOwner {
        if (amount == 0) amount = address(this).balance;
        require(amount <= address(this).balance, "bal");
        to.transfer(amount);
    }

    // View helper
    function projectAvailable(uint256 projectId) external view returns (uint256) {
        Project storage p = projects[projectId];
        if (p.id == 0) return 0;
        return p.totalCredits - p.soldCredits;
    }

    function uri(uint256 /* projectId */) public view override returns (string memory) {
        // Per-token URIs are stored off-chain in Project.metadataURI, return base for compatibility
        return super.uri(0);
    }

    function _requireProject(uint256 projectId) internal view returns (Project storage p) {
        p = projects[projectId];
        require(p.id != 0, "No project");
    }
}
