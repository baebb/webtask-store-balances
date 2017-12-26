'use strict';
const fetch = require('node-fetch');

const summaryUrl = 'https://wt-07d3444cd5d8561f1c4063625863e880-0.sandbox.auth0-extend.com/webtask-bitfinex-data-dev-getFinexData?summary=true';
const taskName = 'STORE_BALANCES';

module.exports = async function (ctx, cb) {
  console.log(`${taskName} NEW_STORE_BALANCES_REQUEST`);
  console.log(`${taskName} GETTING_WALLET_SUMMARY`);
  try {
    let res = await fetch(summaryUrl);
    if(res.ok) {
      let data = await res.json();
      cb(null, data);
    } else {
      throw new Error(res);
    }
  } catch(err) {
    console.log(`${taskName} FETCH_ERROR:`);
    console.log(err);
    cb(null, err);
  }
};