const crypto = require('crypto');
const https = require('https');

module.exports = async (req, res) => {
  const { keyword } = req.query;

  const accessKey = 'AKPABEPUXG1746724726';
  const secretKey = 'aZ1qOxFpZPWhaBLSXyePP4FABLWW';
  const partnerTag = 'bageratiger0e-21';
  const region = 'sa';

  const endpoint = 'webservices.amazon.sa';
  const uri = '/paapi5/searchitems';
  const payload = JSON.stringify({
    Keywords: keyword,
    Resources: [
      "Images.Primary.Large",
      "ItemInfo.Title",
      "ItemInfo.Features",
      "ItemInfo.CustomerReviews",
      "Offers.Listings.Price"
    ],
    PartnerTag: partnerTag,
    PartnerType: "Associates",
    Marketplace: "www.amazon.sa"
  });

  const amzdate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzdate.slice(0, 8);
  const service = 'ProductAdvertisingAPI';

  const headers = {
    'Content-Encoding': 'amz-1.0',
    'Content-Type': 'application/json; charset=UTF-8',
    'Host': endpoint,
    'X-Amz-Date': amzdate
  };

  const canonicalHeaders = Object.keys(headers)
    .map(key => `${key.toLowerCase()}:${headers[key]}\n`)
    .join('');

  const signedHeaders = Object.keys(headers)
    .map(key => key.toLowerCase())
    .sort()
    .join(';');

  const canonicalRequest = [
    'POST',
    uri,
    '',
    canonicalHeaders,
    signedHeaders,
    crypto.createHash('sha256').update(payload).digest('hex')
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzdate,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');

  const getSignatureKey = (key, dateStamp, regionName, serviceName) => {
    const kDate = crypto.createHmac('sha256', 'AWS4' + key).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    return crypto.createHmac('sha256', kService).update('aws4_request').digest();
  };

  const signature = crypto.createHmac('sha256', getSignatureKey(secretKey, dateStamp, region, service))
    .update(stringToSign)
    .digest('hex');

  const authorizationHeader = [
    'AWS4-HMAC-SHA256 Credential=' + accessKey + '/' + credentialScope,
    'SignedHeaders=' + signedHeaders,
    'Signature=' + signature
  ].join(', ');

  headers.Authorization = authorizationHeader;

  const options = {
    hostname: endpoint,
    path: uri,
    method: 'POST',
    headers
  };

  const request = https.request(options, response => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      res.status(200).json(JSON.parse(data));
    });
  });

  request.on('error', error => {
    res.status(500).json({ error: error.message });
  });

  request.write(payload);
  request.end();
};
