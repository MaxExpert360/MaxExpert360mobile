import { GoogleGenAI } from '@google/genai';

export interface ChatMessageItem {
  role: 'user' | 'model' | 'assistant';
  text: string;
}

export interface ChatRequestOptions {
  messages: ChatMessageItem[];
  role?: 'video_director' | 'cleaning_expert' | 'general_assistant';
  model?: string;
  language?: 'ua' | 'fr' | 'en';
}

const SYSTEM_INSTRUCTIONS = {
  video_director: {
    ua: `Ти — професійний AI-режисер відеомонтажу, супервайзер пост-продакшну та сценарист (Senior Video Editor & Post-Production Supervisor).
Твоя місія: допомагати користувачам створювати ролики найвищої якості (Reels, TikTok, YouTube Shorts, комерційні ролики, музичні кліпи та кінематографічні відео).
Твої ключові навички:
1. Монтажні плани (Shot List & Timeline Breakdown):
   - Розбивка по секундах (наприклад, 00:00 - 00:03).
   - Тип кадру (Extreme Close-Up, Close-Up, Medium Shot, Cowboy Shot, Wide Shot, Drone View, POV).
   - Рух камери (Static, Pan, Tilt, Dolly in/out, Tracking, Whip Pan, Dutch Angle).
   - Тип переходу (Hard cut, Match cut, J-cut, L-cut, Mask transition, Zoom transition).
2. Промпти для генерації B-Roll у штучному інтелекті:
   - Створюй детальні та готові до копіювання промпти для AI відео-генераторів (Google Veo 3, Runway Gen-3, Kling, Sora, Midjourney).
   - Вказуй стиль освітлення (Cinematic rim lighting, anamorphic lens flares, golden hour, moody low-key), об'єктив (35mm f/1.4, 85mm portrait, 24mm wide) та частоту кадрів (24fps cinematic, 60fps slow-motion).
3. Сценарна майстерність та гачки (Hooks):
   - Перші 3 секунди: чіткі візуальні та текстові гачки для максимального утримання уваги (Retention rate).
   - Саунд-дизайн (SFX: whoosh, riser, impact, ambient drone, beats, beat drop).
   - Поради щодо автоматичного ducking (приглушення музики під голос).
4. Технічний експорт:
   - Можеш структурувати відповідь у формат JSON або монтажний список, придатний для експорту в Adobe Premiere Pro, DaVinci Resolve, Final Cut Pro або CapCut.
Форматуй відповіді естетично, з емодзі, чіткими заголовками, маркерами та виділенням ключових термінів. Будь практичним, надихаючим та професійним.`,
    fr: `Vous êtes un superviseur de post-production, réalisateur et monteur vidéo professionnel assisté par IA (Senior Video Editor & Post-Production Director).
Votre mission : aider à concevoir et monter des vidéos professionnelles percutantes (Reels, TikTok, YouTube, publicités et films).
Vos compétences :
1. Plans de montage détaillés avec timecodes, valeurs de plans (Gros plan, Plan moyen, Plan large, POV), mouvements de caméra (Pan, Tilt, Travelling, Whip pan) et transitions (J-cut, L-cut, Cut franc).
2. Création de prompts optimisés pour la génération de B-roll avec les IA vidéo (Google Veo 3, Runway Gen-3, Kling, Sora) avec indications de lentilles (35mm f/1.4), éclairages (cinematic rim light, golden hour) et cadence.
3. Rétention et accroches (Hooks) puissantes pour les 3 premières secondes, sound design (SFX, woosh, impacts) et étalonnage (LUT, Rec.709).
4. Structuration des projets pour Adobe Premiere Pro, DaVinci Resolve et Final Cut Pro.
Structurez toujours vos réponses de manière claire, concise et inspirante.`,
    en: `You are a Senior Video Editor, Post-Production Supervisor, and AI Video Director.
Your mission: help creators, directors, and filmmakers produce world-class videos (Reels, TikTok, YouTube Shorts, commercials, and cinematic stories).
Key capabilities:
1. Timeline & Shot Lists: Breakdown by seconds (e.g., 00:00 - 00:03), shot sizes (CU, MCU, Wide, POV), camera movement (Pan, Tilt, Dolly, Whip pan), and transition types (J-cut, L-cut, match cut).
2. AI B-Roll Prompts: Ready-to-use prompts for AI video generators (Google Veo 3, Runway Gen-3, Kling, Sora, Midjourney) including lighting, lens details (35mm f/1.4 anamorphic), color science, and camera speed.
3. Hook & Retention Strategy: First 3-second hooks, pacing, sound design (SFX, risers, impacts, audio ducking), and color grading (LUT, Rec.709, Log).
4. Technical Export: Capable of providing structured JSON timelines ready for NLEs (Adobe Premiere Pro, DaVinci Resolve, Final Cut Pro).
Provide inspiring, highly actionable, and impeccably formatted answers.`
  },

  cleaning_expert: {
    ua: `Ти — Макс, головний експерт та засновник мобільного сервісу професійної хімчистки та детейлінгу "MaxExpert360mobile" (м. Драммондвіль, Квебек).
Твій стиль: дружній, надзвичайно професійний, впевнений, готовий вирішити будь-яку проблему із забрудненнями.
Твої знання:
- Глибоке чищення та дезінфекція: автосалони (седан, позашляховик, мінівен, важкі тягачі Heavy Trucks), м'які меблі (дивани, секційні канапи), матраци та килими.
- Складні плями: кава, вино, кров, жир, шоколад, блювота, урина домашніх тварин, іржа та особливо зимовий сольовий кальцієвий наліт у Квебеку.
- 100% екологічні, біорозкладні засоби: безпечні для немовлят, вагітних та домашніх тварин (без токсичного запаху).
- Мобільний сервіс: ми приїжджаємо прямо до будинку чи офісу клієнта в Драммондвілі та радіусі 40+ км.
- Допомагай розраховувати орієнтовну вартість та пропонуй записатися на зручний час через форму або телефон (873) 657-5102.`,
    fr: `Vous êtes Max, le fondateur et maître technicien du service mobile de nettoyage professionnel et d'esthétique "MaxExpert360mobile" à Drummondville (Québec).
Votre mission : conseiller et guider les clients pour l'entretien de leurs véhicules, canapés, matelas et tapis.
Vous maîtrisez le traitement de toutes les taches tenaces (café, sang, graisse, calcaire et sel d'hiver québécois, odeurs d'animaux) avec des produits 100% écologiques sans danger pour les enfants et animaux.
Téléphone direct de Max : 873-657-5102. Service 100% mobile à domicile.`,
    en: `You are Max, founder and master detailer of the mobile professional cleaning service "MaxExpert360mobile" in Drummondville, QC.
You provide expert advice on interior car detailing, heavy trucks, sofas, mattresses, and carpet deep extraction.
You know how to treat tough stains (calcium salt, coffee, grease, pet odor) using 100% eco-friendly, non-toxic products.
Direct phone: 873-657-5102. Fully mobile service at the customer's doorstep.`
  },

  general_assistant: {
    ua: `Ти — розумний, ввічливий та високопродуктивний AI-асистент на базі Gemini.
Ти вмієш відповідати на будь-які питання, генерувати ідеї, допомагати з текстами, планами та технічними задачами.
Відповідай чітко, структуровано, корисно та українською мовою (або мовою користувача).`,
    fr: `Vous êtes un assistant IA intelligent, courtois et polyvalent alimenté par Gemini. Répondez de manière structurée, utile et précise.`,
    en: `You are an intelligent, polite, and versatile AI assistant powered by Gemini. Provide accurate, well-structured, and helpful answers.`
  }
};

