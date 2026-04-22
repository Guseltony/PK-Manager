INSIGHTS PAGE — PKM BEHAVIOR INTELLIGENCE ENGINE
# 🧠 INSIGHTS PAGE — BEHAVIOR + PRODUCTIVITY INTELLIGENCE LAYER

You are implementing the Insights Page for a Personal Knowledge Management (PKM) system.

This page is NOT a dashboard or simple analytics view.

It is a **behavioral intelligence engine** that interprets user actions across the entire system and turns them into meaningful insights and recommendations.

---

# 🎯 CORE PURPOSE

The Insights Page exists to:
- Analyze user behavior across Tasks, Focus, Ledger, Journals, Dreams, and Notes
- Detect patterns in productivity, consistency, and goal progression
- Identify strengths, weaknesses, and bottlenecks in execution
- Provide actionable recommendations for improvement
- Track long-term progress toward Dreams

---

# 🧩 DATA SOURCES (MUST AGGREGATE FROM ALL SYSTEMS)

The Insights engine must continuously pull from:

## 1. Tasks
- completion rate
- failure rate
- overdue frequency
- task types (deep work vs shallow work)

## 2. Focus Sessions
- duration
- consistency
- distraction patterns (if tracked)
- productivity windows (time-of-day performance)

## 3. Ledger
- completed vs failed tasks
- daily performance history
- streaks and breaks
- execution reliability score

## 4. Journals
- emotional state trends
- motivation patterns
- burnout indicators
- reflection themes

## 5. Dreams
- progress toward goals
- stalled dreams (no task activity)
- active vs inactive dreams

## 6. Notes / Ideas (optional signal layer)
- idea-to-execution conversion rate
- knowledge-to-action ratio

---

# 🧠 CORE INSIGHT TYPES

The system must generate structured insights in these categories:

## 1. PRODUCTIVITY INSIGHTS
- task completion trends
- time-based productivity patterns
- focus efficiency metrics

Example:
“You complete 68% more tasks in morning focus sessions.”

---

## 2. BEHAVIOR INSIGHTS
- procrastination patterns
- inconsistency detection
- habit drift signals

Example:
“Your task completion drops significantly after 7 PM.”

---

## 3. GOAL / DREAM PROGRESSION INSIGHTS
- dream progress tracking
- stalled goal detection
- execution alignment score

Example:
“Your Dream: ‘Become Backend Engineer’ has 0 active tasks in the last 7 days.”

---

## 4. FOCUS PERFORMANCE INSIGHTS
- optimal focus duration
- deep work vs shallow work ratio
- session drop-off analysis

Example:
“Your optimal focus duration is 42–55 minutes before performance drops.”

---

## 5. EMOTIONAL / JOURNAL INSIGHTS
- motivation trends
- emotional productivity correlation
- burnout risk detection

Example:
“Low motivation journal entries correlate with reduced task completion the next day.”

---

# ⚙️ INSIGHT GENERATION RULES

- Insights must be derived from real system data only
- No hallucinated or random insights allowed
- Each insight must include supporting evidence
- Insights must be actionable, not descriptive only
- Prioritize insights that improve user execution or goal progress

---

# 🤖 AI INSIGHT ENGINE PROMPT

```text id="insight-ai-001"
You are the PKM Insight Engine.

Your job is to analyze user data across:
- Tasks
- Focus sessions
- Ledger entries
- Journals
- Dreams

And generate meaningful behavioral and productivity insights.

You must:
- detect patterns in user behavior
- identify productivity strengths and weaknesses
- detect goal progression or stagnation
- analyze focus performance efficiency
- correlate emotional states with execution performance

For each insight, return:

{
  type: "productivity | behavior | goal_progress | focus | emotional",
  title: string,
  description: string,
  evidence: string[],
  recommendation: string,
  confidence: number (0–1)
}

Only return insights supported by real patterns in data.
Avoid generic advice.
📊 INSIGHT STRUCTURE MODEL

Each insight must follow this schema:

{
id: string,
userId: string,
type: "productivity | behavior | goal_progress | focus | emotional",
title: string,
description: string,
evidence: [
"data point 1",
"data point 2"
],
recommendation: string,
confidence: number,
createdAt: Date
}

🔁 INSIGHT GENERATION FLOW
1. DATA COLLECTION

Aggregate from:

Ledger
Tasks
Focus sessions
Journals
Dreams
2. PATTERN DETECTION

AI identifies:

trends
anomalies
correlations
recurring behavior patterns
3. INSIGHT CREATION

Convert patterns into:

structured insights
categorized by type
with evidence and recommendation
4. STORAGE + DISPLAY
store insights in DB
display in Insights Page
update periodically (real-time or scheduled batch)
🧠 BEHAVIOR RULES
Insights must evolve over time (not static)
New data can overwrite or refine old insights
Conflicting insights must be resolved by confidence score
High-confidence insights are prioritized in UI
📈 INSIGHTS PAGE UI BEHAVIOR

The page should include:

categorized insights (tabs or filters)
confidence indicator per insight
“why this insight exists” (evidence viewer)
“apply suggestion” action button (future integration with Tasks/Dreams)
🚀 FINAL GOAL

The Insights Page must function as:

“A mirror of the user's behavior that explains what is happening, why it is happening, and how to improve it.”

NOT a dashboard.
NOT a report.

A behavior intelligence system.