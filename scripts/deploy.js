const { ethers } = require("ethers");

async function main() {
  // Get the signers
  const [deployer] = await ethers.getSigners();

  // Deploy the contract
  console.log("Deploying ReferralRewards contract...");
  const ReferralRewards = await ethers.getContractFactory("ReferralRewards");
  const referralRewards = await ReferralRewards.deploy(10,5,1);

  // Wait for the contract to be mined
  await referralRewards.deployed();

  console.log(`ReferralRewards contract deployed to: ${referralRewards.address}`);
  console.log(`Transaction hash: ${referralRewards.deployTransaction.hash}`);


}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
