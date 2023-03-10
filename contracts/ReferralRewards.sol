//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//Defining Custom errors
error Error__NotOwner();
error Error__AlreadyBought();
error Error__NeverBought();
error Error__NoReferralRewards();
contract ReferralRewards {
    // The owner of the contract
    address payable public owner;

    // The percentage of the purchase amount to be paid as referral rewards
    uint public referralPercentage ;
    uint public level1Percentage ;
    uint public level2Percentage ;

    // Maximum number of referral levels
    uint public constant MAX_LEVELS = 3;

    //a struct that contains each referrers details
    struct Referrer{
        address referrerAddress;
        uint referrerAmount;
    }

    // Mapping of each address to their referrer's address
    mapping(address => Referrer) public referrers;

    // Mapping of each address to their level 1 referrer's address
    mapping(address => mapping(address => Referrer)) public level1Referrers;

    // Mapping of each address to their level 2 referrer's address
    mapping(address => mapping(address => mapping(address => Referrer))) public level2Referrers;

    // Mapping of each address to a boolean indicating whether they have purchased an NFT
    mapping(address => bool) public isBuyer;

    //mapping of each address to their total referral balances
    mapping(address => uint) referralBalance;

    // Constructor that sets the owner of the contract and purchase amount to be set as rewards
    constructor(uint _referralPercent, uint _level1Percent, uint _level2Percent ) {
        owner = payable(msg.sender);
        referralPercentage = _referralPercent;
        level1Percentage = _level1Percent;
        level2Percentage = _level2Percent;
    }

    // Function to buy an NFT and pay referral rewards to the referrer and their first and second level referrers
    function buyNFT(address referrer) public payable {
        // Make sure the user hasn't already purchased an NFT
        if(isBuyer[msg.sender]){
            revert Error__AlreadyBought();
        }
        // Mark the user as a buyer
        isBuyer[msg.sender] = true;
        // Calculate the referral reward amounts
        uint referralAmount = (msg.value * referralPercentage) / 100;
        uint level1Amount = (msg.value * level1Percentage) / 100;
        uint level2Amount = (msg.value * level2Percentage) / 100;

        // Set variables to be used in function logic
        address payable level1Referrer;
        address payable level2Referrer;

        //check if referrer is a first time referred
        if(referrers[referrer].referrerAddress == address(0)){
            //update basic referrer
            referrers[msg.sender].referrerAddress  = referrer;
            referrers[msg.sender].referrerAmount = referralAmount;
            //update referral Balance
            referralBalance[referrer] += referralAmount;
        }else{
            level1Referrer = payable(referrers[referrer].referrerAddress);
            //if referrer isnt a first time referred, check if he is a second time referred
            if(level1Referrers[referrer][level1Referrer].referrerAddress == address(0)){
                //add to level1   
                level1Referrers[msg.sender][referrer].referrerAddress = level1Referrer;   
                level1Referrers[msg.sender][referrer].referrerAmount= level1Amount;  
                //update referral balance
                referralBalance[level1Referrer] += level1Amount; 
            }else{
                //add to level2
                level2Referrer = payable(level1Referrers[referrer][level1Referrer].referrerAddress);
                level2Referrers[msg.sender][referrer][level1Referrer].referrerAddress = level2Referrer;
                level2Referrers[msg.sender][referrer][level1Referrer].referrerAmount = level2Amount;
                 //update referral balance
                referralBalance[level2Referrer] += level2Amount; 
            }
        }
        

        // Transfer the remaining amount to the contract owner
        owner.transfer(
            msg.value - referralAmount - level1Amount - level2Amount
        );
    }

    // Function to claim referral rewards
    function getReferralRewards() public {
        // Make sure the user has purchased an NFT
        // if(!isBuyer[msg.sender]){
        //     revert Error__NeverBought();
        // }

        // Get the referral reward amounts for the user
        uint referralReward = referralBalance[msg.sender];

        // Make sure the user has referral rewards to claim
        if(referralReward == 0){
            revert Error__NoReferralRewards();
        }
        // Reset the user's referral rewards
        referralBalance[msg.sender] = 0;
       

        // Transfer the reward amount to the user
        payable(msg.sender).transfer(referralReward);
    }

    //function to update referral percentages , can be called by only owner
    function updateReferralPercentages(uint _referralPercent, uint _level1Percent, uint _level2Percent ) external{
        if(msg.sender != owner){
            revert Error__NotOwner();
        }
        referralPercentage = _referralPercent;
        level1Percentage = _level1Percent;
        level2Percentage = _level2Percent;
    }
}
