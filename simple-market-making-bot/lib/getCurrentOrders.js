
const getCurrentOrders = async (escrowDB, indexer, openAccountSet) => {
  const currentEscrows = await escrowDB.allDocs({include_docs: true});
  currentEscrows.rows.forEach(escrow => {
    escrow.doc.order.escrowAddr = escrow.doc._id;
  });
  const escrowsWithBalances = [];
  const currentUnixTime = Math.round(Date.now()/1000);
  for (let i = 0; i < currentEscrows.rows.length; i++) {
    const escrow = currentEscrows.rows[i];
    const escrowAddr = escrow.doc.order.escrowAddr;
    const orderCreationTime = escrow.doc.order.unixTime || 0;
    // Assume new orders are still open
    const timeDiff = currentUnixTime - orderCreationTime;
    if (openAccountSet.has(escrowAddr) || timeDiff < 60) {
      escrowsWithBalances.push(escrow);
    }
  }
  const hasBalanceSet =
    new Set(escrowsWithBalances.map(escrow => escrow.doc.order.escrowAddr));
  const removeFromDBPromises = [];
  currentEscrows.rows.forEach(async escrow => {
    const addr = escrow.doc.order.escrowAddr;
    if (!hasBalanceSet.has(addr)) {
      removeFromDBPromises.push(escrowDB.remove(escrow.doc));
    }
  });
  await Promise.all(removeFromDBPromises).catch(function(e) {
    console.error(e);
  });
  return {rows: escrowsWithBalances};
};

module.exports = getCurrentOrders;
