'use strict';
'use latest';
const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const summaryUrl = 'https://wt-07d3444cd5d8561f1c4063625863e880-0.sandbox.auth0-extend.com/webtask-bitfinex-data-dev-getFinexData?summary=true';
const taskName = 'STORE_BALANCES';

module.exports = async function (ctx, cb) {
  console.log(`${taskName} NEW_STORE_BALANCES_REQUEST`);
  
  async function getBalances () {
    console.log(`${taskName} GETTING_WALLET_SUMMARY`);
    try {
      let res = await fetch(summaryUrl);
      if(res.ok) {
        let data = await res.json();
        return data;
      } else {
        throw new Error(res);
      }
    } catch(err) {
      console.log(`${taskName} FETCH_ERROR:`);
      return err;
    }
  }
  
  if (ctx.query.store === 'true') {
  
  } else {
    //ross just wants a live summary
    try {
      const balances = await getBalances();
      cb(null, balances);
    } catch (err) {
      console.log(err);
      cb(null, err)
    }
  }
};