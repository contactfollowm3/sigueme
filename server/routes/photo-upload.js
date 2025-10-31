const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for processing before S3 upload
const config = require('../config'); // Assuming your config file is one level up
const Tmer = require('../models/tmer'); // Assuming your Tmer model path relative to this file

// Configure AWS S3 client
const s3Client = new S3Client({
    region: config.AWS_REGION,
    credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
    }
});

// Helper function to generate a signed URL
async function generateSignedUrl(key) {
    const getObjectParams = {
        Bucket: config.S3_BUCKET,
        Key: key
    };
    return await getSignedUrl(
        s3Client,
        new GetObjectCommand(getObjectParams),
        { expiresIn: 60 * 60 * 24 * 7 } // 1 week expiration
    );
}

// Upload multiple photos for a specific Tmer
// Route: POST /api/v1/tmers/:tmerId/photos
router.post('/tmers/:tmerId/photos', upload.array('photos', 10), async (req, res) => { // 'photos' is the field name, 10 is max files
    try {
        const { tmerId } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            console.error('No files uploaded');
            return res.status(400).json({ error: 'No image files provided' });
        }

        const tmer = await Tmer.findById(tmerId);
        if (!tmer) {
            return res.status(404).json({ error: 'Tmer not found' });
        }

        const uploadedPhotoKeys = [];
        const uploadedPhotoUrls = [];

        for (const file of files) {
            const fileExtension = file.originalname.split('.').pop();
            // Store photos under a 'tmer-photos' prefix within the S3 bucket, grouped by tmerId
            const key = `tmer-photos/${tmerId}/${uuid.v4()}.${fileExtension}`; // Unique key per Tmer and photo

            const uploadParams = {
                Bucket: config.S3_BUCKET,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
            };

            await s3Client.send(new PutObjectCommand(uploadParams));
            console.log(`File uploaded to S3 successfully: ${key}`);

            uploadedPhotoKeys.push(key);
            const signedUrl = await generateSignedUrl(key);
            uploadedPhotoUrls.push(signedUrl);
        }

        // Store only the S3 keys in the MongoDB Tmer document's 'photos' array
        tmer.photos.push(...uploadedPhotoKeys);
        await tmer.save();

        res.json({
            message: 'Photos uploaded successfully',
            photos: uploadedPhotoUrls, // Send back signed URLs for immediate display
            keys: uploadedPhotoKeys // Also send back keys if needed for later operations (e.g., deletion)
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Photo upload failed',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get all photos for a specific Tmer (generate signed URLs)
// Route: GET /api/v1/tmers/:tmerId/photos
router.get('/tmers/:tmerId/photos', async (req, res) => {
    try {
        const { tmerId } = req.params;

        const tmer = await Tmer.findById(tmerId);
        if (!tmer) {
            return res.status(404).json({ error: 'Tmer not found' });
        }

        const signedUrls = [];
        // Iterate through the stored keys and generate signed URLs
        for (const key of tmer.photos) {
            const signedUrl = await generateSignedUrl(key);
            signedUrls.push({ key, url: signedUrl }); // Return both key and URL
        }

        res.json({ photos: signedUrls });

    } catch (error) {
        console.error('Photo URL generation error:', error);
        res.status(500).json({
            error: 'Failed to generate photo URLs',
            details: error.message
        });
    }
});

// Delete a photo from a Tmer
// Route: DELETE /api/v1/tmers/:tmerId/photos?key=<s3-key>
router.delete('/tmers/:tmerId/photos', async (req, res) => {
    try {
        const { tmerId } = req.params;
        const { key } = req.query; // Expecting the S3 key to delete

        if (!key) {
            return res.status(400).json({ error: 'Key parameter is required' });
        }

        const tmer = await Tmer.findById(tmerId);
        if (!tmer) {
            return res.status(404).json({ error: 'Tmer not found' });
        }

        // Remove the key from the Tmer's photos array in MongoDB
        const initialLength = tmer.photos.length;
        tmer.photos = tmer.photos.filter(photoKey => photoKey !== key);

        if (tmer.photos.length === initialLength) {
            // If length didn't change, the key wasn't found in the array
            return res.status(404).json({ error: 'Photo not found in Tmer photos' });
        }

        await tmer.save(); // Save the updated Tmer document

        // Delete the object from S3
        const deleteParams = {
            Bucket: config.S3_BUCKET,
            Key: key
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
        console.log(`Photo deleted from S3 successfully: ${key}`);

        res.json({ message: 'Photo deleted successfully' });

    } catch (error) {
        console.error('Photo deletion error:', error);
        res.status(500).json({
            error: 'Failed to delete photo',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;





/* const express = require('express');
const router = express.Router();
const UserCtrl = require('../controllers/user');
const upload = require('../services/image-upload'); // ✅ Needed for S3 upload

// Allow up to 5 images and 2 videos
const multiUpload = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 },
]);

router.post('/', UserCtrl.authMiddleware, (req, res) => {
  multiUpload(req, res, (err) => {
    if (err) {
      console.error('Upload Error:', err);
      return res.status(422).json({ error: err.message });
    }

    const imageUrls = (req.files?.images || []).map(file => file.location);
    const videoUrls = (req.files?.videos || []).map(file => file.location);

    return res.json({
      message: 'Profile media uploaded!',
      images: imageUrls,
      videos: videoUrls,
    });
  });
});

module.exports = router;
 */