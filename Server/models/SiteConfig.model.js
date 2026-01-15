import mongoose from 'mongoose';
import { getConnection, DB_NAMES } from '../config/databases.js';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  avatar: { type: String, default: '/avatars/default.png' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: true });

const featureSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  icon: { type: String, required: true }, // Icon name (e.g., 'leaf', 'users', 'target')
  color: { type: String, default: 'green' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: true });

const socialLinkSchema = new mongoose.Schema({
  platform: { 
    type: String, 
    required: true, 
    enum: ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'github', 'discord'] 
  },
  url: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true }
}, { _id: true });

const footerLinkSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true,
    enum: ['product', 'company', 'resources', 'legal']
  },
  label: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  isExternal: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: true });

const quickReplySchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  action: { type: String, required: true, trim: true },
  icon: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { _id: true });

const helpCategorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  icon: { type: String, required: true },
  topics: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: true });

const siteConfigSchema = new mongoose.Schema({
  // Config key for different sections
  key: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['landing', 'chatbot', 'footer', 'social', 'newsletter', 'general']
  },

  // Landing Page Configuration
  landing: {
    heroTitle: { type: String, default: 'Track Your Carbon Impact' },
    heroSubtitle: { type: String, default: 'Join thousands reducing their carbon footprint with our AI-powered tracking platform' },
    features: [featureSchema],
    testimonials: [testimonialSchema],
    stats: {
      activeUsers: { type: String, default: '10K+' },
      carbonReduction: { type: String, default: '30%' },
      monthlyGrowth: { type: String, default: '15%' },
      useDynamicStats: { type: Boolean, default: true } // When true, fetch from database
    },
    ctaText: { type: String, default: 'Start Your Journey' },
    ctaSecondaryText: { type: String, default: 'Learn More' }
  },

  // Footer Configuration
  footer: {
    companyName: { type: String, default: 'GreenCommunity' },
    description: { type: String, default: 'Empowering communities to build a sustainable future together' },
    copyrightYear: { type: Number, default: new Date().getFullYear() },
    links: [footerLinkSchema]
  },

  // Social Links Configuration
  social: {
    links: [socialLinkSchema]
  },

  // Chatbot Configuration
  chatbot: {
    welcomeMessage: { type: String, default: 'Hello! I\'m your GreenCommunity assistant.' },
    fallbackMessage: { type: String, default: 'I\'m not sure I understand. Could you rephrase that?' },
    quickReplies: [quickReplySchema],
    helpCategories: [helpCategorySchema],
    isEnabled: { type: Boolean, default: true }
  },

  // Newsletter Configuration
  newsletter: {
    title: { type: String, default: 'Stay Updated' },
    description: { type: String, default: 'Get the latest sustainability tips and updates' },
    buttonText: { type: String, default: 'Subscribe' },
    isEnabled: { type: Boolean, default: true }
  },

  // General Settings
  general: {
    siteName: { type: String, default: 'GreenCommunity' },
    siteDescription: { type: String, default: 'Carbon footprint tracking and sustainability platform' },
    contactEmail: { type: String, default: 'contact@greencommunity.app' },
    supportEmail: { type: String, default: 'support@greencommunity.app' },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'We are currently undergoing maintenance. Please check back soon.' }
  },

  // Metadata
  isActive: { type: Boolean, default: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  collection: 'siteconfigs'
});

// Indexes for faster queries
siteConfigSchema.index({ key: 1 });
siteConfigSchema.index({ isActive: 1 });

