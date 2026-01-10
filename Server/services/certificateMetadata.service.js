import { pinJSON } from './ipfs.service.js';
import { getProjectModel } from '../models/Project.model.js';

export async function buildAndPinCertificateMetadata({ projectMongoId, amount, reason = 'purchase', retirePortion = false }) {
  const Project = await getProjectModel();
  const project = await Project.findById(projectMongoId);
  if (!project) throw new Error('Project not found');
  if (!project.blockchain?.projectId) throw new Error('Project not on chain');
  const now = new Date();
  const metadata = {
    name: `Carbon Offset Certificate - ${project.name}`,
    description: `Proof of retirement of ${amount} carbon credits for project ${project.name}. Reason: ${reason}. Date: ${now.toISOString()}`,
    image: project.image || 'https://example.com/placeholder-certificate.png',
    external_url: project.organization?.website || 'https://example.com',
    attributes: [
      { trait_type: 'Project Name', value: project.name },
      { trait_type: 'Project ID', value: project.blockchain.projectId },
      { trait_type: 'Credits Retired', value: amount },
      { trait_type: 'Unit', value: 'carbon-credit' },
      { trait_type: 'Reason', value: reason },
      { trait_type: 'Retire Portion', value: retirePortion ? 'auto' : 'full/manual' },
      { trait_type: 'Timestamp', value: now.toISOString() }
    ]
  };
  const pinned = await pinJSON(metadata);
  return { certificateURI: pinned.uri, metadata, projectId: project.blockchain.projectId };
}
