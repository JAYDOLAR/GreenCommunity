import { getSiteConfigModel } from '../models/SiteConfig.model.js';
import { getNewsletterSubscriberModel } from '../models/NewsletterSubscriber.model.js';
import { getEmissionFactorModel } from '../models/EmissionFactor.model.js';
import { getCurrencyRateModel } from '../models/CurrencyRate.model.js';
import { getUserModel } from '../models/User.model.js';
import { getProjectModel } from '../models/Project.model.js';
import { getOrderModel } from '../models/Order.model.js';

// ==================== SITE CONFIG ====================

// Get landing page configuration
export const getLandingConfig = async (req, res) => {
  try {
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.getConfig('landing');
    
    // If useDynamicStats is true, fetch real stats
    let stats = config.landing?.stats || {};
    if (stats.useDynamicStats) {
      const dynamicStats = await getDynamicStats();
      stats = { ...stats, ...dynamicStats };
    }
    
    res.json({
      success: true,
      data: {
        hero: {
          title: config.landing?.heroTitle,
          subtitle: config.landing?.heroSubtitle
        },
        features: config.landing?.features?.filter(f => f.isActive).sort((a, b) => a.order - b.order) || [],
        testimonials: config.landing?.testimonials?.filter(t => t.isActive).sort((a, b) => a.order - b.order) || [],
        stats,
        cta: {
          primary: config.landing?.ctaText,
          secondary: config.landing?.ctaSecondaryText
        }
      }
    });
  } catch (error) {
    console.error('Error fetching landing config:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch landing configuration' });
  }
};

// Get dynamic stats from database
const getDynamicStats = async () => {
  try {
    const User = await getUserModel();
    const Project = await getProjectModel();
    const Order = await getOrderModel();
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Calculate carbon offset from projects
    const carbonData = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalCarbonOffset: { $sum: '$impact.carbonOffset' },
          totalCo2Removed: { $sum: '$co2Removed' }
        }
      }
    ]);
    const totalCarbonOffset = carbonData.length > 0 
      ? (carbonData[0].totalCarbonOffset || 0) + (carbonData[0].totalCo2Removed || 0)
      : 0;
    
    // Calculate monthly growth
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const previousUsers = await User.countDocuments({ 
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
    });
    
    const monthlyGrowth = previousUsers > 0 
      ? Math.round(((recentUsers - previousUsers) / previousUsers) * 100) 
      : recentUsers > 0 ? 100 : 0;
    
    // Format for display
    const formatNumber = (num) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
      return `${num}+`;
    };
    
    return {
      activeUsers: formatNumber(totalUsers),
      carbonReduction: totalCarbonOffset > 0 ? `${formatNumber(totalCarbonOffset)} tons` : '30%',
      monthlyGrowth: `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth}%`
    };
  } catch (error) {
    console.error('Error getting dynamic stats:', error);
    return {};
  }
};

// Get footer configuration
export const getFooterConfig = async (req, res) => {
  try {
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.getConfig('footer');
    
    // Group footer links by category
    const links = config.footer?.links?.filter(l => l.isActive) || [];
    const groupedLinks = {
      product: links.filter(l => l.category === 'product').sort((a, b) => a.order - b.order),
      company: links.filter(l => l.category === 'company').sort((a, b) => a.order - b.order),
      resources: links.filter(l => l.category === 'resources').sort((a, b) => a.order - b.order),
      legal: links.filter(l => l.category === 'legal').sort((a, b) => a.order - b.order)
    };
    
    res.json({
      success: true,
      data: {
        companyName: config.footer?.companyName,
        description: config.footer?.description,
        copyrightYear: config.footer?.copyrightYear || new Date().getFullYear(),
        links: groupedLinks
      }
    });
  } catch (error) {
    console.error('Error fetching footer config:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch footer configuration' });
  }
};

// Get social links configuration
export const getSocialConfig = async (req, res) => {
  try {
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.getConfig('social');
    
    res.json({
      success: true,
      data: {
        links: config.social?.links?.filter(l => l.isActive) || []
      }
    });
  } catch (error) {
    console.error('Error fetching social config:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch social configuration' });
  }
};

