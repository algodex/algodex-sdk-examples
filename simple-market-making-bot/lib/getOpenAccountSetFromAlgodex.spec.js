const getOpenAccountSetFromAlgodex = require('./getOpenAccountSetFromAlgodex');
jest.mock('axios', (req) => jest.fn((req) => {
  if (req.url.includes('orders')) {
    return {data: 
      {
    "sellASAOrdersInEscrow":[{"assetLimitPriceInAlgos":"206.787696179464","asaPrice":"206.787696179464","assetLimitPriceD":20678769617946444,"assetLimitPriceN":100000000000000,"algoAmount":498000,"asaAmount":48989,"assetId":15322902,"appId":22045522,"escrowAddress":"LAXFF7SYE67H7HYSDUJ4XQF6SNSB6PDG3XP5RPTBJSDXO2FJQAIQILVZKA","ownerAddress":"WYWRYK42XADLY3O62N52BOLT27DMPRA3WNBT2OBRT65N6OEZQWD4OSH6PI","version":6,"minimumExecutionSizeInAlgo":0,"round":22851351,"unix_time":1657922111,"formattedPrice":"206.787696","formattedASAAmount":"0.048989","decimals":6},{"assetLimitPriceInAlgos":"205.118729892415","asaPrice":"205.118729892415","assetLimitPriceD":2051187298924154,"assetLimitPriceN":10000000000000,"algoAmount":498000,"asaAmount":48989,"assetId":15322902,"appId":22045522,"escrowAddress":"GBUSLUZ3CE2LTEDMYU3WQ6DPL67NFUTXFPPWS23VKAXKKXKTEE66GK4ZKI","ownerAddress":"WYWRYK42XADLY3O62N52BOLT27DMPRA3WNBT2OBRT65N6OEZQWD4OSH6PI","version":6,"minimumExecutionSizeInAlgo":0,"round":22851351,"unix_time":1657922111,"formattedPrice":"205.118730","formattedASAAmount":"0.048989","decimals":6}],
    "buyASAOrdersInEscrow":[{"assetLimitPriceInAlgos":"203.691675862858","asaPrice":"203.691675862858","assetLimitPriceD":20369167586285770,"assetLimitPriceN":100000000000000,"algoAmount":9977566,"asaAmount":0,"assetId":3333,"appId":22045503,"escrowAddress":"FBHTTZ7AOYBYDSUMTFNBETHHCJKQ4DXHRYDCNCUEQRUDUFG555ZAFF47HA","ownerAddress":"WYWRYK42XADLY3O62N52BOLT27DMPRA3WNBT2OBRT65N6OEZQWD4OSH6PI","version":6,"minimumExecutionSizeInAlgo":0,"round":22851351,"unix_time":1657922111,"formattedPrice":"203.691676","formattedASAAmount":"0.048984","decimals":6},{"assetLimitPriceInAlgos":"203.077760198024","asaPrice":"203.077760198024","assetLimitPriceD":20307776019802384,"assetLimitPriceN":100000000000000,"algoAmount":9947491,"asaAmount":0,"assetId":15322902,"appId":22045503,"escrowAddress":"SH2DVOXVJE6K57YWGEGXDMASHBCFXHVY667IZ27USKMAERDKXMJCSTIMJI","ownerAddress":"WYWRYK42XADLY3O62N52BOLT27DMPRA3WNBT2OBRT65N6OEZQWD4OSH6PI","version":6,"minimumExecutionSizeInAlgo":0,"round":22851351,"unix_time":1657922111,"formattedPrice":"203.077760","formattedASAAmount":"0.048984","decimals":6}]
    }}
  }
}).mockName('axios'));
test('can get open account set', async () => {
  const openAccounts = await getOpenAccountSetFromAlgodex('testnet',
      'WYWRYK42XADLY3O62N52BOLT27DMPRA3WNBT2OBRT65N6OEZQWD4OSH6PI',
      15322902);
  const expectedAccounts = [
    "SH2DVOXVJE6K57YWGEGXDMASHBCFXHVY667IZ27USKMAERDKXMJCSTIMJI",
    "LAXFF7SYE67H7HYSDUJ4XQF6SNSB6PDG3XP5RPTBJSDXO2FJQAIQILVZKA",
    "GBUSLUZ3CE2LTEDMYU3WQ6DPL67NFUTXFPPWS23VKAXKKXKTEE66GK4ZKI"
  ];
  expect(openAccounts).toEqual(new Set(expectedAccounts));
});

