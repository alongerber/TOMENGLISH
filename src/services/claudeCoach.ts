import { ALLOWED_ENGLISH_WORDS } from '../data/wordBank';

interface CoachRequest {
  taskType: string;
  word: string;
  childChoice?: string;
  recentErrors: string[];
}

interface CoachResponse {
  hint: string;
  emoji: string;
}

const LOCAL_HINTS: Record<string, string[]> = {
  'magic-e': [
    'כשמוסיפים e בסוף, האות באמצע "אומרת את השם שלה" 🪄',
    'תחשוב על הקסם: e בסוף משנה את הצליל! ✨',
    'e בסוף = האות באמצע נשמעת אחרת 🎵',
    'תנסה להגיד את המילה בלי e ואז עם e — שומע הבדל? 👂',
  ],
  'clothing': [
    'תחשוב איזה בגד לובשים על החלק הזה של הגוף 👕',
    'תסתכל טוב על התמונה — מה לובשים שם? 👀',
    'תדמיין שאתה מתלבש בבוקר — מה שמים ראשון? 🌅',
  ],
  'numbers': [
    'תספור בעשרות: 10, 20, 30... 🔢',
    'תסתכל על המספר — כמה עשרות יש? 💰',
    'תחשוב על כסף: כמה שטרות צריך? 💵',
  ],
  'house': [
    'תדמיין שאתה הולך בבית — מה יש בחדר הזה? 🏠',
    'תחשוב מה עושים עם הדבר הזה 🤔',
    'תסתכל על האימוג\'י — הוא רמז! 😊',
  ],
  'sentence': [
    'תתחיל מ-The, אחרי זה הפריט, אחרי זה is 📝',
    'סדר: The + דבר + is + תיאור 🧩',
    'תחשוב על משפט בעברית ותתרגם חלק-חלק 🔄',
  ],
  'price': [
    'סדר: The + בגד + is + מספר + dollar 💲',
    'תסתכל על תג המחיר — כמה כתוב שם? 🏷️',
  ],
};

function getLocalHint(taskType: string): CoachResponse {
  const category = taskType.includes('magic') ? 'magic-e'
    : taskType.includes('sentence') ? 'sentence'
    : taskType.includes('price') ? 'price'
    : taskType.includes('cloth') ? 'clothing'
    : taskType.includes('number') ? 'numbers'
    : 'house';

  const hints = LOCAL_HINTS[category] || LOCAL_HINTS['house'];
  const hint = hints[Math.floor(Math.random() * hints.length)];
  return { hint, emoji: '💡' };
}

export async function getCoachHint(request: CoachRequest): Promise<CoachResponse> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    return getLocalHint(request.taskType);
  }

  try {
    const wordList = Array.from(ALLOWED_ENGLISH_WORDS).join(', ');

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
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `אתה מורה לאנגלית לילד בן 9. תן רמז קצר (שורה-שתיים בעברית) למשימה:
סוג: ${request.taskType}
מילה: ${request.word}
${request.childChoice ? `הילד בחר: ${request.childChoice}` : ''}
${request.recentErrors.length > 0 ? `טעויות אחרונות: ${request.recentErrors.join(', ')}` : ''}

חוקים קשיחים:
- רק עברית. אם חייב אנגלית — רק מהרשימה: ${wordList}
- קצר, עם דימוי או אימוג'י
- בלי הרצאות!

תחזיר JSON: {"hint": "...", "emoji": "..."}`
        }],
      }),
    });

    if (!response.ok) {
      return getLocalHint(request.taskType);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    try {
      const jsonMatch = text.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { hint: parsed.hint || getLocalHint(request.taskType).hint, emoji: parsed.emoji || '💡' };
      }
    } catch {
      // If JSON parsing fails, try to use the text directly
      if (text.length > 0 && text.length < 200) {
        return { hint: text, emoji: '💡' };
      }
    }

    return getLocalHint(request.taskType);
  } catch {
    return getLocalHint(request.taskType);
  }
}
