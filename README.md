# ReferralRewards Smart Contract

This is a smart contract that allows users to earn referral rewards by referring other users to purchase an NFT (non-fungible token) from the contract. The first time your address is passed in as referrers address , you get referral percentage , on 2nd time, you get level1 percentage , on 3rd time , you get level2 percentage.

## Custom Errors

The following custom errors are defined in this contract:

- `Error__NotOwner()`: This error is thrown when a non-owner tries to perform a privileged action.
- `Error__AlreadyBought()`: This error is thrown when a user who has already purchased an NFT tries to purchase another one.
- `Error__NeverBought()`: This error is thrown when a user who has never purchased an NFT tries to claim referral rewards.
- `Error__NoReferralRewards()`: This error is thrown when a user who has no referral rewards tries to claim them.

## Contract Variables and Functions

### Variables

- `owner`: The address of the owner of the contract.
- `referralPercentage`: The percentage of the purchase amount to be paid as referral rewards.
- `level1Percentage`: The percentage of the purchase amount to be paid as level 1 referral rewards.
- `level2Percentage`: The percentage of the purchase amount to be paid as level 2 referral rewards.
- `MAX_LEVELS`: The maximum number of referral levels.
- `referrers`: A mapping of each address to their referrer's address.
- `level1Referrers`: A mapping of each address to their level 1 referrer's address.
- `level2Referrers`: A mapping of each address to their level 2 referrer's address.
- `isBuyer`: A mapping of each address to a boolean indicating whether they have purchased an NFT.
- `referralBalance`: A mapping of each address to their total referral balances.

### Functions

- `constructor`: The constructor that sets the owner of the contract and purchase amount to be set as rewards.
- `buyNFT`: A function to buy an NFT and pay referral rewards to the referrer and their first and second level referrers.
- `getReferralRewards`: A function to claim referral rewards.
- `updateReferralPercentages`: A function to update referral percentages, can be called by only owner.

## License

This smart contract is licensed under the MIT License.