// Get chatbot configuration
export const getChatbotConfig = async (req, res) => {
  try {
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.getConfig('chatbot');
    
    res.json({
      success: true,
      data: {
        welcomeMessage: config.chatbot?.welcomeMessage,
        fallbackMessage: config.chatbot?.fallbackMessage,
        quickReplies: config.chatbot?.quickReplies?.filter(q => q.isActive).sort((a, b) => a.order - b.order) || [],
        helpCategories: config.chatbot?.helpCategories?.filter(h => h.isActive).sort((a, b) => a.order - b.order) || [],
        isEnabled: config.chatbot?.isEnabled ?? true
      }
    });
  } catch (error) {
    console.error('Error fetching chatbot config:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chatbot configuration' });
  }
};

// Get general site configuration
export const getGeneralConfig = async (req, res) => {
  try {
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.getConfig('general');
    
    res.json({
      success: true,
      data: {
        siteName: config.general?.siteName,
        siteDescription: config.general?.siteDescription,
        contactEmail: config.general?.contactEmail,
        maintenanceMode: config.general?.maintenanceMode,
        maintenanceMessage: config.general?.maintenanceMessage
      }
    });
  } catch (error) {
    console.error('Error fetching general config:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch general configuration' });
  }
};

// Admin: Update site configuration
export const updateSiteConfig = async (req, res) => {
  try {
    const { key, updates } = req.body;
    
    if (!key || !updates) {
      return res.status(400).json({ success: false, message: 'Key and updates are required' });
    }
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.updateConfig(key, { [key]: updates }, req.user?._id);
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Error updating site config:', error);
    res.status(500).json({ success: false, message: 'Failed to update configuration' });
  }
};

// Admin: Get all configurations
export const getAllConfigs = async (req, res) => {
  try {
    const SiteConfig = await getSiteConfigModel();
    const configs = await SiteConfig.find({ isActive: true });
    
    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Error fetching all configs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch configurations' });
  }
};

// ==================== ADMIN CRUD - FEATURES ====================

// Admin: Add a feature
export const addFeature = async (req, res) => {
  try {
    const { title, description, icon, color, isActive, order } = req.body;
    
    if (!title || !description || !icon) {
      return res.status(400).json({ success: false, message: 'Title, description, and icon are required' });
    }
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.addFeature(
      { title, description, icon, color, isActive: isActive ?? true, order },
      req.user?._id
    );
    
    res.status(201).json({
      success: true,
      message: 'Feature added successfully',
      data: config.landing.features
    });
  } catch (error) {
    console.error('Error adding feature:', error);
    res.status(500).json({ success: false, message: 'Failed to add feature' });
  }
};

// Admin: Update a feature
export const updateFeature = async (req, res) => {
  try {
    const { featureId } = req.params;
    const updates = req.body;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.updateFeature(featureId, updates, req.user?._id);
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Feature not found' });
    }
    
    res.json({
      success: true,
      message: 'Feature updated successfully',
      data: config.landing.features
    });
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({ success: false, message: 'Failed to update feature' });
  }
};

// Admin: Delete a feature
export const deleteFeature = async (req, res) => {
  try {
    const { featureId } = req.params;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.deleteFeature(featureId, req.user?._id);
    
    res.json({
      success: true,
      message: 'Feature deleted successfully',
      data: config.landing.features
    });
  } catch (error) {
    console.error('Error deleting feature:', error);
    res.status(500).json({ success: false, message: 'Failed to delete feature' });
  }
};

// ==================== ADMIN CRUD - TESTIMONIALS ====================

// Admin: Add a testimonial
export const addTestimonial = async (req, res) => {
  try {
    const { name, role, content, avatar, rating, isActive, order } = req.body;
    
    if (!name || !role || !content) {
      return res.status(400).json({ success: false, message: 'Name, role, and content are required' });
    }
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.addTestimonial(
      { name, role, content, avatar, rating, isActive: isActive ?? true, order },
      req.user?._id
    );
    
    res.status(201).json({
      success: true,
      message: 'Testimonial added successfully',
      data: config.landing.testimonials
    });
  } catch (error) {
    console.error('Error adding testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to add testimonial' });
  }
};

// Admin: Update a testimonial
export const updateTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const updates = req.body;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.updateTestimonial(testimonialId, updates, req.user?._id);
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    
    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: config.landing.testimonials
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to update testimonial' });
  }
};

