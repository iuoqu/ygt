module.exports = (req, res) => {
  res.json({
    message: 'Hello from serverless function!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
