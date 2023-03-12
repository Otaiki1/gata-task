const hre = require("hardhat");

async function main() {

  // Deploy the contract
  console.log("Deploying ReferralRewards contract...");
  const ReferralRewards = await hre.ethers.getContractFactory("ReferralRewards");
  const referralRewards = await ReferralRewards.deploy(10,5,1);

  // Wait for the contract to be mined
  await referralRewards.deployed();

  console.log("Referral Rewards Contract deployed");


}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
