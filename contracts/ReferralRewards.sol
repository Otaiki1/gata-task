//SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

//Defining Custom errors
error Error__NotOwner();
error Error__AlreadyBought();
error Error__NeverBought();
error Error__NoReferralRewards();

contract ReferralRewards{
    // The owner of the contract
    address payable public owner;

    // The percentage of the purchase amount to be paid as referral rewards
    uint public referralPercentage;
    uint public level1Percentage;
    uint public level2Percentage;

    // Maximum number of referral levels
    uint constant MAX_LEVELS = 3;

    //a struct that contains each referrers details
    struct Referrer {
        address refereeAddress;
        uint refereeAmount;
    }

    // Mapping of each address to their referrer's address
    mapping(address => Referrer) public referrers;

    // Mapping of each address to their level 1 referrer's address
    mapping(address => mapping(address => Referrer)) public level1Referrers;

    // Mapping of each address to their level 2 referrer's address
    mapping(address => mapping(address => mapping(address => Referrer)))
        public level2Referrers;

    // Mapping of each address to a boolean indicating whether they have purchased an NFT
    mapping(address => bool) private isBuyer;

    //mapping of each address to their total referral balances
    mapping(address => uint) referralBalance;

    //events
    event ReferralRewardClaimed(address indexed user, uint reward);

    // Constructor that sets the owner of the contract and purchase amount to be set as rewards
    constructor(
        uint _referralPercent,
        uint _level1Percent,
        uint _level2Percent
    ) {
        owner = payable(msg.sender);
        referralPercentage = _referralPercent;
        level1Percentage = _level1Percent;
        level2Percentage = _level2Percent;
    }

    // Function to buy an NFT and pay referral rewards to the referrer and their first and second level referrers
    function buyNFT(address referrer) public payable {
        // Make sure the user hasn't already purchased an NFT
        if (isBuyer[msg.sender] || msg.sender == owner) {
            revert Error__AlreadyBought();
        }

        // Mark the user as a buyer
        isBuyer[msg.sender] = true;

        // Calculate the referral reward amounts
        uint256 referralAmount = (msg.value * referralPercentage) / 100;
        uint256 level1Amount = (msg.value * level1Percentage) / 100;
        uint256 level2Amount = (msg.value * level2Percentage) / 100;

        // Update referral data
        Referrer storage buyerReferrer = referrers[referrer];
        if (buyerReferrer.refereeAddress == address(0)) {
            // First time referred
            buyerReferrer.refereeAddress = msg.sender;
            buyerReferrer.refereeAmount = referralAmount;
            referralBalance[referrer] += referralAmount;
        } else if (
            level1Referrers[referrer][buyerReferrer.refereeAddress]
                .refereeAddress == address(0)
        ) {
            // Second time referred
            level1Referrers[referrer][buyerReferrer.refereeAddress] = Referrer(
                msg.sender,
                level1Amount
            );
            referralBalance[referrer] += level1Amount;
        } else {
            // Third time referred
            address payable level2Referrer = payable(
                level1Referrers[referrer][buyerReferrer.refereeAddress]
                    .refereeAddress
            );
            level2Referrers[referrer][
                buyerReferrer.refereeAddress
            ][level2Referrer] = Referrer(msg.sender, level2Amount);
            referralBalance[referrer] += level2Amount;
        }

        // Transfer the remaining amount to the contract owner
        (bool sent, ) = payable(owner).call{
            value: (msg.value - referralAmount - level1Amount - level2Amount)
        }("");
        require(sent, "Failed to send reward");
    }

    // Function to claim referral rewards
    function getReferralRewards() public {
        // Check if the user has any referral rewards to claim
        uint referralReward = referralBalance[msg.sender];
        if (referralReward == 0) {
            revert Error__NoReferralRewards();
        }

        // Reset the user's referral rewards
        referralBalance[msg.sender] = 0;

        // Send the reward amount to the user
        (bool sent, ) = payable(msg.sender).call{value: referralReward}("");
        require(sent, "Failed to send reward");

        // Emit an event for the reward transfer
        emit ReferralRewardClaimed(msg.sender, referralReward);
    }

    //function to update referral percentages , can be called by only owner
    function updateReferralPercentages(
        uint _referralPercent,
        uint _level1Percent,
        uint _level2Percent
    ) external {
        if (msg.sender != owner) {
            revert Error__NotOwner();
        }
        referralPercentage = _referralPercent;
        level1Percentage = _level1Percent;
        level2Percentage = _level2Percent;
    }

    //function to get the referrers balance
    function getReferralBalance(address _referral) public view returns (uint) {
        return referralBalance[_referral];
    }
}
