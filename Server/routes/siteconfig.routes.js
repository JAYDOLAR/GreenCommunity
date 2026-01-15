import express from 'express';
import {
  // Site Config
  getLandingConfig,
  getFooterConfig,
  getSocialConfig,
  getChatbotConfig,
  getGeneralConfig,
  updateSiteConfig,
  getAllConfigs,
  // Features CRUD
  addFeature,
  updateFeature,
  deleteFeature,
  // Testimonials CRUD
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  // Footer Links CRUD
  addFooterLink,
  updateFooterLink,
  deleteFooterLink,
  // Social Links CRUD
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
  // Quick Replies CRUD
  addQuickReply,
  updateQuickReply,
  deleteQuickReply,
  // Section Updates
  updateLandingHero,
  updateLandingStats,
  updateFooterInfo,
  updateChatbotSettings,
  updateGeneralSettings,
  // Newsletter
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscribers,
  // Emission Factors
  getEmissionFactors,
  getEmissionFactorsByCategory,
  calculateEmission,
  seedEmissionFactors,
  updateEmissionFactor,
  // Currency Rates
  getCurrencyRates,
  getCurrencyRate,
  convertCurrency,
  seedCurrencyRates,
  updateCurrencyRate,
  // Initialization
  seedAllDefaults
} from '../controllers/siteconfig.controller.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Site Configuration (public)
router.get('/landing', getLandingConfig);
router.get('/footer', getFooterConfig);
router.get('/social', getSocialConfig);
router.get('/chatbot', getChatbotConfig);
router.get('/general', getGeneralConfig);

// Newsletter (public)
router.post('/newsletter/subscribe', subscribeNewsletter);
router.post('/newsletter/unsubscribe', unsubscribeNewsletter);

// Emission Factors (public)
router.get('/emissions', getEmissionFactors);
router.get('/emissions/category/:category', getEmissionFactorsByCategory);
router.post('/emissions/calculate', calculateEmission);

// Currency Rates (public)
router.get('/currency', getCurrencyRates);
router.get('/currency/convert', convertCurrency);
router.get('/currency/:currency', getCurrencyRate);

// ==================== ADMIN ROUTES ====================

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied: Admin privileges required' 
    });
  }
};

// Site Config Admin - General
router.get('/admin/configs', authenticateAdmin, requireAdmin, getAllConfigs);
router.put('/admin/config', authenticateAdmin, requireAdmin, updateSiteConfig);

// Features CRUD (Admin)
router.post('/admin/features', authenticateAdmin, requireAdmin, addFeature);
router.put('/admin/features/:featureId', authenticateAdmin, requireAdmin, updateFeature);
router.delete('/admin/features/:featureId', authenticateAdmin, requireAdmin, deleteFeature);

// Testimonials CRUD (Admin)
router.post('/admin/testimonials', authenticateAdmin, requireAdmin, addTestimonial);
router.put('/admin/testimonials/:testimonialId', authenticateAdmin, requireAdmin, updateTestimonial);
router.delete('/admin/testimonials/:testimonialId', authenticateAdmin, requireAdmin, deleteTestimonial);

// Footer Links CRUD (Admin)
router.post('/admin/footer-links', authenticateAdmin, requireAdmin, addFooterLink);
router.put('/admin/footer-links/:linkId', authenticateAdmin, requireAdmin, updateFooterLink);
router.delete('/admin/footer-links/:linkId', authenticateAdmin, requireAdmin, deleteFooterLink);

// Social Links CRUD (Admin)
router.post('/admin/social-links', authenticateAdmin, requireAdmin, addSocialLink);
router.put('/admin/social-links/:linkId', authenticateAdmin, requireAdmin, updateSocialLink);
router.delete('/admin/social-links/:linkId', authenticateAdmin, requireAdmin, deleteSocialLink);

// Quick Replies CRUD (Admin)
router.post('/admin/quick-replies', authenticateAdmin, requireAdmin, addQuickReply);
router.put('/admin/quick-replies/:replyId', authenticateAdmin, requireAdmin, updateQuickReply);
router.delete('/admin/quick-replies/:replyId', authenticateAdmin, requireAdmin, deleteQuickReply);

// Section Updates (Admin)
router.put('/admin/landing/hero', authenticateAdmin, requireAdmin, updateLandingHero);
router.put('/admin/landing/stats', authenticateAdmin, requireAdmin, updateLandingStats);
router.put('/admin/footer/info', authenticateAdmin, requireAdmin, updateFooterInfo);
router.put('/admin/chatbot/settings', authenticateAdmin, requireAdmin, updateChatbotSettings);
router.put('/admin/general/settings', authenticateAdmin, requireAdmin, updateGeneralSettings);

// Newsletter Admin
router.get('/admin/newsletter/subscribers', authenticateAdmin, requireAdmin, getNewsletterSubscribers);

// Emission Factors Admin
router.post('/admin/emissions/seed', authenticateAdmin, requireAdmin, seedEmissionFactors);
router.put('/admin/emissions/:activityId', authenticateAdmin, requireAdmin, updateEmissionFactor);

// Currency Rates Admin
router.post('/admin/currency/seed', authenticateAdmin, requireAdmin, seedCurrencyRates);
router.put('/admin/currency/:currency', authenticateAdmin, requireAdmin, updateCurrencyRate);

// Seed all defaults (admin only)
router.post('/admin/seed-all', authenticateAdmin, requireAdmin, seedAllDefaults);

export default router;
