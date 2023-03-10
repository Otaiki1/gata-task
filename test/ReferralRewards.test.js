const { expect } = require("chai");
const { ethers } = require("ethers");

describe("ReferralRewards", function () {
  let owner;
  let referrer1;
  let referrer2;
  let buyer;
  let ReferralRewards;

  beforeEach(async () => {
    // Deploy the contract
    const ReferralRewardsFactory = await ethers.getContractFactory(
      "ReferralRewards"
    );
    ReferralRewards = await ReferralRewardsFactory.deploy(10, 5, 3);

    // Get test accounts
    [owner, referrer1, referrer2, buyer] = await ethers.getSigners();
  });

  it("should update referral percentages correctly", async function () {
    // Call updateReferralPercentages function
    await ReferralRewards.updateReferralPercentages(20, 10, 5);

    // Check that referral percentages were updated correctly
    expect(await ReferralRewards.referralPercentage()).to.equal(20);
    expect(await ReferralRewards.level1Percentage()).to.equal(10);
    expect(await ReferralRewards.level2Percentage()).to.equal(5);
  });

  it("should not allow non-owners to update referral percentages", async function () {
    // Call updateReferralPercentages function with non-owner account
    await expect(
      ReferralRewards.connect(referrer1).updateReferralPercentages(20, 10, 5)
    ).to.be.revertedWith("Error__NotOwner");
  });

  it("should allow buyers to claim referral rewards", async function () {
    // Call buyNFT function with referrer1
    await ReferralRewards.buyNFT(referrer1.address, { value: 100 });

    // Check that referral balance of referrer1 was updated correctly
    expect(
      await ReferralRewards.getReferralBalance(referrer1.address)
    ).to.equal(10);

    // Call getReferralRewards function with buyer account
    const initialBalance = await buyer.getBalance();
    await ReferralRewards.connect(buyer).getReferralRewards();
    const finalBalance = await buyer.getBalance();

    // Check that referral reward was sent correctly to buyer account
    expect(finalBalance.sub(initialBalance)).to.equal(10);
  });

  it("should revert if a user tries to claim referral rewards without any balance", async function () {
    // Call getReferralRewards function with buyer account
    await expect(
      ReferralRewards.connect(buyer).getReferralRewards()
    ).to.be.revertedWith("Error__NoReferralRewards");
  });

  it("should not allow users to buy multiple NFTs", async function () {
    // Call buyNFT function with referrer1
    await ReferralRewards.buyNFT(referrer1.address, { value: 100 });

    // Call buyNFT function again with same buyer account
    await expect(
      ReferralRewards.buyNFT(referrer2.address, { value: 100 })
    ).to.be.revertedWith("Error__AlreadyBought");
  });

  it("should pay referral rewards to the referrer and their first and second level referrers", async function () {
    // Call the buyNFT function with referrer1 as the referrer
    await referralRewards
      .connect(buyer)
      .buyNFT(referrer1.address, { value: 100 });

    // Check that the referrer's referral balance has been updated correctly
    expect(
      await referralRewards.getReferralBalance(referrer1.address)
    ).to.equal(10);

    // Check that the buyer's referrer is referrer1
    const buyerReferrer = await referralRewards.referrers(buyer.address);
    expect(buyerReferrer.referrerAddress).to.equal(referrer1.address);

    // Check that the level 1 referrer's referral balance has been updated correctly
    expect(
      await referralRewards.getReferralBalance(referrer2.address)
    ).to.equal(0);
    const level1Referrer = await referralRewards.level1Referrers(
      buyer.address,
      referrer1.address
    );
    expect(
      await referralRewards.getReferralBalance(level1Referrer.referrerAddress)
    ).to.equal(5);

    // Call the buyNFT function again with referrer2 as the referrer
    await referralRewards
      .connect(buyer)
      .buyNFT(referrer2.address, { value: 100 });

    // Check that the referrer2's referral balance has been updated correctly
    expect(
      await referralRewards.getReferralBalance(referrer2.address)
    ).to.equal(10);

    // Check that the level 2 referrer's referral balance has been updated correctly
    const level2Referrer = await referralRewards.level2Referrers(
      buyer.address,
      referrer1.address,
      referrer2.address
    );
    expect(
      await referralRewards.getReferralBalance(level2Referrer.referrerAddress)
    ).to.equal(2);

    // Check that the remaining amount has been transferred to the owner
    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
    await referralRewards
      .connect(buyer)
      .buyNFT(referrer2.address, { value: 100 });
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
    expect(ownerBalanceAfter.sub(ownerBalanceBefore)).to.equal(183);
  });
});
