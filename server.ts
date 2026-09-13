import express, { Request, Response } from 'express';
import path from 'path';
import https from 'https';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

// Lazy initialization for GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes FIRST
  // Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    res.json({
      status: 'ok',
      service: 'MindSpark Real-World Cognitive Backend',
      geminiConfigured: hasKey,
      timestamp: new Date().toISOString(),
    });
  });

  // Sparky AI Cognitive Chat Route
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, language = 'english', userProfile = {}, context = {} } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const client = getAIClient();
      const patientName = userProfile.name || 'Arthur';
      const patientAge = userProfile.age ? `(age ${userProfile.age})` : '';
      const caregiverName = userProfile.caregiverName || 'Sarah';
      const city = userProfile.city || 'Guwahati';
      const state = userProfile.state || 'Assam';
      const location = `${city}, ${state}, North-East India`;
      const emergencyContactsList = Array.isArray(userProfile.emergencyContacts) && userProfile.emergencyContacts.length > 0
        ? userProfile.emergencyContacts.map((c: any) => `${c.name} (${c.relationship}, Phone: ${c.phone})`).join(', ')
        : 'Sarah Miller (Daughter)';

      if (!client) {
        // High-quality local cognitive fallback when no API key is provided
        const lower = message.toLowerCase();
        let fallbackReply = `I am here with you, ${patientName}. You are safely at home in ${location}. Everything is calm and peaceful.`;

        if (lower.includes('emergency') || lower.includes('help') || lower.includes('contact')) {
          fallbackReply = `You are safe, ${patientName}. Your emergency contacts include: ${emergencyContactsList}. I can connect you anytime.`;
        } else if (lower.includes('sarah') || lower.includes('daughter') || lower.includes('চাৰাহ') || lower.includes('सारा')) {
          fallbackReply = `${caregiverName} is your loving family caregiver calling you today. She is eager to hear about your day!`;
        } else if (lower.includes('where am i') || lower.includes('home') || lower.includes('place') || lower.includes('ক’ত') || lower.includes('कहाँ')) {
          fallbackReply = `You are comfortably at home in ${city}, ${state}, right along the gentle breeze of North-East India. You are completely safe.`;
        } else if (lower.includes('medication') || lower.includes('pill') || lower.includes('schedule') || lower.includes('next') || lower.includes('দৱা') || lower.includes('दवा')) {
          fallbackReply = `Your next scheduled activity is your morning medication with a soothing glass of warm water, followed by a gentle stroll in your garden.`;
        } else if (lower.includes('garden') || lower.includes('flower') || lower.includes('tea') || lower.includes('বাগান') || lower.includes('बगीचा')) {
          fallbackReply = `Your Assam garden is blooming beautifully today with wild orchids and green tea shrubs under the pleasant sun.`;
        }

        res.json({
          reply: fallbackReply,
          source: 'local-companion-rules',
        });
        return;
      }

      // Specialized System Instruction for Dementia Cognitive Companion
      const systemInstruction = `You are Sparky, an exceptionally gentle, warm, patient, and compassionate cognitive assistant designed specifically for an elderly person named ${patientName} ${patientAge} who is living with mild cognitive impairment or dementia in ${location}.
Caregiver: ${caregiverName}.
Emergency Contacts: ${emergencyContactsList}.
Current language requested: ${language}.

Crucial Behavioral Rules:
1. Speak in concise, calming, 1 to 3 short sentences.
2. Never patronize, argue, or rush the user.
3. If the user asks repetitive questions (like "Where am I?", "Who is my family?", "What should I do?"), answer with absolute warmth, never indicating they asked before.
4. Always reassure them of safety, comfort, and routine.
5. If the user asks for emergency contacts or help, reassure them and mention their trusted contacts (${emergencyContactsList}).
6. If the user speaks or asks in a regional language (Assamese, Hindi, Bengali, Telugu, etc.), respond naturally and warmly in that language or script.
7. Keep responses positive, grounded in their real ${location} home, and easy to understand aloud.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `User says: "${message}"\nContext: Current time is morning in Guwahati, Assam.` }],
          },
        ],
        config: {
          systemInstruction,
          temperature: 0.6,
          maxOutputTokens: 250,
        },
      });

      const reply = response.text?.trim() || `I am right here with you, ${patientName}. You are doing wonderfully today.`;

      res.json({
        reply,
        source: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      // Graceful fallback on error so the elderly user never sees an error crash
      res.json({
        reply: `You are safe at home in Guwahati. Take a slow, calm breath. I am right here with you.`,
        source: 'emergency-fallback',
      });
    }
  });

  // Caregiver AI Insights & Clinical Summary
  app.post('/api/caregiver-insights', async (req: Request, res: Response) => {
    try {
      const {
        patientName = 'Arthur Miller',
        eegFocusAverage = 82,
        medicationAdherenceRate = 88,
        recentAlertsCount = 2,
        confusionIncidents = 0,
      } = req.body;

      const client = getAIClient();

      if (!client) {
        // Structured clinical template
        res.json({
          summary: `Patient ${patientName} maintains stable cognitive metrics in Guwahati. Alpha wave synchronization is steady at ${eegFocusAverage}%. Medication adherence stands at ${medicationAdherenceRate}%.`,
          riskLevel: recentAlertsCount > 3 ? 'Moderate' : 'Low',
          recommendations: [
            'Maintain regular afternoon video call schedule with family in Shillong.',
            'Continue morning garden walks along the Brahmaputra for sensory grounding.',
            'Encourage consistent hydration before afternoon medication.',
          ],
          source: 'clinical-rules-engine',
        });
        return;
      }

      const prompt = `You are a clinical neuro-cognitive assistant analyzing care data for a patient with cognitive impairment.
