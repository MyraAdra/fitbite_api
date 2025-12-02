// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');

require('dotenv').config();
const { connectDB, getFeaturesCollection, getServicesCollection, getTestimonialCollection, getDb, getPortfolioCollection } = require('./db');

const { ObjectId, GridFSBucket } = require("mongodb");


const app = express();
//app.use(cors());
app.use(cors({
  origin: "https://myraadra.github.io"
}));
app.use(express.json());


// Configure Nodemailer with Gmail
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'trainingweb0@gmail.com',
//     pass: 'Web0Training' // Use an App Password if 2FA is enabled
//   }
// });


// Set storage engine
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // folder where files will be saved
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname); // unique file name
//   }
// });

// // File filter for images only
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image files are allowed!'), false);
//   }
// };

// const upload = multer({ storage, fileFilter });


let bucket;

// Memory storage → we save buffer directly to GridFS
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPG & PNG allowed"), false);
  },
});


const port = process.env.PORT || 3000;

//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//app.use('/rony', express.static(path.join(__dirname, 'rony')));

// Connect to MongoDB
connectDB();

//===========================================================================
// FEATURES
//===========================================================================
// ✅ GET all features
app.get('/features', async (req, res) => {
  try {
    const featuresCollection = getFeaturesCollection();
    const features = await featuresCollection.find({}).toArray();
    res.json(features);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

// ✅ CREATE a new feature
app.post('/features', async (req, res) => {
  try {
    const featuresCollection = getFeaturesCollection();
    const { icon, title, description } = req.body;

    if (!icon || !title || !description) {
      return res.status(400).json({ error: 'icon, title and description are required' });
    }

    const result = await featuresCollection.insertOne({ icon, title, description });
    res.status(201).json({ message: 'Feature created', featureId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create feature' });
  }
});

// ✅ UPDATE a feature by ID
app.put('/features/:id', async (req, res) => {
  try {
    const featuresCollection = getFeaturesCollection();
    const { id } = req.params;
    const { icon, title, description } = req.body;

    const result = await featuresCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { icon, title, description } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    res.json({ message: 'Feature updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update feature' });
  }
});

// ✅ DELETE a feature by ID
app.delete('/features/:id', async (req, res) => {
  try {
    const featuresCollection = getFeaturesCollection();
    const { id } = req.params;

    const result = await featuresCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    res.json({ message: 'Feature deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete feature' });
  }
});


//===========================================================================
// SERVICES
//===========================================================================

// GET all services
app.get('/services', async (req, res) => {
  try {
    const services = await getServicesCollection().find({}).toArray();
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// CREATE a service
app.post('/services', async (req, res) => {
  try {
    const { icon, title, description } = req.body;

    if (!icon || !title || !description) {
      return res.status(400).json({ error: 'icon, title & description required' });
    }

    const result = await getServicesCollection().insertOne({ icon, title, description });
    res.status(201).json({ message: 'Service created', serviceId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// UPDATE a service
app.put('/services/:id', async (req, res) => {
  try {
    const { icon, title, description } = req.body;
    const result = await getServicesCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { icon, title, description } }
    );

    if (!result.matchedCount)
      return res.status(404).json({ error: 'Service not found' });

    res.json({ message: 'Service updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// DELETE a service
app.delete('/services/:id', async (req, res) => {
  try {
    const result = await getServicesCollection().deleteOne({ _id: new ObjectId(req.params.id) });

    if (!result.deletedCount)
      return res.status(404).json({ error: 'Service not found' });

    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});


//===========================================================================
// TESTIMONIALS
//===========================================================================
// GET all testimonials
app.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await getTestimonialCollection().find({}).toArray();
    res.json(testimonials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// CREATE a new testimonial
app.post('/testimonials', async (req, res) => {
  try {
    const { name, city, stars, review } = req.body;

    if (!name || !city || !stars || !review) {
      return res.status(400).json({ error: 'name, city, stars, review required' });
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Stars must be between 1 and 5' });
    }

    const result = await getTestimonialCollection().insertOne({
      name,
      city,
      stars,
      review
    });

    res.status(201).json({ message: 'Testimonial added', id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add testimonial' });
  }
});

// UPDATE a testimonial
app.put('/testimonials/:id', async (req, res) => {
  try {
    const { name, city, stars, review } = req.body;

    const result = await getTestimonialCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, city, stars, review } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// DELETE a testimonial
app.delete('/testimonials/:id', async (req, res) => {
  try {
    const result = await getTestimonialCollection().deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});
//===========================================================================
// IMAGES + UPLOAD
//===========================================================================

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



app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    fileUrl: `http://localhost:3000/uploads/${req.file.filename}`
  });
});


//===========================================================================
// SEND EMAIL
//===========================================================================

// Endpoint to send email
// app.post('/send-email', async (req, res) => {
//   const { name, subject, message, to } = req.body;

//   if (!name || !subject || !message || !to) {
//     return res.status(400).json({ error: 'Name, subject, message, and recipient email are required.' });
//   }

//   const mailOptions = {
//     from: 'trainingweb0@gmail.com',
//     to, // recipient email
//     subject: subject,
//     text: `Name: ${name}\n\nMessage:\n${message}`
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     res.json({ success: true, info });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Start server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

//===========================================================================
// UPLOAD IMAGES WITH GRIDFS
// ===========================================================================

app.get("/portfolio", async (req, res) => {
  const portfolioCollection = getPortfolioCollection();
  const items = await portfolioCollection.find({}).sort({ createdAt: -1 }).toArray();
  const mapped = items.map(item => ({
    _id: item._id,
    title: item.title,
    imageUrl: `/portfolio/image/${item.fileId}`,
  }));
  res.json(mapped);
});



app.post("/portfolio", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image" });

    const { title } = req.body;
    const file = req.file;

    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype
    });

    uploadStream.write(file.buffer);
    uploadStream.end();

    uploadStream.on("finish", async () => {
      try {
        const fileId = uploadStream.id; // <-- Use this instead!

        const portfolioCollection = getPortfolioCollection();
        const doc = {
          title: title || "Untitled",
          fileId: fileId,
          createdAt: new Date()
        };

        const result = await portfolioCollection.insertOne(doc);
        res.status(201).json({
          message: "Portfolio item created",
          id: result.insertedId,
          imageId: fileId
        });

      } catch (dbError) {
        console.error(dbError);
        res.status(500).json({ error: 'Failed to save document' });
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unexpected error uploading image" });
  }
});

app.get("/portfolio/image/:id", (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);

    bucket.openDownloadStream(fileId)
      .on("error", () => res.status(404).json({ error: "Image not found" }))
      .pipe(res);
  } catch {
    res.status(400).json({ error: "Invalid id" });
  }
});


app.delete("/portfolio/:id", async (req, res) => {
  const portfolioCollection = getPortfolioCollection();
  const docId = new ObjectId(req.params.id);
  const doc = await portfolioCollection.findOne({ _id: docId });
  if (!doc) return res.status(404).json({ error: "Not found" });

  await bucket.delete(new ObjectId(doc.fileId));
  await portfolioCollection.deleteOne({ _id: docId });

  res.json({ message: "Deleted" });
});



//NEW START SERVER FOR IMAGE UPLOAD
async function startServer() {
  await connectDB();
  const db = getDb();
  bucket = new GridFSBucket(db, { bucketName: "portfolioImages" });

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API running on ${port}`));
}

startServer().catch(console.error);