// Default configurations for each section
const DEFAULT_CONFIGS = {
  landing: {
    heroTitle: 'Track Your Carbon Impact',
    heroSubtitle: 'Join thousands reducing their carbon footprint with our AI-powered tracking platform',
    features: [
      { title: 'Track Your Footprint', description: 'Monitor your daily carbon emissions with our AI-powered tracking system', icon: 'leaf', color: 'green', isActive: true, order: 0 },
      { title: 'Join Community', description: 'Connect with eco-conscious individuals and share sustainable practices', icon: 'users', color: 'blue', isActive: true, order: 1 },
      { title: 'Set Goals', description: 'Create personalized sustainability targets and track your progress', icon: 'target', color: 'orange', isActive: true, order: 2 },
      { title: 'Earn Rewards', description: 'Get recognized for your efforts with badges and achievements', icon: 'trophy', color: 'yellow', isActive: true, order: 3 },
      { title: 'Offset Carbon', description: 'Support verified carbon offset projects worldwide', icon: 'globe', color: 'teal', isActive: true, order: 4 },
      { title: 'Learn & Grow', description: 'Access resources and tips to improve your environmental impact', icon: 'book', color: 'purple', isActive: true, order: 5 }
    ],
    testimonials: [
      { name: 'Priya Sharma', role: 'Environmental Activist', content: 'GreenCommunity has transformed how I track my carbon footprint. The insights are incredibly helpful!', avatar: '/avatars/priya.png', rating: 5, isActive: true, order: 0 },
      { name: 'Rahul Patel', role: 'Software Engineer', content: 'Love the gamification aspects! It makes sustainability fun and engaging.', avatar: '/avatars/rahul.png', rating: 5, isActive: true, order: 1 },
      { name: 'Anita Desai', role: 'Sustainability Consultant', content: 'The community features help me connect with like-minded people. Highly recommend!', avatar: '/avatars/anita.png', rating: 5, isActive: true, order: 2 }
    ],
    stats: {
      activeUsers: '10K+',
      carbonReduction: '30%',
      monthlyGrowth: '15%',
      useDynamicStats: true
    },
    ctaText: 'Start Your Journey',
    ctaSecondaryText: 'Learn More'
  },
  footer: {
    companyName: 'GreenCommunity',
    description: 'Empowering communities to build a sustainable future together',
    copyrightYear: new Date().getFullYear(),
    links: [
      { category: 'product', label: 'Dashboard', url: '/dashboard', isActive: true, order: 0 },
      { category: 'product', label: 'Calculator', url: '/CarbonCalculator', isActive: true, order: 1 },
      { category: 'product', label: 'Marketplace', url: '/marketplace', isActive: true, order: 2 },
      { category: 'product', label: 'Projects', url: '/projects', isActive: true, order: 3 },
      { category: 'company', label: 'Community', url: '/community', isActive: true, order: 0 },
      { category: 'company', label: 'Settings', url: '/settings', isActive: true, order: 1 },
      { category: 'resources', label: 'Footprint Log', url: '/footprintlog', isActive: true, order: 0 },
      { category: 'resources', label: 'Marketplace', url: '/marketplace', isActive: true, order: 1 },
      { category: 'legal', label: 'Login', url: '/login', isActive: true, order: 0 },
      { category: 'legal', label: 'Sign Up', url: '/Signup', isActive: true, order: 1 }
    ]
  },
  social: {
    links: [
      { platform: 'twitter', url: 'https://twitter.com/greencommunity', isActive: true },
      { platform: 'facebook', url: 'https://facebook.com/greencommunity', isActive: true },
      { platform: 'instagram', url: 'https://instagram.com/greencommunity', isActive: true },
      { platform: 'linkedin', url: 'https://linkedin.com/company/greencommunity', isActive: true },
      { platform: 'github', url: 'https://github.com/greencommunity', isActive: true }
    ]
  },
  chatbot: {
    welcomeMessage: 'Hello! 👋 I\'m your GreenCommunity assistant. How can I help you today?',
    fallbackMessage: 'I\'m not sure I understand. Could you rephrase that, or try one of the quick options below?',
    quickReplies: [
      { text: 'Calculate Footprint', action: 'calculate', icon: 'calculator', order: 0, isActive: true },
      { text: 'View Dashboard', action: 'dashboard', icon: 'layout', order: 1, isActive: true },
      { text: 'Explore Projects', action: 'projects', icon: 'globe', order: 2, isActive: true },
      { text: 'Get Help', action: 'help', icon: 'help-circle', order: 3, isActive: true }
    ],
    helpCategories: [
      {
        id: 'carbon-tracking',
        title: 'Carbon Tracking',
        description: 'Learn about tracking your carbon footprint',
        icon: 'leaf',
        topics: [
          { question: 'How do I log my activities?', answer: 'Go to the Footprint Log page and click "Add Activity" to record your daily activities.' },
          { question: 'How is my carbon footprint calculated?', answer: 'We use IPCC emission factors to calculate the CO2 equivalent of each activity you log.' }
        ],
        isActive: true,
        order: 0
      },
      {
        id: 'marketplace',
        title: 'Marketplace',
        description: 'Help with buying and selling eco-friendly products',
        icon: 'shopping-bag',
        topics: [
          { question: 'How do I buy products?', answer: 'Browse the Marketplace, add items to cart, and proceed to checkout.' },
          { question: 'How do I become a seller?', answer: 'Go to Settings > Seller Profile and complete the verification process.' }
        ],
        isActive: true,
        order: 1
      }
    ],
    isEnabled: true
  },
  newsletter: {
    title: 'Stay Updated',
    description: 'Get the latest sustainability tips and updates',
    buttonText: 'Subscribe',
    isEnabled: true
  },
  general: {
    siteName: 'GreenCommunity',
    siteDescription: 'Carbon footprint tracking and sustainability platform',
    contactEmail: 'contact@greencommunity.app',
    supportEmail: 'support@greencommunity.app',
    maintenanceMode: false,
    maintenanceMessage: 'We are currently undergoing maintenance. Please check back soon.'
  }
};

