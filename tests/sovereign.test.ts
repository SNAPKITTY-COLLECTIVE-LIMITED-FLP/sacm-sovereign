import assert from 'node:assert/strict'
import test from 'node:test'
import { SACMSovereign, assignTier, stripVendorLocks, type BridgedProject, type ConsensusProof } from '../src/index.js'

const project: BridgedProject = {
  sacmId: 'sacm_123456',
  legacyId: 'legacy-1',
  legacySource: 'salesforce',
  name: 'Imported Account',
  payload: {
    data: {
      account_id: 'A1',
      salesforce_id: 'SF-1',
      nested: { hubspot_tracking: 'HS' },
    },
  },
  importedAt: new Date().toISOString(),
  status: 'optimizing',
}

const consensus: ConsensusProof = {
  sacmId: 'sacm_123456',
  consensusId: 'cons_1',
  votes: [],
  quorum: true,
  approvalCount: 5,
  requiredQuorum: 3,
  wormHash: 'wormhash',
  sealedAt: new Date().toISOString(),
}

test('issues a SEIT participant record after quorum', () => {
  const sovereign = new SACMSovereign('test-secret')
  const record = sovereign.issueSovereignty(project, consensus)

  assert.match(record.participantId, /^part_/)
  assert.equal(record.charter, 'SEIT-NGO-EIN-42-2652897')
  assert.equal(record.seitCertification, 'igneous')
  assert.deepEqual(record.strippedKeys, ['data.salesforce_id', 'data.nested.hubspot_tracking'])
  assert.equal(sovereign.verifyParticipant(record, consensus), true)
})

test('strips vendor lock metadata recursively', () => {
  const result = stripVendorLocks({ google_analytics: 'x', ok: { segment_id: 'y', keep: true } })
  assert.deepEqual(result.cleaned, { ok: { keep: true } })
  assert.deepEqual(result.strippedKeys, ['google_analytics', 'ok.segment_id'])
})

test('blocks sovereignty when quorum is missing', () => {
  const sovereign = new SACMSovereign('test-secret')
  assert.throws(() => sovereign.issueSovereignty(project, { ...consensus, quorum: false }), /quorum not met/)
})

test('tier assignment is ratio based', () => {
  assert.equal(assignTier(3, 3), 'sovereign')
  assert.equal(assignTier(5, 3), 'igneous')
  assert.equal(assignTier(2, 3), 'observer')
})
