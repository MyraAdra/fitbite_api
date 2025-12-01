const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');


require('dotenv').config();
const { connectDB, getFeaturesCollection } = require('./db');
const { ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());



const port = process.env.PORT || 3000;


// // Temporary static test data
// let _MyFeatures = [
//   {
//     icon: 'bi bi-apple',
//     title: 'Apple Devices',
//     description: 'Apple Inc. (formerly Apple Computer Inc.) is an American computer and consumer electronics company famous for creating the iPhone, iPad and Macintosh computers. Apple is one of the largest companies globally with a market cap of more than $3 trillion'
//   },
//   {
//     icon: 'bi bi-android',
//     title: 'Android Devices',
//     description: 'Android devices are smartphones and other electronics powered by the Android operating system, developed by Google and based on a modified version of the Linux kernel.'
//   },
//   {
//     icon: 'bi bi-microsoft',
//     title: 'Microsoft Devices',
//     description: 'Microsoft Corporation is a leading American multinational technology company known for developing, manufacturing, licensing, and selling computer software, consumer electronics, personal computers, and related services.'
//   },
//   {
//     icon: 'bi bi-nintendo-switch',
//     title: 'Nintendo-switch Devices',
//     description: 'The Nintendo Switch is a hybrid video game console that transitions seamlessly between a home console (docked to a TV) and a portable handheld device.'
//   }
// ];

// Static GET endpoint for testing
// app.get('/features', (req, res) => {
//   try {
//     res.json(_MyFeatures);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch static features' });
//   }
// });



// // ➕ POST: Add a new feature (static for testing)
// app.post('/features', (req, res) => {
//   const newFeature = req.body;

//   if (!newFeature || !newFeature.title || !newFeature.description) {
//     return res.status(400).json({ error: 'title and description required' });
//   }

//   _MyFeatures.push(newFeature);
//   res.status(201).json({ message: 'Feature added successfully', feature: newFeature });
// });



// // Connect to MongoDB
// connectDB();

// // ✅ GET all features
// app.get('/features', async (req, res) => {
//   try {
//     const featuresCollection = getFeaturesCollection();
//     const features = await featuresCollection.find({}).toArray();
//     res.json(features);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch features' });
//   }
// });

// // ✅ CREATE a new feature
// app.post('/features', async (req, res) => {
//   try {
//     const featuresCollection = getFeaturesCollection();
//     const { icon, title, description } = req.body;

//     if (!icon || !title || !description) {
//       return res.status(400).json({ error: 'icon, title and description are required' });
//     }

//     const result = await featuresCollection.insertOne({ icon, title, description });
//     res.status(201).json({ message: 'Feature created', featureId: result.insertedId });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to create feature' });
//   }
// });

// // ✅ UPDATE a feature by ID
// app.put('/features/:id', async (req, res) => {
//   try {
//     const featuresCollection = getFeaturesCollection();
//     const { id } = req.params;
//     const { icon, title, description } = req.body;

//     const result = await featuresCollection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: { icon, title, description } }
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ error: 'Feature not found' });
//     }

//     res.json({ message: 'Feature updated' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to update feature' });
//   }
// });

// // ✅ DELETE a feature by ID
// app.delete('/features/:id', async (req, res) => {
//   try {
//     const featuresCollection = getFeaturesCollection();
//     const { id } = req.params;

//     const result = await featuresCollection.deleteOne({ _id: new ObjectId(id) });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ error: 'Feature not found' });
//     }

//     res.json({ message: 'Feature deleted' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to delete feature' });
//   }
// });


// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder where files will be saved
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // unique file name
  }
});

const upload = multer({ storage: storage });

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    fileUrl: `http://localhost:3000/uploads/${req.file.filename}`
  });
});


// Endpoint to list all images
app.get('/images', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan folder' });
    }

    // Filter only image files (optional)
    const images = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
    });

    // Return full URLs
    const imageUrls = images.map(img => `${req.protocol}://${req.get('host')}/uploads/${img}`);
    res.json(imageUrls);
  });
});



// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
