import mongoose from 'mongoose';
import { getConnection, DB_NAMES } from '../config/databases.js';

const newsletterSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced', 'pending'],
    default: 'pending'
  },
  source: {
    type: String,
    enum: ['landing', 'footer', 'popup', 'settings', 'admin'],
    default: 'landing'
  },
  preferences: {
    weeklyDigest: { type: Boolean, default: true },
    productUpdates: { type: Boolean, default: true },
    sustainabilityTips: { type: Boolean, default: true },
    communityNews: { type: Boolean, default: false },
    promotions: { type: Boolean, default: false }
  },
  confirmationToken: { type: String },
  confirmationExpires: { type: Date },
  confirmedAt: { type: Date },
  unsubscribedAt: { type: Date },
  unsubscribeReason: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    sparse: true 
  },
  tags: [{ type: String, trim: true }],
  engagementScore: { type: Number, default: 0 },
  lastEmailSentAt: { type: Date },
  totalEmailsReceived: { type: Number, default: 0 },
  totalEmailsOpened: { type: Number, default: 0 },
  totalEmailsClicked: { type: Number, default: 0 }
}, {
  timestamps: true,
  collection: 'newsletter_subscribers'
});

// Indexes
newsletterSubscriberSchema.index({ email: 1 }, { unique: true });
newsletterSubscriberSchema.index({ status: 1 });
newsletterSubscriberSchema.index({ createdAt: -1 });
newsletterSubscriberSchema.index({ userId: 1 }, { sparse: true });

// Static method to subscribe
newsletterSubscriberSchema.statics.subscribe = async function(email, options = {}) {
  const { name, source, preferences, ipAddress, userAgent, userId } = options;
  
  // Check if already exists
  let subscriber = await this.findOne({ email: email.toLowerCase() });
  
  if (subscriber) {
    // If unsubscribed, allow re-subscription
    if (subscriber.status === 'unsubscribed') {
      subscriber.status = 'active';
      subscriber.confirmedAt = new Date();
      subscriber.unsubscribedAt = null;
      subscriber.unsubscribeReason = null;
      if (preferences) subscriber.preferences = { ...subscriber.preferences, ...preferences };
      await subscriber.save();
      return { subscriber, isNew: false, resubscribed: true };
    }
    return { subscriber, isNew: false, resubscribed: false };
  }
  
  // Create new subscriber
  subscriber = await this.create({
    email: email.toLowerCase(),
    name,
    source: source || 'landing',
    status: 'active', // For now, auto-confirm. Can add email confirmation later
    confirmedAt: new Date(),
    preferences: preferences || {},
    ipAddress,
    userAgent,
    userId
  });
  
  return { subscriber, isNew: true, resubscribed: false };
};

// Static method to unsubscribe
newsletterSubscriberSchema.statics.unsubscribe = async function(email, reason = '') {
  const subscriber = await this.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      status: 'unsubscribed',
      unsubscribedAt: new Date(),
      unsubscribeReason: reason
    },
    { new: true }
  );
  
  return subscriber;
};

// Static method to get active subscriber count
newsletterSubscriberSchema.statics.getActiveCount = async function() {
  return await this.countDocuments({ status: 'active' });
};

// Static method to get subscribers for sending
newsletterSubscriberSchema.statics.getActiveSubscribers = async function(preferences = {}) {
  const query = { status: 'active' };
  
  // Filter by preferences if specified
  Object.keys(preferences).forEach(key => {
    if (preferences[key]) {
      query[`preferences.${key}`] = true;
    }
  });
  
  return await this.find(query).select('email name preferences');
};

let NewsletterSubscriber = null;

export const getNewsletterSubscriberModel = async () => {
  if (NewsletterSubscriber) return NewsletterSubscriber;
  
  const conn = await getConnection(DB_NAMES.MAIN);
  NewsletterSubscriber = conn.models.NewsletterSubscriber || 
    conn.model('NewsletterSubscriber', newsletterSubscriberSchema);
  return NewsletterSubscriber;
};

export default newsletterSubscriberSchema;
