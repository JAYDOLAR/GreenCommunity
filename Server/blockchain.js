import { Router } from "express";
import { ethers } from "ethers";
import { 
  getMarketplace, 
  registerProjectOnChain, 
  getProjectOnChain, 
  grantFiatCredits,
  setAutoRetireBps,
  setProjectAutoRetireBps 
} from './services/blockchain.service.js';
import { authenticate, authenticateAdmin } from './middleware/auth.js';
import asyncHandler from './utils/asyncHandler.js';

const router = Router();

// When running in tests, provide an in-memory mock instead of real blockchain
if (process.env.NODE_ENV === 'test') {
  let testCount = 0;
  let testProjects = new Map();
  
  router.get('/count', (req, res) => {
    res.json({ count: testCount });
  });
  
  router.post('/increment', (req, res) => {
    testCount += 1;
    res.json({ success: true });
  });

  // Test project endpoints
  router.post('/projects/register', (req, res) => {
    const { totalCredits, pricePerCreditWei, metadataURI } = req.body;
    const projectId = testProjects.size + 1;
    testProjects.set(projectId, {
      id: projectId,
      totalCredits,
      soldCredits: 0,
      pricePerCreditWei,
      metadataURI,
      active: true
    });
    res.json({ success: true, projectId });
  });

  router.get('/projects/:projectId', (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const project = testProjects.get(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ success: true, project });
  });
} else {
  // Real blockchain integration with marketplace contract
  
  // Legacy counter endpoints for backwards compatibility
  router.get('/count', async (req, res) => {
    try {
      const marketplace = getMarketplace();
      const lastProjectId = await marketplace.lastProjectId();
      res.json({ count: lastProjectId.toString() });
    } catch (e) {
      console.error('Error getting project count:', e);
      res.status(500).json({ message: e.message });
    }
  });

  router.post('/increment', async (req, res) => {
    res.status(400).json({ message: 'Use /projects/register to create new projects' });
  });

  // Dynamic project registration endpoint
  router.post('/projects/register', authenticateAdmin, asyncHandler(async (req, res) => {
    try {
      const { 
        totalCredits, 
        pricePerCreditWei, 
        metadataURI,
        projectId = 0 // 0 for auto-increment
      } = req.body;

      // Validate required fields
      if (!totalCredits || !pricePerCreditWei || !metadataURI) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: totalCredits, pricePerCreditWei, metadataURI'
        });
      }

      // Validate numeric values
      if (isNaN(totalCredits) || totalCredits <= 0) {
        return res.status(400).json({
          success: false,
          message: 'totalCredits must be a positive number'
        });
      }

      // Register project on blockchain
      const blockchainProjectId = await registerProjectOnChain({
        projectId,
        totalCredits: parseInt(totalCredits),
        pricePerCreditWei: pricePerCreditWei.toString(),
        metadataURI
      });

      res.json({
        success: true,
        message: 'Project registered successfully on blockchain',
        data: {
          projectId: blockchainProjectId,
          totalCredits: parseInt(totalCredits),
          pricePerCreditWei: pricePerCreditWei.toString(),
          metadataURI
        }
      });
    } catch (error) {
      console.error('Error registering project on blockchain:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register project on blockchain',
        error: error.message
      });
    }
  }));

  // Get project details from blockchain
  router.get('/projects/:projectId', asyncHandler(async (req, res) => {
    try {
      const { projectId } = req.params;
      
      if (isNaN(projectId) || projectId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID'
        });
      }

      const project = await getProjectOnChain(parseInt(projectId));
      
      if (project.id === 0) {
        return res.status(404).json({
          success: false,
          message: 'Project not found on blockchain'
        });
      }

      res.json({
        success: true,
        data: {
          id: project.id.toString(),
          totalCredits: project.totalCredits.toString(),
          soldCredits: project.soldCredits.toString(),
          pricePerCredit: project.pricePerCredit.toString(),
          metadataURI: project.metadataURI,
          active: project.active,
          autoRetireBps: project.autoRetireBps.toString()
        }
      });
    } catch (error) {
      console.error('Error fetching project from blockchain:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch project from blockchain',
        error: error.message
      });
    }
  }));

  // Grant fiat credits (admin only)
  router.post('/projects/:projectId/grant-fiat', authenticateAdmin, asyncHandler(async (req, res) => {
    try {
      const { projectId } = req.params;
      const { 
        buyerAddress, 
        amount, 
        receiptId, 
        retireImmediately = false, 
        certificateURI = '' 
      } = req.body;

      if (!buyerAddress || !amount || !receiptId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: buyerAddress, amount, receiptId'
        });
      }

      const receipt = await grantFiatCredits({
        projectId: parseInt(projectId),
        buyerAddress,
        amount: parseInt(amount),
        receiptId,
        retireImmediately,
        certificateURI
      });

      res.json({
        success: true,
        message: 'Fiat credits granted successfully',
        data: {
          transactionHash: receipt.transactionHash,
          gasUsed: receipt.gasUsed.toString()
        }
      });
    } catch (error) {
      console.error('Error granting fiat credits:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to grant fiat credits',
        error: error.message
      });
    }
  }));

  // Set global auto-retire percentage
  router.put('/auto-retire/global', authenticateAdmin, asyncHandler(async (req, res) => {
    try {
      const { bps } = req.body;
      
      if (bps === undefined || isNaN(bps) || bps < 0 || bps > 10000) {
        return res.status(400).json({
          success: false,
          message: 'bps must be a number between 0 and 10000 (basis points)'
        });
      }

      await setAutoRetireBps(parseInt(bps));
      
      res.json({
        success: true,
        message: 'Global auto-retire percentage updated successfully',
        data: { bps: parseInt(bps) }
      });
    } catch (error) {
      console.error('Error setting global auto-retire:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set global auto-retire percentage',
        error: error.message
      });
    }
  }));

  // Set project-specific auto-retire percentage
  router.put('/projects/:projectId/auto-retire', authenticateAdmin, asyncHandler(async (req, res) => {
    try {
      const { projectId } = req.params;
      const { bps } = req.body;
      
      if (bps === undefined || isNaN(bps) || bps < 0 || bps > 10000) {
        return res.status(400).json({
          success: false,
          message: 'bps must be a number between 0 and 10000 (basis points)'
        });
      }

      await setProjectAutoRetireBps(parseInt(projectId), parseInt(bps));
      
      res.json({
        success: true,
        message: 'Project auto-retire percentage updated successfully',
        data: { 
          projectId: parseInt(projectId),
          bps: parseInt(bps) 
        }
      });
    } catch (error) {
      console.error('Error setting project auto-retire:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set project auto-retire percentage',
        error: error.message
      });
    }
  }));
}

export default router;
