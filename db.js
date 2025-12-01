// db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const client = new MongoClient(uri);

let db;
let featuresCollection;
let servicesCollection;
let pricingCollection;
let testimonialCollection;
let portfolioCollection;


async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    featuresCollection = db.collection('features'); // Your collection name
    servicesCollection = db.collection('services');
    pricingCollection = db.collection('pricings');
    portfolioCollection = db.collection('portfolio');
    testimonialCollection = db.collection('testimonials');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

function getFeaturesCollection() {
  if (!featuresCollection) {
    throw new Error('Database not connected yet!');
  }
  return featuresCollection;
}

function getServicesCollection() {
  if (!servicesCollection) throw new Error('Database not connected yet!');
  return servicesCollection;
}

function getPricingCollection() {
  if (!pricingCollection) throw new Error('Database not connected yet!');
  return pricingCollection;
}

function getTestimonialCollection() {
  if (!testimonialCollection) throw new Error('Database not connected yet!');
  return testimonialCollection;
}

function getDb() {
  if (!db) throw new Error("DB not connected yet!");
  return db;
}

function getPortfolioCollection() {
  if (!portfolioCollection) throw new Error("Portfolio collection not ready!");
  return portfolioCollection;
}

module.exports = { connectDB, getDb, getPortfolioCollection, getFeaturesCollection,getServicesCollection,getPricingCollection, getTestimonialCollection  };
