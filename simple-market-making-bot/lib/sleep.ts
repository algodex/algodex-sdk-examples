
// eslint-disable-next-line require-jsdoc
function sleep(ms:number):Promise<NodeJS.Timeout> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default sleep;
