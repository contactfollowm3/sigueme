const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const config = require('../config');

// Configure AWS S3 client
const s3Client = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
  }
});

// Upload endpoint
router.post('/image-upload', upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request received'); // Debug log
    console.log(req.file); // 👈 this logs the file data sent from frontend
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No image file provided' });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const key = `uploads/${uuid.v4()}.${fileExtension}`;
/* 
    console.log('Preparing to upload to S3:', {
      bucket: config.S3_BUCKET,
      key: key,
      size: req.file.size
    });
 */
    // Upload parameters
    const uploadParams = {
      Bucket: config.S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    // Upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams));
    //console.log('File uploaded to S3 successfully');

    // Generate pre-signed URL for access
    const getObjectParams = {
      Bucket: config.S3_BUCKET,
      Key: key
    };

    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(getObjectParams),
      { expiresIn: 60 * 60 * 24 * 7 } // 1 week expiration
    );

    console.log('Generated signed URL:', signedUrl);

    res.json({ 
      signedUrl,
      key
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Image upload failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get signed URL endpoint
router.get('/image-url', async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) {
      return res.status(400).json({ error: 'Key parameter is required' });
    }

    const getObjectParams = {
      Bucket: config.S3_BUCKET,
      Key: key
    };

    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(getObjectParams),
      { expiresIn: 60 * 60 * 24 * 7 } // 1 week expiration
    );

    res.json({ signedUrl });

  } catch (error) {
    console.error('URL generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate image URL',
      details: error.message
    });
  }
});

module.exports = router;