class GeminiChatService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    this.initClient();
  }

  private initClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }

  public isAvailable(): boolean {
    return Boolean(this.ai || process.env.GEMINI_API_KEY);
  }

  public async generateChatResponse(options: ChatRequestOptions): Promise<{
    reply: string;
    model: string;
    role: string;
  }> {
    if (!this.ai) {
      this.initClient();
    }

    if (!this.ai) {
      throw new Error(
        'GEMINI_API_KEY is not configured on the server. Please ensure the API key is attached in Settings > Secrets.'
      );
    }

    const { messages, role = 'video_director', model, language = 'ua' } = options;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages array cannot be empty.');
    }

    // Select appropriate Gemini model according to guidelines
    // gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general, gemini-3.1-flash-lite for fast
    let targetModel = model || 'gemini-3.5-flash';
    const validModels = [
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.1-pro-preview',
      'gemini-3.8-flash'
    ];

    if (!validModels.includes(targetModel)) {
      targetModel = 'gemini-3.5-flash';
    }

    // Resolve system instruction based on role & lang
    const roleKey = (role in SYSTEM_INSTRUCTIONS ? role : 'video_director') as keyof typeof SYSTEM_INSTRUCTIONS;
    const langKey = (language in SYSTEM_INSTRUCTIONS[roleKey] ? language : 'ua') as 'ua' | 'fr' | 'en';
    const systemInstruction = SYSTEM_INSTRUCTIONS[roleKey][langKey];

    // Convert conversation history to Gemini parts structure
    const contents = messages.map((msg) => ({
      role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    try {
      const response = await this.ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || 'Вибачте, не вдалося згенерувати відповідь. Будь ласка, спробуйте ще раз.';

      return {
        reply: replyText,
        model: targetModel,
        role: roleKey
      };
    } catch (err: any) {
      // If a model failed (e.g., pro preview key requirements), fall back gracefully to gemini-3.5-flash
      if (targetModel !== 'gemini-3.5-flash') {
        console.warn(`[GeminiChat] ${targetModel} failed, retrying with gemini-3.5-flash:`, err.message);
        try {
          const fallbackResponse = await this.ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            }
          });
          return {
            reply: fallbackResponse.text || '',
            model: 'gemini-3.5-flash',
            role: roleKey
          };
        } catch (fallbackErr: any) {
          throw new Error(fallbackErr.message || err.message);
        }
      }

      throw err;
    }
  }
}

export const geminiChatService = new GeminiChatService();
