import { getProjectModel } from '../models/Project.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { registerProjectOnChain, grantFiatCredits, getProjectOnChain } from '../services/blockchain.service.js';
import mongoose from 'mongoose';
import { ethers } from 'ethers';
import { getProvider, getMarketplace, getCertificate } from '../services/blockchain.service.js';

// Get all projects with filtering and pagination
export const getProjects = asyncHandler(async (req, res) => {
  try {
    const Project = await getProjectModel();
    
    const {
      page = 1,
      limit = 10,
      type,
      region,
      status,
      category,
      featured,
      search
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (type) filter.type = type;
    if (region) filter.region = region;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const [projects, totalProjects] = await Promise.all([
      Project.find(filter)
        .sort({ featured: -1, created_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Project.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalProjects / limitNum);
    
    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalProjects,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
});

// Admin: approve & register project on-chain
export const approveAndRegisterProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { totalCredits, pricePerCreditWei, metadataURI } = req.body;
  const Project = await getProjectModel();
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  if (project.verified && project.blockchain?.projectId) {
    return res.status(400).json({ success: false, message: 'Already registered' });
  }

  // Register on chain
  const { projectId: chainProjectId, txHash } = await registerProjectOnChain({ projectId: 0, totalCredits, pricePerCreditWei, metadataURI });
  project.verified = true;
  project.blockchain = {
    projectId: chainProjectId,
    totalCredits,
    soldCredits: 0,
    pricePerCreditWei: pricePerCreditWei.toString(),
    certificateBaseURI: metadataURI,
    contractAddress: process.env.MARKETPLACE_CONTRACT_ADDRESS,
    network: process.env.BLOCKCHAIN_NETWORK || 'localhost',
    lastSyncAt: new Date()
  };
  await project.save();
  console.log(`[BLOCKCHAIN] Project registered id=${chainProjectId} tx=${txHash}`);
  res.json({ success: true, txHash, data: project });
});

// Submit project for verification (creator triggers)
export const submitProjectForVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const Project = await getProjectModel();
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ success:false, message:'Project not found' });
  if (project.verification?.status !== 'draft' && project.verification?.status !== 'rejected') {
    return res.status(400).json({ success:false, message:'Already submitted' });
  }
  project.verification.status = 'submitted';
  project.verification.submittedAt = new Date();
  await project.save();
  res.json({ success:true, verification: project.verification });
});

// Admin: move project to in-review and optionally add note
export const markProjectInReview = asyncHandler(async (req,res) => {
  const { id } = req.params;
  const { note } = req.body;
  const Project = await getProjectModel();
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ success:false, message:'Project not found' });
  if (project.verification?.status !== 'submitted') return res.status(400).json({ success:false, message:'Not in submitted state' });
  project.verification.status = 'in-review';
  if (note) project.verification.notes.push({ by: req.user?._id, note });
  await project.save();
  res.json({ success:true, verification: project.verification });
});

// Admin: reject project with reason
export const rejectProject = asyncHandler(async (req,res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ success:false, message:'reason required' });
  const Project = await getProjectModel();
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ success:false, message:'Project not found' });
  project.verification.status = 'rejected';
  project.verification.reviewedAt = new Date();
  project.verification.reviewer = req.user?._id;
  project.verification.notes.push({ by: req.user?._id, note: `REJECT: ${reason}` });
  await project.save();
  res.json({ success:true, verification: project.verification });
});

// Helper: quote crypto purchase (price = amount * pricePerCreditWei)
export const quoteCryptoPurchase = asyncHandler(async (req,res) => {
  const { id } = req.params; // project mongo id
  const { amount } = req.query;
  const amt = parseInt(amount || '0');
  if (!amt || amt <= 0) return res.status(400).json({ success:false, message:'amount > 0 required' });
  const Project = await getProjectModel();
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ success:false, message:'Project not found' });
  if (!project.blockchain?.projectId) return res.status(400).json({ success:false, message:'Project not on chain' });
  const pricePer = BigInt(project.blockchain.pricePerCreditWei);
  const total = pricePer * BigInt(amt);
  res.json({ success:true, projectId: project.blockchain.projectId, amount: amt, totalWei: total.toString() });
});

// Helper: return encoded calldata for retireCredits (user signs & sends)
export const getRetireCalldata = asyncHandler(async (req,res) => {
  const { id } = req.params; // project mongo id
  const { amount, certificateURI } = req.query;
  const amt = parseInt(amount||'0');
  if (!amt) return res.status(400).json({ success:false, message:'amount required' });
  const Project = await getProjectModel();
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ success:false, message:'Project not found' });
  if (!project.blockchain?.projectId) return res.status(400).json({ success:false, message:'Project not on chain' });
  // Load interface
  // Lightweight ABI fragment
  const iface = new ethers.Interface([
    'function retireCredits(uint256 projectId,uint256 amount,string certificateURI)'
  ]);
  const data = iface.encodeFunctionData('retireCredits', [project.blockchain.projectId, amt, certificateURI||'']);
  res.json({ success:true, to: process.env.MARKETPLACE_CONTRACT_ADDRESS, data });
});

