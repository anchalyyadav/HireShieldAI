// Shared rule-based scam detection engine
// Used by both the API server (api/server.js) and the frontend scanner fallback

const RULE_SIGNALS = [
  {
    id: 'payment_request',
    title: 'Requests for payment or fees',
    description: 'The message asks for registration, training, security, or onboarding fees before you can start work.',
    patterns: [/\b(registration|training|security|onboarding|processing)\s+fee\b/i, /\bpay\b.{0,40}\b(job|offer|position|employment)\b/i, /\b(deposit|advance payment|upfront)\b/i, /\bpay\s+(up\s+to|a\s+fee)\b/i],
    weight: 25, severity: 'high',
  },
  {
    id: 'bank_details',
    title: 'Requests for bank or financial details',
    description: 'The message asks for bank account, card, or financial information — a major red flag for any job offer.',
    patterns: [/\bbank\s+(account|details|info)\b/i, /\b(credit|debit)\s+card\b/i, /\baccount\s+number\b/i, /\brouting\s+number\b/i],
    weight: 25, severity: 'high',
  },
  {
    id: 'guaranteed_offer',
    title: 'Guaranteed job offer without interview',
    description: 'The message claims you have been selected or offered a job without any interview or application process.',
    patterns: [/\b(you\s+have\s+been\s+|congratulations?\s+.*\s+)selected\b/i, /\bguaranteed?\s+(job|offer|position|placement)\b/i, /\bno\s+interview\s+(required|needed)\b/i, /\bdirect\s+selection\b/i],
    weight: 20, severity: 'high',
  },
  {
    id: 'urgency',
    title: 'Urgent deadline or pressure to act immediately',
    description: 'The message pressures you to respond within a very short timeframe to prevent you from researching or thinking it through.',
    patterns: [/\b(24|48|12)\s+hours?\b/i, /\bimmediately?\b/i, /\burgent\b/i, /\bact\s+now\b/i, /\blimited?\s+(time|positions?|slots?)\b/i, /\bfilling\s+(fast|quickly)\b/i],
    weight: 15, severity: 'medium',
  },
  {
    id: 'unrealistic_salary',
    title: 'Unrealistically high salary for minimal work',
    description: 'The message promises very high pay for simple or part-time remote work — a common scam lure.',
    patterns: [/\$\d{3,4}\s*(\/|per)\s*(day|week|hour)\b/i, /\b(earn|make|get\s+paid)\s+\$?\d{3,4}\s*(\/|per)\s*(day|week|hour)\b/i, /\b(part\s*[- ]?time|remote).{0,50}\$\d{4,}\b/i],
    weight: 15, severity: 'medium',
  },
  {
    id: 'suspicious_link',
    title: 'Suspicious or shortened links',
    description: 'The message contains shortened URLs or links to unfamiliar domains that could lead to phishing sites.',
    patterns: [/\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|shorturl\.at|cutt\.ly|is\.gd)\b/i, /\bhttps?:\/\/(?!([a-z0-9-]+\.)?(gmail|yahoo|outlook|hotmail|linkedin|indeed|glassdoor)\.com)[a-z0-9-]+\.[a-z]{2,}\b/i],
    weight: 12, severity: 'medium',
  },
  {
    id: 'free_email_recruiter',
    title: 'Recruiter using a free email domain',
    description: 'The message claims to be from a company but uses a free email service (Gmail, Yahoo, etc.) instead of a corporate domain.',
    patterns: [/\b@(gmail|yahoo|outlook|hotmail|protonmail|icloud)\.com\b/i],
    weight: 10, severity: 'medium',
  },
  {
    id: 'personal_info_request',
    title: 'Requests for sensitive personal information',
    description: 'The message asks for your Social Security number, passport, ID, or other sensitive personal documents.',
    patterns: [/\b(ssn|social\s+security)\b/i, /\bpassport\b/i, /\b(id|identity)\s+(card|document|copy)\b/i, /\b(scan|copy|send).{0,30}(passport|id|license)\b/i],
    weight: 18, severity: 'high',
  },
  {
    id: 'vague_role',
    title: 'Vague job description with no specific role',
    description: 'The message describes the work in very generic terms without a clear job title, responsibilities, or requirements.',
    patterns: [/\b(data\s+entry|envelope\s+stuffing|package\s+forwarding|mystery\s+shopper)\b/i, /\b(work\s+from\s+home).{0,80}\b(no\s+experience)\b/i],
    weight: 10, severity: 'medium',
  },
  {
    id: 'whatsapp_telegram',
    title: 'Requests to move conversation to WhatsApp or Telegram',
    description: 'The message asks you to contact them via WhatsApp, Telegram, or other messaging apps — scammers use these to avoid corporate email trails.',
    patterns: [/\b(whatsapp|telegram|signal)\s+(me|us|at|on)\b/i, /\bcontact\s+me\s+on\s+(whatsapp|telegram)\b/i],
    weight: 12, severity: 'medium',
  },
];

