import axios from 'axios';

export default async function handler(req, res) {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'No keyword provided' });
  }

  try {
    // مثال بيانات تجريبية بدل API أمازون
    const products = [
      {
        title: 'ساعة ذكية',
        image: 'https://via.placeholder.com/150',
        rating: '4.5',
        description: 'وصف المنتج',
        price: '$100',
        url: 'https://www.amazon.sa'
      },
      {
        title: 'سماعات بلوتوث',
        image: 'https://via.placeholder.com/150',
        rating: '4.2',
        description: 'وصف السماعات',
        price: '$50',
        url: 'https://www.amazon.sa'
      }
    ];

    res.status(200).json({
      message: `You searched for: ${keyword}`,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
