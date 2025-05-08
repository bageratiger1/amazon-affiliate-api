import https from 'https';
import crypto from 'crypto';

export default async function handler(req, res) {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'No keyword provided' });
  }

  const accessKey = 'AKPABEPUXG1746724726';
  const secretKey = 'aZ1qOxFpZPWhaBLSXyePP4FABLWW+tivHfMqdG/a';
  const associateTag = 'bageratiger0e-21';
  const host = 'webservices.amazon.sa';
  const region = 'sa-east-1';
  const service = 'ProductAdvertisingAPI';
  const endpoint = `/paapi5/searchitems`;
  const method = 'POST';
  const payload = JSON.stringify({
    Keywords: keyword,
    Resources: [
      'Images.Primary.Medium',
      'ItemInfo.Title',
      'ItemInfo.Features',
      'Offers.Listings.Price'
    ],
    SearchIndex: 'All',
    PartnerTag: associateTag,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.sa'
  });

  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substr(0, 8);
  const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=UTF-8\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-encoding;content-type;host;x-amz-date';
  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
  const canonicalRequest = `${method}\n${endpoint}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;
  const kDate = crypto.createHmac('sha256', 'AWS4' + secretKey).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const options = {
    hostname: host,
    port: 443,
    path: endpoint,
    method: 'POST',
    headers: {
      'Content-Encoding': 'amz-1.0',
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Amz-Date': amzDate,
      'Authorization': authorizationHeader,
      'Host': host
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      try {
        const result = JSON.parse(data);
        const products = result.SearchResult?.Items?.map((item) => ({
          title: item.ItemInfo.Title.DisplayValue,
          image: item.Images.Primary.Medium.URL,
          price: item.Offers?.Listings[0]?.Price?.DisplayAmount || 'N/A',
          url: item.DetailPageURL
        })) || [];

        res.status(200).json({ data: products });
      } catch (err) {
        console.error('Error parsing API response', err);
        res.status(500).json({ error: 'Error parsing API response' });
      }
    });
  });

  request.on('error', (error) => {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  });

  request.write(payload);
  request.end();
}
