'use strict';
'use latest';
const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const _ = require('lodash');


const summaryUrl = 'https://wt-07d3444cd5d8561f1c4063625863e880-0.sandbox.auth0-extend.com/webtask-bitfinex-data-dev-getFinexData?summary=true';
const taskName = 'STORE_BALANCES';

module.exports = async function (ctx, cb) {
  console.log(`${taskName} NEW_STORE_BALANCES_REQUEST`);
  const dynamoDB = new AWS.DynamoDB.DocumentClient({
    accessKeyId: ctx.secrets.AWS_ACCESS_KEY_ID,
    secretAccessKey: ctx.secrets.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
  });
  
  async function storeBalance(user, balance) {
    const params = {
      TableName: 'CWbalanceData',
      Key: { user: user },
      UpdateExpression: 'set #balances = list_append(if_not_exists(#balances, :empty_list), :balance)',
      ExpressionAttributeNames: {
        '#balances': 'balances',
      },
      ExpressionAttributeValues: {
        ':balance': [balance],
        ':empty_list': [],
      }
    };
    
    try {
      await dynamoDB.update(params).promise();
      console.log(`BALANCE_STORED_SUCCESS ${user}`);
      return { dbUpdateSuccess: true };
    } catch (err) {
      console.log(`BALANCE_STORE_ERROR:`);
      throw new Error(err);
    }
  }
  
  async function getBalances(userKey, userSecret) {
    console.log(`${taskName} GETTING_WALLET_SUMMARY`);
    try {
      let res = await fetch(`${summaryUrl}&userkey=${userKey}&userSecret=${userSecret}`);
      if (res.ok) {
        let data = await res.json();
        return data;
      } else {
        throw new Error(res);
      }
    } catch (err) {
      console.log(`${taskName} FETCH_ERROR:`);
      throw new Error(err);
    }
  }
  
  const user = _.get(ctx.secrets,'USER_NAME', null);
  const userKey = _.get(ctx.secrets,'BITFINEX_API_KEY', null);
  const userSecret = _.get(ctx.secrets,'BITFINEX_API_SECRET', null);
  if (ctx.query.store === 'true') {
    try {
      const balances = await getBalances(userKey, userSecret);
      const saveBalance = await storeBalance(user, balances);
      cb(null, saveBalance);
    } catch (err) {
      console.log(err);
      cb(null, { error: true, name: err.name, message: err.message })
    }
  } else {
    //ross just wants a live summary
    try {
      const balances = await getBalances(userKey, userSecret);
      cb(null, balances);
    } catch (err) {
      console.log(err);
      cb(null, { error: true, name: err.name, message: err.message })
    }
  }
};