const https = require('https');
const cloudinary = require('cloudinary').v2;
const { getDb } = require('../mongoDb');
const config = require('../config/env');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.getAllData = async (req, res) => {
  const doc = await getDb().collection('PersonalData').findOne({});

  if (!doc) {
    res.status(404).json({ message: 'Portfolio data not found' });
    return;
  }

  // Kept as an array for backwards compatibility with older clients.
  res.json([doc]);
};

exports.streamCv = async (req, res) => {
  const doc = await getDb().collection('PersonalData').findOne({});
  const publicId = doc?.resume?.publicId || doc?.cvPublicId;

  if (!publicId) {
    res.status(404).json({ message: 'CV not found' });
    return;
  }

  const cvUrl = cloudinary.url(publicId, {
    secure: true,
    resource_type: 'raw',
    format: 'pdf'
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="balaji-cv.pdf"');

  https
    .get(cvUrl, (cvResponse) => {
      if (cvResponse.statusCode && cvResponse.statusCode >= 400) {
        cvResponse.resume();
        res.status(502).json({ message: 'Failed to fetch CV' });
        return;
      }
      cvResponse.pipe(res);
    })
    .on('error', (error) => {
      console.error('[cv] stream failed', error.message, config.isProd ? '' : cvUrl);
      if (!res.headersSent) {
        res.status(502).json({ message: 'Failed to fetch CV' });
      } else {
        res.end();
      }
    });
};
