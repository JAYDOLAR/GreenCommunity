// Hardhat v3 ESM style: import the runtime environment as default and then use hre.ethers
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const Counter = await ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  console.log("Counter deployed to:", await counter.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
