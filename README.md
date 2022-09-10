# algodex-sdk-examples
Examples of using the [Algodex SDK](https://github.com/algodex/algodex-sdk)

## Requirements

- Node.js version 16 or above
- Git

## Setup

First `git clone` the repository. Then from a terminal in the directory:

```
npm install
```

```
cp .env.testnet.example .env
```
Edit the .env file to your Algorand node and indexer endpoints, and add in your wallet mnemonic (without commas).

## Running

```
node simple-market-making-bot/simple-market-making-bot.js --assetId=<assetId>
```

## Testing

```
jest
```
