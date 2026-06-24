import crypto from 'node:crypto'

export type SovereignTier = 'observer' | 'sovereign' | 'igneous'

export interface BridgedProject {
  sacmId: string
  legacyId: string
  legacySource: string
  name: string
  payload: unknown
  importedAt: string
  status: 'imported' | 'rejected' | 'optimizing' | 'sovereign'
}

export interface ConsensusProof {
  sacmId: string
  consensusId: string
  votes: Array<{ agent: string; vote: 'approve' | 'reject'; signature: string }>
  quorum: boolean
  approvalCount: number
  requiredQuorum: number
  wormHash: string
  sealedAt: string
}

export interface AgentWorkSeal {
  agent: string
  timestamp: string
  signature: string
}

export interface ParticipantRecord {
  participantId: string
  sacmId: string
  legacyId: string
  seitCertification: SovereignTier
  charter: 'SEIT-NGO-EIN-42-2652897'
  ledgerAnchor: string
  consensusRef: string
  strippedKeys: string[]
  sovereignAt: string
  publicObserver: boolean
  architecture: 'Entangled-Partner-FSM'
  sentinelSeal: AgentWorkSeal
  mnemexSeal: AgentWorkSeal
}

const VENDOR_LOCK_KEYS = [
  '_vendor',
  '_platform',
  '_tracking',
  '_analytics',
  '_telemetry_vendor',
  'google_analytics',
  'mixpanel',
  'segment_id',
  'hubspot',
  'salesforce_id',
  'datadog',
  'newrelic',
  'amplitude',
  'intercom',
  'optimizely',
]

export class SACMSovereign {
  constructor(private readonly secret = process.env.VAULT_MASTER_SECRET ?? 'dev-sacm-sovereign-key') {
    if (process.env.NODE_ENV === 'production' && !process.env.VAULT_MASTER_SECRET) {
      throw new Error('VAULT_MASTER_SECRET is required in production')
    }
  }

  issueSovereignty(project: BridgedProject, consensus: ConsensusProof): ParticipantRecord {
    if (project.sacmId !== consensus.sacmId) {
      throw new Error(`Consensus ${consensus.consensusId} does not match project ${project.sacmId}`)
    }
    if (!consensus.quorum) {
      throw new Error(`Consensus quorum not met for ${project.sacmId}`)
    }
    if (project.status === 'rejected') {
      throw new Error(`Project ${project.sacmId} was rejected at bridge`)
    }

    const { strippedKeys } = stripVendorLocks(project.payload)
    const sovereignAt = new Date().toISOString()
    const participantId = `part_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`
    const tier = assignTier(consensus.approvalCount, consensus.requiredQuorum)
    const ledgerAnchor = this.hmac(`sovereign:${project.sacmId}:${participantId}:${consensus.wormHash}:${sovereignAt}`)

    return {
      participantId,
      sacmId: project.sacmId,
      legacyId: project.legacyId,
      seitCertification: tier,
      charter: 'SEIT-NGO-EIN-42-2652897',
      ledgerAnchor,
      consensusRef: consensus.consensusId,
      strippedKeys,
      sovereignAt,
      publicObserver: tier === 'observer',
      architecture: 'Entangled-Partner-FSM',
      sentinelSeal: this.sign('SENTINEL', sovereignAt, ledgerAnchor),
      mnemexSeal: this.sign('MNEMEX', sovereignAt, ledgerAnchor),
    }
  }

  verifyParticipant(record: ParticipantRecord, consensus: ConsensusProof): boolean {
    const expectedSentinel = this.sign('SENTINEL', record.sovereignAt, record.ledgerAnchor).signature
    const expectedMnemex = this.sign('MNEMEX', record.sovereignAt, record.ledgerAnchor).signature
    return (
      record.consensusRef === consensus.consensusId &&
      record.sentinelSeal.signature === expectedSentinel &&
      record.mnemexSeal.signature === expectedMnemex
    )
  }

  private sign(agent: string, timestamp: string, anchor: string): AgentWorkSeal {
    return {
      agent,
      timestamp,
      signature: this.hmac(`${agent}:${timestamp}:${anchor}`),
    }
  }

  private hmac(message: string): string {
    return crypto.createHmac('sha256', this.secret).update(message).digest('hex')
  }
}

export function stripVendorLocks(payload: unknown): { cleaned: unknown; strippedKeys: string[] } {
  if (Array.isArray(payload)) {
    const parts = payload.map(stripVendorLocks)
    return {
      cleaned: parts.map(part => part.cleaned),
      strippedKeys: parts.flatMap(part => part.strippedKeys),
    }
  }
  if (payload === null || typeof payload !== 'object') return { cleaned: payload, strippedKeys: [] }

  const cleaned: Record<string, unknown> = {}
  const strippedKeys: string[] = []
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (VENDOR_LOCK_KEYS.some(deny => key.toLowerCase().includes(deny.toLowerCase()))) {
      strippedKeys.push(key)
      continue
    }
    const child = stripVendorLocks(value)
    cleaned[key] = child.cleaned
    strippedKeys.push(...child.strippedKeys.map(childKey => `${key}.${childKey}`))
  }
  return { cleaned, strippedKeys }
}

export function assignTier(approvalCount: number, requiredQuorum: number): SovereignTier {
  if (requiredQuorum <= 0) return 'observer'
  const ratio = approvalCount / requiredQuorum
  if (ratio >= 1.5) return 'igneous'
  if (ratio >= 1.0) return 'sovereign'
  return 'observer'
}
