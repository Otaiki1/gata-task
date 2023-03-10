# ReferralRewards Smart Contract

The ReferralRewards contract is a smart contract built on the Ethereum blockchain that implements a 3-tier level referral reward system for NFT sales. The system allows referrers to earn a certain percentage from three consecutive buyers of an NFT sale link that they shared.

## How it works

When a user shares a link to an NFT sale, they become the referrer for that sale. If someone clicks on the link and buys the NFT, the referrer earns a percentage of the sale price as a referral fee. This fee is split into three tiers: the referrer earns a percentage, as do the referrer's referrer and the referrer's referrer's referrer. The percentage earned at each tier can be set by the contract owner.

## Getting started

To use the ReferralRewards contract, you'll need to deploy it to the Ethereum network. You can do this using a tool like Remix or Truffle, or you can use a deployment script like the one provided in this repository.

Once the contract is deployed, you can interact with it using a web3 provider like Metamask or a library like Ethers.js. The contract provides the following functions:

### setReferralPercentage(uint256 percentage)

Sets the percentage of the sale price that the referrer earns as a referral fee.

### setLevel1Percentage(uint256 percentage)

Sets the percentage of the referral fee that the referrer's referrer earns.

### setLevel2Percentage(uint256 percentage)

Sets the percentage of the referral fee that the referrer's referrer's referrer earns.

### getReferral(address buyer)

Returns the referrer for the given buyer, as well as the referrer's referrer and the referrer's referrer's referrer (if they exist).

### buy(address referrer)

Allows a buyer to purchase an NFT using the given referrer's referral link.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