// Static method to get config by key (auto-seeds if not exists)
siteConfigSchema.statics.getConfig = async function(key) {
  let config = await this.findOne({ key, isActive: true });
  
  // If no config exists, create with full default data
  if (!config) {
    const defaultData = DEFAULT_CONFIGS[key] || {};
    config = await this.create({ 
      key,
      [key]: defaultData
    });
  }
  
  return config;
};

// Static method to update config
siteConfigSchema.statics.updateConfig = async function(key, updates, userId) {
  const config = await this.findOneAndUpdate(
    { key },
    { 
      ...updates, 
      lastUpdatedBy: userId 
    },
    { 
      new: true, 
      upsert: true,
      runValidators: true 
    }
  );
  return config;
};

// Static method to add a feature
siteConfigSchema.statics.addFeature = async function(feature, userId) {
  const config = await this.getConfig('landing');
  const maxOrder = config.landing.features.length > 0 
    ? Math.max(...config.landing.features.map(f => f.order)) + 1 
    : 0;
  
  config.landing.features.push({ ...feature, order: feature.order ?? maxOrder });
  config.lastUpdatedBy = userId;
  await config.save();
  return config;
};

// Static method to update a feature
siteConfigSchema.statics.updateFeature = async function(featureId, updates, userId) {
  const config = await this.findOneAndUpdate(
    { key: 'landing', 'landing.features._id': featureId },
    { 
      $set: { 
        'landing.features.$': { ...updates, _id: featureId },
        lastUpdatedBy: userId
      }
    },
    { new: true }
  );
  return config;
};

// Static method to delete a feature
siteConfigSchema.statics.deleteFeature = async function(featureId, userId) {
  const config = await this.findOneAndUpdate(
    { key: 'landing' },
    { 
      $pull: { 'landing.features': { _id: featureId } },
      $set: { lastUpdatedBy: userId }
    },
    { new: true }
  );
  return config;
};

// Static method to add a testimonial
siteConfigSchema.statics.addTestimonial = async function(testimonial, userId) {
  const config = await this.getConfig('landing');
  const maxOrder = config.landing.testimonials.length > 0 
    ? Math.max(...config.landing.testimonials.map(t => t.order)) + 1 
    : 0;
  
  config.landing.testimonials.push({ ...testimonial, order: testimonial.order ?? maxOrder });
  config.lastUpdatedBy = userId;
  await config.save();
  return config;
};

// Static method to update a testimonial
siteConfigSchema.statics.updateTestimonial = async function(testimonialId, updates, userId) {
  const config = await this.findOneAndUpdate(
    { key: 'landing', 'landing.testimonials._id': testimonialId },
    { 
      $set: { 
        'landing.testimonials.$': { ...updates, _id: testimonialId },
        lastUpdatedBy: userId
      }
    },
    { new: true }
  );
  return config;
};

// Static method to delete a testimonial
siteConfigSchema.statics.deleteTestimonial = async function(testimonialId, userId) {
  const config = await this.findOneAndUpdate(
    { key: 'landing' },
    { 
      $pull: { 'landing.testimonials': { _id: testimonialId } },
      $set: { lastUpdatedBy: userId }
    },
    { new: true }
  );
  return config;
};

// Static method to add a footer link
siteConfigSchema.statics.addFooterLink = async function(link, userId) {
  const config = await this.getConfig('footer');
  const categoryLinks = config.footer.links.filter(l => l.category === link.category);
  const maxOrder = categoryLinks.length > 0 
    ? Math.max(...categoryLinks.map(l => l.order)) + 1 
    : 0;
  
  config.footer.links.push({ ...link, order: link.order ?? maxOrder });
  config.lastUpdatedBy = userId;
  await config.save();
  return config;
};