// Admin: Delete a testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.deleteTestimonial(testimonialId, req.user?._id);
    
    res.json({
      success: true,
      message: 'Testimonial deleted successfully',
      data: config.landing.testimonials
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to delete testimonial' });
  }
};

// ==================== ADMIN CRUD - FOOTER LINKS ====================

// Admin: Add a footer link
export const addFooterLink = async (req, res) => {
  try {
    const { category, label, url, isExternal, isActive, order } = req.body;
    
    if (!category || !label || !url) {
      return res.status(400).json({ success: false, message: 'Category, label, and URL are required' });
    }
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.addFooterLink(
      { category, label, url, isExternal, isActive: isActive ?? true, order },
      req.user?._id
    );
    
    res.status(201).json({
      success: true,
      message: 'Footer link added successfully',
      data: config.footer.links
    });
  } catch (error) {
    console.error('Error adding footer link:', error);
    res.status(500).json({ success: false, message: 'Failed to add footer link' });
  }
};

// Admin: Update a footer link
export const updateFooterLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    const updates = req.body;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.updateFooterLink(linkId, updates, req.user?._id);
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Footer link not found' });
    }
    
    res.json({
      success: true,
      message: 'Footer link updated successfully',
      data: config.footer.links
    });
  } catch (error) {
    console.error('Error updating footer link:', error);
    res.status(500).json({ success: false, message: 'Failed to update footer link' });
  }
};

// Admin: Delete a footer link
export const deleteFooterLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.deleteFooterLink(linkId, req.user?._id);
    
    res.json({
      success: true,
      message: 'Footer link deleted successfully',
      data: config.footer.links
    });
  } catch (error) {
    console.error('Error deleting footer link:', error);
    res.status(500).json({ success: false, message: 'Failed to delete footer link' });
  }
};

// ==================== ADMIN CRUD - SOCIAL LINKS ====================

// Admin: Add a social link
export const addSocialLink = async (req, res) => {
  try {
    const { platform, url, isActive } = req.body;
    
    if (!platform || !url) {
      return res.status(400).json({ success: false, message: 'Platform and URL are required' });
    }
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.addSocialLink(
      { platform, url, isActive: isActive ?? true },
      req.user?._id
    );
    
    res.status(201).json({
      success: true,
      message: 'Social link added successfully',
      data: config.social.links
    });
  } catch (error) {
    console.error('Error adding social link:', error);
    res.status(500).json({ success: false, message: 'Failed to add social link' });
  }
};

// Admin: Update a social link
export const updateSocialLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    const updates = req.body;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.updateSocialLink(linkId, updates, req.user?._id);
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Social link not found' });
    }
    
    res.json({
      success: true,
      message: 'Social link updated successfully',
      data: config.social.links
    });
  } catch (error) {
    console.error('Error updating social link:', error);
    res.status(500).json({ success: false, message: 'Failed to update social link' });
  }
};

// Admin: Delete a social link
export const deleteSocialLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.deleteSocialLink(linkId, req.user?._id);
    
    res.json({
      success: true,
      message: 'Social link deleted successfully',
      data: config.social.links
    });
  } catch (error) {
    console.error('Error deleting social link:', error);
    res.status(500).json({ success: false, message: 'Failed to delete social link' });
  }
};

// ==================== ADMIN CRUD - QUICK REPLIES ====================

// Admin: Add a quick reply
export const addQuickReply = async (req, res) => {
  try {
    const { text, action, icon, isActive, order } = req.body;
    
    if (!text || !action) {
      return res.status(400).json({ success: false, message: 'Text and action are required' });
    }
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.addQuickReply(
      { text, action, icon, isActive: isActive ?? true, order },
      req.user?._id
    );
    
    res.status(201).json({
      success: true,
      message: 'Quick reply added successfully',
      data: config.chatbot.quickReplies
    });
  } catch (error) {
    console.error('Error adding quick reply:', error);
    res.status(500).json({ success: false, message: 'Failed to add quick reply' });
  }
};

// Admin: Update a quick reply
export const updateQuickReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const updates = req.body;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.updateQuickReply(replyId, updates, req.user?._id);
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Quick reply not found' });
    }
    
    res.json({
      success: true,
      message: 'Quick reply updated successfully',
      data: config.chatbot.quickReplies
    });
  } catch (error) {
    console.error('Error updating quick reply:', error);
    res.status(500).json({ success: false, message: 'Failed to update quick reply' });
  }
};

