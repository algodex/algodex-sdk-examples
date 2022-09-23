
const getAccountExistsFromIndexer = async (account:string, indexer:any):Promise<boolean> => {
  try {
    const accountInfo =
      await indexer.lookupAccountByID(account).do();
    if (accountInfo?.account?.amount && accountInfo?.account?.amount > 0) {
      return true;
    } else {
      console.log(`account ${account} not found!`);
    }
  } catch (e) {
    console.log(`account ${account} not found!`);
    console.error(e);
  }

  // Unreachable
  return false;
};

export default getAccountExistsFromIndexer;

