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

  // Wire certificate to marketplace
  const tx = await certificate.setMarketplace(marketplaceAddress);
  await tx.wait();
  console.log("Linked certificate to marketplace");

  // Example: register a sample project (id auto if 0)
  const registerTx = await marketplace.registerProject(0, 10000, ethers.parseEther("0.01"), "ipfs://sampleProjectMetadataHash");
  await registerTx.wait();
  console.log("Sample project registered");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
