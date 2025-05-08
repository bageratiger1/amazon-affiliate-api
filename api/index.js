export default function handler(req, res) {
  const { keyword } = req.query;

  if (!keyword) {
    res.status(400).json({ error: 'No keyword provided' });
    return;
  }

  res.status(200).json({
    message: `You searched for: ${keyword}`,
    data: [
      {
        title: 'منتج تجريبي',
        image: 'https://via.placeholder.com/150',
        rating: '4.5',
        description: 'وصف المنتج',
        price: '$100',
        url: 'https://amazon.sa'
      }
    ]
  });
}