export function analyzeWithRules(message) {
  const detectedSignals = [];
  let score = 0;

  for (const signal of RULE_SIGNALS) {
    for (const pattern of signal.patterns) {
      if (pattern.test(message)) {
        detectedSignals.push({
          id: signal.id,
          title: signal.title,
          description: signal.description,
          severity: signal.severity,
          weight: signal.weight,
        });
        score += signal.weight;
        break;
      }
    }
  }

  score = Math.min(score, 100);

  let riskLevel, riskLabel;
  if (score >= 50) {
    riskLevel = 'high';
    riskLabel = 'HIGH';
  } else if (score >= 25) {
    riskLevel = 'medium';
    riskLabel = 'MEDIUM';
  } else {
    riskLevel = 'low';
    riskLabel = 'LOW';
  }

  let summary;
  if (detectedSignals.length === 0) {
    summary = 'No explicit scam signals were detected by the rule engine. This does not guarantee the message is safe — rule-based analysis only checks for known patterns and may miss subtle or contextual indicators.';
  } else if (riskLevel === 'high') {
    summary = `${detectedSignals.length} warning sign${detectedSignals.length > 1 ? 's were' : ' was'} detected, including high-severity indicators. This message shows strong patterns associated with job scams. Exercise caution and do not share personal or financial information.`;
  } else if (riskLevel === 'medium') {
    summary = `${detectedSignals.length} warning sign${detectedSignals.length > 1 ? 's were' : ' was'} detected. This message contains some patterns common in job scams. Verify the sender and company through official channels before proceeding.`;
  } else {
    summary = `${detectedSignals.length} minor warning sign${detectedSignals.length > 1 ? 's were' : ' was'} detected. The message appears mostly legitimate by rule-based checks, but always verify through official channels.`;
  }

  const recommendations = [];
  if (detectedSignals.some(s => s.id === 'payment_request' || s.id === 'bank_details')) {
    recommendations.push('Never pay any fee to secure a job or internship — legitimate employers do not charge candidates.');
  }
  if (detectedSignals.some(s => s.id === 'bank_details' || s.id === 'personal_info_request')) {
    recommendations.push('Do not share bank details, ID documents, or personal information until you have verified the employer.');
  }
  if (detectedSignals.some(s => s.id === 'urgency')) {
    recommendations.push('Take your time — legitimate recruiters will not pressure you to respond within hours.');
  }
  if (detectedSignals.some(s => s.id === 'suspicious_link' || s.id === 'free_email_recruiter')) {
    recommendations.push('Verify the recruiter through the company\'s official website or LinkedIn, not through contact details in the message.');
  }
  if (detectedSignals.some(s => s.id === 'guaranteed_offer')) {
    recommendations.push('A real job offer follows an interview process. Be skeptical of guaranteed offers with no application or interview.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Even with no detected signals, verify the company through official channels before sharing any information.');
    recommendations.push('If something feels off, trust your instinct and report the message.');
  }

  return {
    id: 'rule-' + Date.now(),
    riskLevel,
    riskLabel,
    riskScore: score,
    summary,
    redFlags: detectedSignals.map(s => ({ title: s.title, description: s.description, severity: s.severity })),
    recommendations,
    analysisMethod: 'rule-based',
    signalCount: detectedSignals.length,
  };
}
