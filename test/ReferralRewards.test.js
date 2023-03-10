const { expect } = require("chai");
const { ethers } = require("ethers");

describe("ReferralRewards", function () {
  let owner;
  let referrer;
  let level1Referrer;
  let level2Referrer;
  let buyer1;
  let buyer2;
  let buyer3;
  let referralRewards;

  before(async function () {
    // Get the signers
    [owner, referrer, level1Referrer, level2Referrer, buyer1, buyer2, buyer3] = await ethers.getSigners();

    // Deploy the contract
    const ReferralRewards = await ethers.getContractFactory("ReferralRewards");
    referralRewards = await ReferralRewards.deploy();
    await referralRewards.deployed();

    // Set the referral percentages
    await referralRewards.setReferralPercentage(5);
    await referralRewards.setLevel1Percentage(3);
    await referralRewards.setLevel2Percentage(2);
  });

  it("should allow users to buy NFTs and earn referral rewards", async function () {
    // Set the referrers for the buyers
    await referralRewards.setReferrer(buyer1.address, referrer.address);
    await referralRewards.setReferrer(buyer2.address, level1Referrer.address);
    await referralRewards.setReferrer(buyer3.address, level2Referrer.address);

    // Make sure the buyers haven't purchased an NFT yet
    expect(await referralRewards.isBuyer(buyer1.address)).to.equal(false);
    expect(await referralRewards.isBuyer(buyer2.address)).to.equal(false);
    expect(await referralRewards.isBuyer(buyer3.address)).to.equal(false);

    // Buy NFTs for the buyers
    await buyer1.sendTransaction({
      to: referralRewards.address,
      value: ethers.utils.parseEther("1")
    });
    await buyer2.sendTransaction({
      to: referralRewards.address,
      value: ethers.utils.parseEther("1")
    });
    await buyer3.sendTransaction({
      to: referralRewards.address,
      value: ethers.utils.parseEther("1")
    });

    // Make sure the buyers are marked as buyers
    expect(await referralRewards.isBuyer(buyer1.address)).to.equal(true);
    expect(await referralRewards.isBuyer(buyer2.address)).to.equal(true);
    expect(await referralRewards.isBuyer(buyer3.address)).to.equal(true);

    // Get the referral rewards for the referrers
    const referralReward = await referralRewards.referrers(referrer.address);
    const level1Reward = await referralRewards.level1Referrers(level1Referrer.address);
    const level2Reward = await referralRewards.level2Referrers(level2Referrer.address);

    // Make sure the referral rewards are correct
    expect(referralReward).to.equal(ethers.utils.parseEther("0.05"));
    expect(level1Reward).to.equal(ethers.utils.parseEther("0.03"));
    expect(level2Reward).to.equal(ethers.utils.parseEther("0.02"));
  });

  it("should allow users to claim their referral rewards", async function () {
    // Get the initial balances of the users
    const initialReferrerBalance = await ethers.provider.getBalance(referrer.address);
    const initialLevel1ReferrerBalance = await ethers.provider.getBalance(level1Referrer.address);
    const initialLevel2ReferrerBalance = await ethers.provider.getBalance(level2Referrer.address);

    // 
  })
})
