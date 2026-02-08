// Hardhat v3 ESM style: import runtime env and use hre.ethers
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy Certificate NFT
  const Certificate = await ethers.getContractFactory("CertificateNFT");
  const certificate = await Certificate.deploy(deployer.address);
  await certificate.waitForDeployment();
  const certificateAddress = await certificate.getAddress();
  console.log("CertificateNFT:", certificateAddress);

  // Deploy Marketplace (pass empty base URI for now)
  const Marketplace = await ethers.getContractFactory("CarbonCreditMarketplace");
  const marketplace = await Marketplace.deploy("https://metadata.example/base/{id}.json", deployer.address);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("CarbonCreditMarketplace:", marketplaceAddress);

  // Wire certificate ↔ marketplace (bidirectional)
  const tx1 = await certificate.setMarketplace(marketplaceAddress);
  await tx1.wait();
  console.log("Linked certificate → marketplace (CertificateNFT.setMarketplace)");

  const tx2 = await marketplace.setCertificateContract(certificateAddress);
  await tx2.wait();
  console.log("Linked marketplace → certificate (setCertificateContract)");

  // Auto-retire 100% on purchase → every credit bought auto-mints an NFT certificate
  const tx3 = await marketplace.setAutoRetireBps(10000);
  await tx3.wait();
  console.log("Set autoRetireBps = 10000 (100% — every purchase mints NFT certificate)");

  // NOTE: Do NOT register sample projects here — production projects are
  // registered via the server's approveAndRegister endpoint, which auto-increments
  // the on-chain projectId. A hardcoded sample registration here would collide
  // with real project IDs and waste the first slot.
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
