import { ALLOWED_ENGLISH_WORDS } from '../data/wordBank';
import { getLocalHint } from './localHints';
import type { ModuleType, HintTrigger } from './localHints';

export interface CoachRequest {
  taskType: string;
  word: string;
  childChoice?: string;
  recentErrors?: string[];
  attemptCount?: number;
}

export interface CoachResponse {
  hint: string;
  emoji: string;
}

const WORD_LIST = Array.from(ALLOWED_ENGLISH_WORDS).join(', ');

const SYSTEM_PROMPT = `אתה מלווה לימודי לילד בן 9 שלומד אנגלית. החוקים שלך:

1. אתה תמיד מדבר בעברית.
2. אתה אף פעם לא חושף את התשובה הנכונה. אף פעם. בשום מצב.
3. אם המשימה היא לזהות מילה — תן רמז עם אימוג'י או דימוי ("תחשוב על מה שלובשים על הרגליים כשיורד גשם 🌧️")
4. אם המשימה היא לבנות משפט — תן רמז על המבנה ("קודם מגיע ה-The, אחר כך הדבר, אחר כך is")
5. אם המשימה היא Magic E — הסבר את הכלל בדימוי ("ה-e הקסומה משנה את הצליל, כמו שרביט קסם ✨")
6. אם המשימה היא מחירים — עזור עם המספר ("תספור כמה עשיריות יש פה")
7. אסור להשתמש במילים באנגלית שלא ברשימה המאושרת: ${WORD_LIST}
8. תהיה קצר — שורה אחת או שתיים מקסימום.
9. תשתמש באימוג'י אחד רלוונטי בכל תגובה.
10. אל תהיה מתנשא. דבר כמו חבר גדול, לא כמו מורה.`;

function mapTaskToModule(taskType: string): ModuleType {
  if (taskType.includes('magic') || taskType === 'magicE') return 'magicE';
  if (taskType.includes('sentence')) return 'sentenceBuilder';
  if (taskType.includes('price')) return 'priceTag';
  if (taskType.includes('vocab') || taskType.includes('vocabulary')) return 'vocabulary';
  if (taskType.includes('boss')) return 'boss';
  if (taskType.includes('mock') || taskType.includes('test')) return 'mockTest';
  return 'vocabulary';
}

function mapAttemptToTrigger(attemptCount: number): HintTrigger {
  if (attemptCount >= 3) return 'wrong_3';
  if (attemptCount >= 2) return 'wrong_2';
  return 'wrong_1';
}

function getFallbackHint(taskType: string, attemptCount: number = 1): CoachResponse {
  const module = mapTaskToModule(taskType);
  const trigger = mapAttemptToTrigger(attemptCount);
  const hint = getLocalHint(module, trigger);
  return { hint, emoji: '💡' };
}

export async function getCoachHint(request: CoachRequest): Promise<CoachResponse> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    return getFallbackHint(request.taskType, request.attemptCount);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `סוג משימה: ${request.taskType}. מילה/פריט: ${request.word}. ${request.childChoice ? `הילד בחר: ${request.childChoice}.` : ''} ${request.attemptCount ? `מספר ניסיונות בשאלה: ${request.attemptCount}.` : ''} ${request.recentErrors && request.recentErrors.length > 0 ? `טעויות אחרונות: ${request.recentErrors.join(', ')}.` : ''} תן רמז קצר בעברית. תחזיר JSON: {"hint": "...", "emoji": "..."}`
        }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return getFallbackHint(request.taskType, request.attemptCount);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    try {
      const jsonMatch = text.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const hint = parsed.hint || '';
        if (hint && hint.length < 200) {
          return { hint, emoji: parsed.emoji || '💡' };
        }
      }
    } catch {
      // If JSON parsing fails, try to use the text directly
      if (text.length > 0 && text.length < 200) {
        return { hint: text, emoji: '💡' };
      }
    }

    return getFallbackHint(request.taskType, request.attemptCount);
  } catch {
    clearTimeout(timeoutId);
    return getFallbackHint(request.taskType, request.attemptCount);
  }
}