// Admin: Delete a quick reply
export const deleteQuickReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.deleteQuickReply(replyId, req.user?._id);
    
    res.json({
      success: true,
      message: 'Quick reply deleted successfully',
      data: config.chatbot.quickReplies
    });
  } catch (error) {
    console.error('Error deleting quick reply:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quick reply' });
  }
};

// ==================== ADMIN - UPDATE SECTIONS ====================

// Admin: Update landing hero section
export const updateLandingHero = async (req, res) => {
  try {
    const { heroTitle, heroSubtitle, ctaText, ctaSecondaryText } = req.body;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.getConfig('landing');
    
    if (heroTitle !== undefined) config.landing.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) config.landing.heroSubtitle = heroSubtitle;
    if (ctaText !== undefined) config.landing.ctaText = ctaText;
    if (ctaSecondaryText !== undefined) config.landing.ctaSecondaryText = ctaSecondaryText;
    
    config.lastUpdatedBy = req.user?._id;
    await config.save();
    
    res.json({
      success: true,
      message: 'Landing hero updated successfully',
      data: {
        heroTitle: config.landing.heroTitle,
        heroSubtitle: config.landing.heroSubtitle,
        ctaText: config.landing.ctaText,
        ctaSecondaryText: config.landing.ctaSecondaryText
      }
    });
  } catch (error) {
    console.error('Error updating landing hero:', error);
    res.status(500).json({ success: false, message: 'Failed to update landing hero' });
  }
};

// Admin: Update landing stats
export const updateLandingStats = async (req, res) => {
  try {
    const { activeUsers, carbonReduction, monthlyGrowth, useDynamicStats } = req.body;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.getConfig('landing');
    
    if (activeUsers !== undefined) config.landing.stats.activeUsers = activeUsers;
    if (carbonReduction !== undefined) config.landing.stats.carbonReduction = carbonReduction;
    if (monthlyGrowth !== undefined) config.landing.stats.monthlyGrowth = monthlyGrowth;
    if (useDynamicStats !== undefined) config.landing.stats.useDynamicStats = useDynamicStats;
    
    config.lastUpdatedBy = req.user?._id;
    await config.save();
    
    res.json({
      success: true,
      message: 'Landing stats updated successfully',
      data: config.landing.stats
    });
  } catch (error) {
    console.error('Error updating landing stats:', error);
    res.status(500).json({ success: false, message: 'Failed to update landing stats' });
  }
};

// Admin: Update footer info
export const updateFooterInfo = async (req, res) => {
  try {
    const { companyName, description, copyrightYear } = req.body;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.getConfig('footer');
    
    if (companyName !== undefined) config.footer.companyName = companyName;
    if (description !== undefined) config.footer.description = description;
    if (copyrightYear !== undefined) config.footer.copyrightYear = copyrightYear;
    
    config.lastUpdatedBy = req.user?._id;
    await config.save();
    
    res.json({
      success: true,
      message: 'Footer info updated successfully',
      data: {
        companyName: config.footer.companyName,
        description: config.footer.description,
        copyrightYear: config.footer.copyrightYear
      }
    });
  } catch (error) {
    console.error('Error updating footer info:', error);
    res.status(500).json({ success: false, message: 'Failed to update footer info' });
  }
};

// Admin: Update chatbot settings
export const updateChatbotSettings = async (req, res) => {
  try {
    const { welcomeMessage, fallbackMessage, isEnabled } = req.body;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.getConfig('chatbot');
    
    if (welcomeMessage !== undefined) config.chatbot.welcomeMessage = welcomeMessage;
    if (fallbackMessage !== undefined) config.chatbot.fallbackMessage = fallbackMessage;
    if (isEnabled !== undefined) config.chatbot.isEnabled = isEnabled;
    
    config.lastUpdatedBy = req.user?._id;
    await config.save();
    
    res.json({
      success: true,
      message: 'Chatbot settings updated successfully',
      data: {
        welcomeMessage: config.chatbot.welcomeMessage,
        fallbackMessage: config.chatbot.fallbackMessage,
        isEnabled: config.chatbot.isEnabled
      }
    });
  } catch (error) {
    console.error('Error updating chatbot settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update chatbot settings' });
  }
};

