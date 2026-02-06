# TomEnglish - אפליקציית לימוד אנגלית

אפליקציית ווב אינטראקטיבית להכנה למבחן באנגלית, מותאמת לילדים עם ADHD.

## התקנה והרצה

```bash
npm install
npm run dev
```

האפליקציה תרוץ על `http://localhost:5173`

## בנייה לפרודקשן

```bash
npm run build
```

## בדיקות

```bash
npm test
```

## הגדרת Claude API (אופציונלי)

האפליקציה עובדת **מלאה** גם בלי API. ה-API מוסיף רמזים חכמים בלבד.

ליצירת קובץ `.env` בתיקיית הפרויקט:

```bash
VITE_CLAUDE_API_KEY=sk-ant-api03-...
```

## מה כולל הפרויקט

### מודולים

| מודול | תיאור | מפתח |
|-------|--------|------|
| מעבדת Magic E | תרגול שינוי צליל עם הוספת e | `✨` |
| בונה משפטים | בניית משפטים בגרירה | `🧩` |
| תג מחיר | התאמת פריט + מספר + dollar | `💰` |
| אוצר מילים | 3 מצבי משחק: זיכרון, מהירות, זרקור | `🎯` |

### תכונות נוספות

- **שלבי בוס** - שלב מסכם לכל קטגוריה (90 שניות, 3 לבבות)
- **מבחן דמה** - מבחן מסכם בפורמט המורה (20 שאלות)
- **מנוע אדפטיבי** - מילים חלשות מופיעות יותר
- **מאמן חכם** - רמזים מ-Claude API (עם fallback מקומי)
- **ניקוד וקומבו** - מערכת נקודות עם מכפיל רצף
- **מצב שקט** - כיבוי אנימציות וסאונד

### אוסף מילים

האפליקציה משתמשת **אך ורק** במילון המאושר:

- **Magic E**: bake, game, home, nose, rule, same, size, wake up
- **בגדים**: boots, clothes, coat, dress, pants, shirt, shoes, skirt, socks, sweater
- **מספרים**: thirty, forty, fifty, sixty, seventy, eighty, ninety, hundred, dollar
- **בית וכללי**: bathroom, bedroom, living room, kitchen, room, mirror, store, online, clean, close, cold, long, new, old, warm, wear, write, door, face, flute, late, more, smile, think

## מבנה הפרויקט

```
src/
├── data/wordBank.ts          # מילון + אימוג'י + קטגוריות
├── engine/adaptive.ts        # מנוע למידה אדפטיבי
├── store/gameStore.ts        # ניהול מצב (Zustand)
├── services/claudeCoach.ts   # שירות רמזים חכמים
├── components/ui/            # רכיבי UI
├── games/                    # מודולי משחק
│   ├── MagicELab.tsx
│   ├── SentenceBuilder.tsx
│   ├── PriceTag.tsx
│   ├── Vocabulary.tsx
│   ├── BossLevel.tsx
│   └── MockTest.tsx
├── routes/                   # מסכים
│   ├── Welcome.tsx
│   └── Home.tsx
├── hooks/                    # hooks מותאמים
└── test/                     # בדיקות
```

## טכנולוגיות

- React 19 + TypeScript
- Vite 7
- Zustand (ניהול מצב)
- Framer Motion (אנימציות)
- Tailwind CSS 4 (עיצוב)
- Vitest + Testing Library (בדיקות)
