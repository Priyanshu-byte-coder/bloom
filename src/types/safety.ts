export type CrisisSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical'

export type CrisisAssessment = {
  severity: CrisisSeverity
  detectedKeywords: string[]
  requiresImmediateResponse: boolean
  shouldSuggestExercise: boolean
}

export type OutputFilterResult = {
  safe: boolean
  filteredContent: string
  reason?: string
}

export type ScopeCheckResult = {
  inScope: boolean
  redirectMessage?: string
}
