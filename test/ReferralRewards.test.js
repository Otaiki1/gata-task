const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReferralRewards", function () {
  let owner;
  let referrer1;
  let buyer2;
  let buyer3
  let buyer;
  let ReferralRewards;

  beforeEach(async () => {
    // Deploy the contract
    const ReferralRewardsFactory = await ethers.getContractFactory(
      "ReferralRewards"
    );
    ReferralRewards = await ReferralRewardsFactory.deploy(10, 5, 1);

    // Get test accounts
    [owner, referrer1, buyer2, buyer, buyer3] = await ethers.getSigners();
  });

  it("should update referral percentages correctly", async function () {
    // Call updateReferralPercentages function
    await ReferralRewards.updateReferralPercentages(20, 10, 5);

    // Check that referral percentages were updated correctly
    expect(await ReferralRewards.referralPercentage()).to.equal(20);
    expect(await ReferralRewards.level1Percentage()).to.equal(10);
    expect(await ReferralRewards.level2Percentage()).to.equal(5);
  });

  it("should not allow non-owners to update referral percentages", async () => {
    // Call updateReferralPercentages function with non-owner account
    await expect (ReferralRewards.connect(referrer1).updateReferralPercentages( 12, 6, 3)).to.be.revertedWithCustomError(ReferralRewards, "Error__NotOwner");
  });

  it("should allow referees to claim referral rewards", async function () {
    // Call buyNFT function with buyer using referrer1 as referreee
    await ReferralRewards.connect(buyer).buyNFT(referrer1.address, { value: 100 });

    // Check that referral balance of referrer1 was updated correctly
    expect(
      await ReferralRewards.getReferralBalance(referrer1.address)
    ).to.equal(10);

    // Call getReferralRewards function with referrer account
    const initialBalance = await ReferralRewards.getReferralBalance(referrer1.address);
    await ReferralRewards.connect(referrer1).getReferralRewards();
    const finalBalance = await ReferralRewards.getReferralBalance(referrer1.address);


    // Check that referral reward was sent correctly to referrer account
    expect(initialBalance.sub(finalBalance)).to.equal(10);
  });

  it("should revert if a user tries to claim referral rewards without any balance", async function () {
    // Call getReferralRewards function with buyer account
    await expect(
      ReferralRewards.connect(buyer).getReferralRewards()
    ).to.be.revertedWithCustomError(ReferralRewards, "Error__NoReferralRewards");
  });

  it("should not allow users to buy multiple NFTs", async function () {
    // Call buyNFT function with referrer1
    await ReferralRewards.connect(buyer).buyNFT(referrer1.address, { value: 100 });

    // Call buyNFT function again with same buyer account
    await expect(
      ReferralRewards.connect(buyer).buyNFT(buyer2.address, { value: 100 })
    ).to.be.revertedWithCustomError(ReferralRewards, "Error__AlreadyBought");
  });

  it("should pay referral rewards to the referrer and their first and second level referrers", async function () {
    // Call the buyNFT function with referrer1 as the referrer
    await ReferralRewards
      .connect(buyer)
      .buyNFT(referrer1.address, { value: 100 });

    // Check that the referrer's referral balance has been updated correctly
    expect(
      await ReferralRewards.getReferralBalance(referrer1.address)
    ).to.equal(10);

    // Check that the referrer1 first referee is buyer
    const firstReferee = await ReferralRewards.referrers(referrer1.address);
    expect(firstReferee.refereeAddress).to.equal(buyer.address);
    expect(firstReferee.refereeAmount).to.equal(10);

       // Call the buyNFT function as buyer2 with referrer1 as the referrer
    await ReferralRewards
    .connect(buyer2)
    .buyNFT(referrer1.address, { value: 100 });

    // Check that the level1 referrer's referee balance and address has been updated correctly
    // expect(
    //   await ReferralRewards.getReferralBalance(referrer2.address)
    // ).to.equal(0);
    const level1Referrer = await ReferralRewards.level1Referrers(
      referrer1.address,
      buyer.address
    );
    
    expect(
      await level1Referrer.refereeAmount
    ).to.equal(5);
    expect(
      await level1Referrer.refereeAddress
    ).to.equal(buyer2.address);

    expect(
      await ReferralRewards.getReferralBalance(referrer1.address)
    ).to.equal(15);


    // Call the buyNFT function again with referrer2 as the referrer
    await ReferralRewards
      .connect(buyer3)
      .buyNFT(referrer1.address, { value: 100 });

    // Check that the referrer2's referral balance has been updated correctly
    expect(
      await ReferralRewards.getReferralBalance(referrer1.address)
    ).to.equal(16);

    // Check that the level 2 referrer's referral balance and address has been updated correctly
    const level2Referrer = await ReferralRewards.level2Referrers(
      referrer1.address,
      buyer.address,
      buyer2.address
    );
    expect(
      await level2Referrer.refereeAmount
    ).to.equal(1);
    expect(
      await level2Referrer.refereeAddress
    ).to.equal(buyer3.address);

  })

  it("Should pay owner every time someone buys an NFT", async() => {
    // Check that the remaining amount has been transferred to the owner
    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
    await ReferralRewards
      .connect(buyer)
      .buyNFT(referrer1.address, { value: 100 });
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
    expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
  })
});