// User-triggered retire helper & optional relay of signed tx
export const retireCreditsUser = asyncHandler(async (req,res) => {
  const { id } = req.params; // project mongo id
  const { amount, certificateURI, mode = 'prepare', rawSignedTx } = req.body;
  const amt = parseInt(amount||'0');
  if (!amt || amt <= 0) return res.status(400).json({ success:false, message:'amount > 0 required' });
  const Project = await getProjectModel();
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ success:false, message:'Project not found' });
  if (!project.blockchain?.projectId) return res.status(400).json({ success:false, message:'Project not on chain' });
  const userAddress = req.user?.wallet?.address?.toLowerCase();
  if (!userAddress) return res.status(400).json({ success:false, message:'User has no linked wallet' });
  const marketplace = getMarketplace(); // owner-signer instance (only for interface)
  const provider = getProvider();
  const to = process.env.MARKETPLACE_CONTRACT_ADDRESS;
  const data = marketplace.interface.encodeFunctionData('retireCredits', [project.blockchain.projectId, amt, certificateURI||'']);
  if (mode === 'prepare') {
    let gasEstimate;
    try {
      gasEstimate = (await provider.estimateGas({ from: userAddress, to, data })).toString();
    } catch { /* ignore */ }
    return res.json({ success:true, action:'prepare', to, data, value:'0', gasEstimate });
  }
  if (mode === 'broadcast') {
    if (!rawSignedTx) return res.status(400).json({ success:false, message:'rawSignedTx required for broadcast' });
    try {
      const sent = await provider.broadcastTransaction(rawSignedTx);
      const receipt = await sent.wait();
      // Parse certificate event (if any)
      let tokenId;
      try {
        const cert = getCertificate();
        for (const log of receipt.logs) {
          try {
            const parsed = cert.interface.parseLog(log);
            if (parsed.name === 'CertificateMinted') { tokenId = parsed.args.tokenId.toString(); break; }
          } catch {/* ignore */}
        }
      } catch {/* ignore */}
      return res.json({ success:true, action:'broadcast', txHash: receipt.hash, status: receipt.status, tokenId });
    } catch (e) {
      return res.status(400).json({ success:false, message:'Broadcast failed', error: e.message });
    }
  }
  return res.status(400).json({ success:false, message:'Unsupported mode' });
});

// Admin: grant fiat purchase
export const grantFiatPurchaseController = asyncHandler( async (req, res) => {
  const { id } = req.params; // project mongo id
  const { buyerAddress, amount, receiptId, retireImmediately = false, certificateURI } = req.body;
  const Project = await getProjectModel();
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  if (!project.blockchain?.projectId) return res.status(400).json({ success: false, message: 'Project not on chain' });

  await grantFiatCredits({
    projectId: project.blockchain.projectId,
    buyerAddress,
    amount,
    receiptId,
    retireImmediately,
    certificateURI
  });

  // Sync sold credits
  const onChain = await getProjectOnChain(project.blockchain.projectId);
  project.blockchain.soldCredits = Number(onChain.soldCredits);
  project.blockchain.lastSyncAt = new Date();
  await project.save();
  res.json({ success: true, data: project.blockchain });
});


// Get single project by ID
export const getProjectById = asyncHandler(async (req, res) => {
  try {
    const Project = await getProjectModel();
    const { id } = req.params;
    
    const project = await Project.findById(id).lean();
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
});

// Get featured projects
export const getFeaturedProjects = asyncHandler(async (req, res) => {
  try {
    const Project = await getProjectModel();
    const limit = parseInt(req.query.limit) || 6;
    
    const projects = await Project.find({ featured: true, status: 'active' })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured projects',
      error: error.message
    });
  }
});

// Get projects by region
export const getProjectsByRegion = asyncHandler(async (req, res) => {
  try {
    const Project = await getProjectModel();
    const { region } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const projects = await Project.find({ 
      region: { $regex: region, $options: 'i' },
      status: 'active'
    })
      .sort({ featured: -1, created_at: -1 })
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects by region:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects by region',
      error: error.message
    });
  }
});

// Get project statistics
export const getProjectStats = asyncHandler(async (req, res) => {
  try {
    const Project = await getProjectModel();
    
    const stats = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalCarbonOffset: { $sum: '$impact.carbonOffset' },
          totalArea: { $sum: '$impact.area' },
          totalBeneficiaries: { $sum: '$impact.beneficiaries' },
          totalFunding: { $sum: '$currentFunding' }
        }
      }
    ]);
    
    const projectsByCategory = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const projectsByRegion = await Project.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        byCategory: projectsByCategory,
        byRegion: projectsByRegion
      }
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics',
      error: error.message
    });
  }
});