// Static method to update a footer link
siteConfigSchema.statics.updateFooterLink = async function(linkId, updates, userId) {
  const config = await this.findOneAndUpdate(
    { key: 'footer', 'footer.links._id': linkId },
    { 
      $set: { 
        'footer.links.$': { ...updates, _id: linkId },
        lastUpdatedBy: userId
      }
    },
    { new: true }
  );
  return config;
};

// Static method to delete a footer link
siteConfigSchema.statics.deleteFooterLink = async function(linkId, userId) {
  const config = await this.findOneAndUpdate(
    { key: 'footer' },
    { 
      $pull: { 'footer.links': { _id: linkId } },
      $set: { lastUpdatedBy: userId }
    },
    { new: true }
  );
  return config;
};

// Static method to add a social link
siteConfigSchema.statics.addSocialLink = async function(link, userId) {
  const config = await this.getConfig('social');
  config.social.links.push(link);
  config.lastUpdatedBy = userId;
  await config.save();
  return config;
};

// Static method to update a social link
siteConfigSchema.statics.updateSocialLink = async function(linkId, updates, userId) {
  const config = await this.findOneAndUpdate(
    { key: 'social', 'social.links._id': linkId },
    { 
      $set: { 
        'social.links.$': { ...updates, _id: linkId },
        lastUpdatedBy: userId
      }
    },
    { new: true }
  );
  return config;
};

// Static method to delete a social link
siteConfigSchema.statics.deleteSocialLink = async function(linkId, userId) {
  const config = await this.findOneAndUpdate(
    { key: 'social' },
    { 
      $pull: { 'social.links': { _id: linkId } },
      $set: { lastUpdatedBy: userId }
    },
    { new: true }
  );
  return config;
};

// Static method to add a quick reply
siteConfigSchema.statics.addQuickReply = async function(quickReply, userId) {
  const config = await this.getConfig('chatbot');
  const maxOrder = config.chatbot.quickReplies.length > 0 
    ? Math.max(...config.chatbot.quickReplies.map(q => q.order)) + 1 
    : 0;
  
  config.chatbot.quickReplies.push({ ...quickReply, order: quickReply.order ?? maxOrder });
  config.lastUpdatedBy = userId;
  await config.save();
  return config;
};

// Static method to update a quick reply
siteConfigSchema.statics.updateQuickReply = async function(replyId, updates, userId) {
  const config = await this.findOneAndUpdate(
    { key: 'chatbot', 'chatbot.quickReplies._id': replyId },
    { 
      $set: { 
        'chatbot.quickReplies.$': { ...updates, _id: replyId },
        lastUpdatedBy: userId
      }
    },
    { new: true }
  );
  return config;
};

// Static method to delete a quick reply
siteConfigSchema.statics.deleteQuickReply = async function(replyId, userId) {
  const config = await this.findOneAndUpdate(
    { key: 'chatbot' },
    { 
      $pull: { 'chatbot.quickReplies': { _id: replyId } },
      $set: { lastUpdatedBy: userId }
    },
    { new: true }
  );
  return config;
};

// Static method to seed all defaults (force reset)
siteConfigSchema.statics.seedAllDefaults = async function() {
  const results = {};
  
  for (const [key, data] of Object.entries(DEFAULT_CONFIGS)) {
    await this.findOneAndUpdate(
      { key },
      { key, [key]: data, isActive: true },
      { upsert: true, new: true }
    );
    results[key] = 'seeded';
  }
  
  return results;
};

// Virtual for getting all active testimonials
siteConfigSchema.virtual('activeTestimonials').get(function() {
  if (this.landing && this.landing.testimonials) {
    return this.landing.testimonials
      .filter(t => t.isActive)
      .sort((a, b) => a.order - b.order);
  }
  return [];
});

// Virtual for getting all active features
siteConfigSchema.virtual('activeFeatures').get(function() {
  if (this.landing && this.landing.features) {
    return this.landing.features
      .filter(f => f.isActive)
      .sort((a, b) => a.order - b.order);
  }
  return [];
});

let SiteConfig = null;

export const getSiteConfigModel = async () => {
  if (SiteConfig) return SiteConfig;
  
  const conn = await getConnection(DB_NAMES.MAIN_DB);
  SiteConfig = conn.models.SiteConfig || conn.model('SiteConfig', siteConfigSchema);
  return SiteConfig;
};

export default siteConfigSchema;
