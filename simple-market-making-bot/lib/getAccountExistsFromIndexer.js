
const getAccountExistsFromIndexer = async (account, indexer) => {
  try {
    const accountInfo =
      await indexer.lookupAccountByID(account).do();
    // console.log('Information for Account: ' + JSON.stringify(accountInfo, undefined, 2));
    if (accountInfo?.account?.amount && accountInfo?.account?.amount > 0) {
      return true;
    } else {
      console.log(`account ${account} not found!`);
    }
  } catch (e) {
    console.log(`account ${account} not found!`);
    console.error(e);
  }
};

module.exports = getAccountExistsFromIndexer;