// Admin: Update general settings
export const updateGeneralSettings = async (req, res) => {
  try {
    const { siteName, siteDescription, contactEmail, supportEmail, maintenanceMode, maintenanceMessage } = req.body;
    
    const SiteConfig = await getSiteConfigModel();
    const config = await SiteConfig.getConfig('general');
    
    if (siteName !== undefined) config.general.siteName = siteName;
    if (siteDescription !== undefined) config.general.siteDescription = siteDescription;
    if (contactEmail !== undefined) config.general.contactEmail = contactEmail;
    if (supportEmail !== undefined) config.general.supportEmail = supportEmail;
    if (maintenanceMode !== undefined) config.general.maintenanceMode = maintenanceMode;
    if (maintenanceMessage !== undefined) config.general.maintenanceMessage = maintenanceMessage;
    
    config.lastUpdatedBy = req.user?._id;
    await config.save();
    
    res.json({
      success: true,
      message: 'General settings updated successfully',
      data: config.general
    });
  } catch (error) {
    console.error('Error updating general settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update general settings' });
  }
};

// ==================== NEWSLETTER ====================

// Subscribe to newsletter
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email, name, source, preferences } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const NewsletterSubscriber = await getNewsletterSubscriberModel();
    const result = await NewsletterSubscriber.subscribe(email, {
      name,
      source: source || 'landing',
      preferences,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?._id
    });
    
    if (!result.isNew && !result.resubscribed) {
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed to our newsletter',
        alreadySubscribed: true
      });
    }
    
    res.status(201).json({
      success: true,
      message: result.resubscribed 
        ? 'Welcome back! You have been re-subscribed to our newsletter'
        : 'Successfully subscribed to newsletter',
      data: {
        email: result.subscriber.email,
        status: result.subscriber.status
      }
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed to our newsletter',
        alreadySubscribed: true
      });
    }
    res.status(500).json({ success: false, message: 'Failed to subscribe to newsletter' });
  }
};

// Unsubscribe from newsletter
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email, reason } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const NewsletterSubscriber = await getNewsletterSubscriberModel();
    const subscriber = await NewsletterSubscriber.unsubscribe(email, reason);
    
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }
    
    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({ success: false, message: 'Failed to unsubscribe from newsletter' });
  }
};

// Admin: Get newsletter subscribers
export const getNewsletterSubscribers = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    const NewsletterSubscriber = await getNewsletterSubscriberModel();
    
    const query = status ? { status } : {};
    const subscribers = await NewsletterSubscriber.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await NewsletterSubscriber.countDocuments(query);
    const activeCount = await NewsletterSubscriber.getActiveCount();
    
    res.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          active: activeCount,
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscribers' });
  }
};

// ==================== EMISSION FACTORS ====================

// Get all emission factors
export const getEmissionFactors = async (req, res) => {
  try {
    const EmissionFactor = await getEmissionFactorModel();
    const factors = await EmissionFactor.getFactorsByCategory();
    
    res.json({
      success: true,
      data: factors
    });
  } catch (error) {
    console.error('Error fetching emission factors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch emission factors' });
  }
};

// Get emission factors by category
export const getEmissionFactorsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const EmissionFactor = await getEmissionFactorModel();
    const factors = await EmissionFactor.find({ category, isActive: true })
      .sort({ order: 1 });
    
    res.json({
      success: true,
      data: factors
    });
  } catch (error) {
    console.error('Error fetching emission factors by category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch emission factors' });
  }
};

// Calculate emission
export const calculateEmission = async (req, res) => {
  try {
    const { activityId, value } = req.body;
    
    if (!activityId || value === undefined) {
      return res.status(400).json({ success: false, message: 'Activity ID and value are required' });
    }
    
    const EmissionFactor = await getEmissionFactorModel();
    const result = await EmissionFactor.calculateEmission(activityId, value);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error calculating emission:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to calculate emission' });
  }
};

// Admin: Seed default emission factors
export const seedEmissionFactors = async (req, res) => {
  try {
    const EmissionFactor = await getEmissionFactorModel();
    const count = await EmissionFactor.seedDefaults();
    
    res.json({
      success: true,
      message: `Successfully seeded ${count} emission factors`
    });
  } catch (error) {
    console.error('Error seeding emission factors:', error);
    res.status(500).json({ success: false, message: 'Failed to seed emission factors' });
  }
};

