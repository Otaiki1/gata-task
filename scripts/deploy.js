const { ethers } = require("ethers");

async function main() {
  // Get the signers
  const [deployer] = await ethers.getSigners();

  // Deploy the contract
  console.log("Deploying ReferralRewards contract...");
  const ReferralRewards = await ethers.getContractFactory("ReferralRewards");
  const referralRewards = await ReferralRewards.deploy();

  // Wait for the contract to be mined
  await referralRewards.deployed();

  console.log(`ReferralRewards contract deployed to: ${referralRewards.address}`);
  console.log(`Transaction hash: ${referralRewards.deployTransaction.hash}`);

  // Set the referral percentages
  console.log("Setting referral percentages...");
  await referralRewards.setReferralPercentage(5);
  await referralRewards.setLevel1Percentage(3);
  await referralRewards.setLevel2Percentage(2);

  console.log("Referral percentages set!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