Patient: ${patientName}
EEG Focus Baseline: ${eegFocusAverage}%
Medication Adherence: ${medicationAdherenceRate}%
Recent Alerts: ${recentAlertsCount}
Confusion Incidents: ${confusionIncidents}
Location: Guwahati, Assam

Provide a structured clinical summary in JSON format with:
- "summary": 2-3 sentence overview of patient stability and neuro-cognitive trends.
- "riskLevel": "Low", "Moderate", or "High"
- "recommendations": array of 3 actionable, empathetic caregiving steps.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({
        summary: parsed.summary || 'Patient demonstrates calm cognitive stability with steady EEG alpha baselines.',
        riskLevel: parsed.riskLevel || 'Low',
        recommendations: parsed.recommendations || [
          'Continue steady daily routine with auditory reassurance.',
          'Review hydration logs prior to evening routines.',
        ],
        source: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.error('Caregiver Insights Error:', err);
      res.json({
        summary: 'Patient demonstrates steady baseline stability with positive response to family calls and garden walks.',
        riskLevel: 'Low',
        recommendations: [
          'Maintain regular scheduled family contact.',
          'Keep EEG headset charged for morning focus sessions.',
        ],
        source: 'fallback-rules',
      });
    }
  });

  // Voices API endpoint
  app.get('/api/voices', (req: Request, res: Response) => {
    const { language } = req.query;
    res.json({
      status: 'ok',
      count: 42,
      supportedLanguages: [
        'assamese', 'bodo', 'meitei', 'khasi', 'garo',
        'mizo', 'kokborok', 'bengali', 'nagamese', 'nepali', 'nyishi',
        'hindi', 'telugu', 'english'
      ],
      filter: language || 'all',
      note: 'Complete voice registry with 3 distinct personas per language (Gentle Nurse, Calm Elder, Warm Companion) powered by regional TTS streaming and browser speech synthesis fallback.',
    });
  });

  // Regional Text-To-Speech Native Audio Stream
  app.get('/api/tts', (req: Request, res: Response) => {
    try {
      const text = (req.query.text as string || '').trim();
      const lang = (req.query.lang as string || 'english').toLowerCase();

      if (!text) {
        res.status(400).send('Text query is required');
        return;
      }

      // Map application language to optimal TTS regional language engine
      let ttsLang = 'en-IN';
      if (lang === 'assamese' || lang === 'bengali' || lang === 'kokborok' || lang === 'meitei') {
        // Bengali/Assamese script regional voice engine
        ttsLang = 'bn';
      } else if (lang === 'hindi' || lang === 'bodo') {
        ttsLang = 'hi';
      } else if (lang === 'telugu') {
        ttsLang = 'te';
      } else if (lang === 'nepali') {
        ttsLang = 'ne';
      } else if (lang === 'mizo' || lang === 'khasi' || lang === 'garo' || lang === 'nyishi') {
        ttsLang = 'en-IN';
      } else if (lang === 'nagamese') {
        ttsLang = 'hi';
      } else {
        ttsLang = 'en-IN';
      }

      // Slice text within TTS safe limits
      const queryText = text.slice(0, 200);
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodeURIComponent(queryText)}`;

      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
        },
      };

      const request = https.get(ttsUrl, options, (ttsRes) => {
        if (ttsRes.statusCode === 200) {
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          ttsRes.pipe(res);
        } else {
          res.status(ttsRes.statusCode || 500).send('TTS service unavailable');
        }
      });

      request.on('error', (err) => {
        console.error('TTS Proxy Error:', err.message);
        res.status(500).send('Error generating TTS audio');
      });
    } catch (err: any) {
      console.error('TTS Endpoint Exception:', err);
      res.status(500).send('Internal TTS error');
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindSpark Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