// Admin: Update emission factor
export const updateEmissionFactor = async (req, res) => {
  try {
    const { activityId } = req.params;
    const updates = req.body;
    
    const EmissionFactor = await getEmissionFactorModel();
    const factor = await EmissionFactor.findOneAndUpdate(
      { activityId },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!factor) {
      return res.status(404).json({ success: false, message: 'Emission factor not found' });
    }
    
    res.json({
      success: true,
      message: 'Emission factor updated successfully',
      data: factor
    });
  } catch (error) {
    console.error('Error updating emission factor:', error);
    res.status(500).json({ success: false, message: 'Failed to update emission factor' });
  }
};

// ==================== CURRENCY RATES ====================

// Get all currency rates
export const getCurrencyRates = async (req, res) => {
  try {
    const CurrencyRate = await getCurrencyRateModel();
    const rates = await CurrencyRate.getAllRates();
    
    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch currency rates' });
  }
};

// Get specific currency rate
export const getCurrencyRate = async (req, res) => {
  try {
    const { currency } = req.params;
    
    const CurrencyRate = await getCurrencyRateModel();
    const rate = await CurrencyRate.getRate(currency);
    
    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('Error fetching currency rate:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch currency rate' });
  }
};

// Convert amount between currencies
export const convertCurrency = async (req, res) => {
  try {
    const { amount, from, to } = req.query;
    
    if (!amount || !from || !to) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount, from, and to currencies are required' 
      });
    }
    
    const CurrencyRate = await getCurrencyRateModel();
    const converted = await CurrencyRate.convert(parseFloat(amount), from, to);
    
    res.json({
      success: true,
      data: {
        original: { amount: parseFloat(amount), currency: from.toUpperCase() },
        converted: { amount: converted, currency: to.toUpperCase() }
      }
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to convert currency' });
  }
};

// Admin: Seed default currencies
export const seedCurrencyRates = async (req, res) => {
  try {
    const CurrencyRate = await getCurrencyRateModel();
    const count = await CurrencyRate.seedDefaults();
    
    res.json({
      success: true,
      message: `Successfully seeded ${count} currency rates`
    });
  } catch (error) {
    console.error('Error seeding currency rates:', error);
    res.status(500).json({ success: false, message: 'Failed to seed currency rates' });
  }
};

// Admin: Update currency rate
export const updateCurrencyRate = async (req, res) => {
  try {
    const { currency } = req.params;
    const { rate, source } = req.body;
    
    if (!rate) {
      return res.status(400).json({ success: false, message: 'Rate is required' });
    }
    
    const CurrencyRate = await getCurrencyRateModel();
    const currencyDoc = await CurrencyRate.findOne({ currency: currency.toUpperCase() });
    
    if (!currencyDoc) {
      return res.status(404).json({ success: false, message: 'Currency not found' });
    }
    
    await currencyDoc.updateRate(rate, source || 'manual');
    
    res.json({
      success: true,
      message: 'Currency rate updated successfully',
      data: currencyDoc
    });
  } catch (error) {
    console.error('Error updating currency rate:', error);
    res.status(500).json({ success: false, message: 'Failed to update currency rate' });
  }
};

// ==================== INITIALIZATION ====================

// Seed all default data
export const seedAllDefaults = async (req, res) => {
  try {
    const results = {};
    
    // Seed emission factors
    const EmissionFactor = await getEmissionFactorModel();
    results.emissionFactors = await EmissionFactor.seedDefaults();
    
    // Seed currency rates
    const CurrencyRate = await getCurrencyRateModel();
    results.currencyRates = await CurrencyRate.seedDefaults();
    
    // Seed default site configs using the model's seedAllDefaults method
    const SiteConfig = await getSiteConfigModel();
    const configResults = await SiteConfig.seedAllDefaults();
    results.siteConfigs = configResults;
    
    res.json({
      success: true,
      message: 'Successfully seeded all default data',
      data: results
    });
  } catch (error) {
    console.error('Error seeding defaults:', error);
    res.status(500).json({ success: false, message: 'Failed to seed default data' });
  }
};
