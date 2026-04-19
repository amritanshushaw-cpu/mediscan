/**
 * api/tts.js
 * Bhashini Text-to-Speech serverless endpoint.
 * POST /api/tts  { text: "...", language: "hi" }
 * Returns: { audioBase64: "...", mimeType: "audio/wav" }
 * Falls back gracefully if Bhashini keys are not set.
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const text     = body.text;
  const language = body.language || 'hi';
  const gender   = body.gender   || 'female';

  if (!text || !text.trim()) return res.status(400).json({ error: 'Text required.' });

  const bhashiniKey    = process.env.BHASHINI_API_KEY;
  const bhashiniUserId = process.env.BHASHINI_USER_ID;

  if (!bhashiniKey || !bhashiniUserId) {
    return res.status(503).json({ error: 'Bhashini TTS not configured. Use Web Speech API fallback.' });
  }

  try {
    // Step 1: Get TTS pipeline config
    const pipelineRes = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userID': bhashiniUserId,
        'ulcaApiKey': bhashiniKey
      },
      body: JSON.stringify({
        pipelineTasks: [{
          taskType: 'tts',
          config: {
            language: { sourceLanguage: language },
            gender: gender
          }
        }],
        pipelineRequestConfig: { pipelineId: 'ai4bharat/indic-tts' }
      })
    });

    if (!pipelineRes.ok) {
      const err = await pipelineRes.text();
      console.error('Bhashini pipeline config error:', err);
      return res.status(502).json({ error: 'Bhashini pipeline error.' });
    }

    const pipelineData = await pipelineRes.json();
    const config = pipelineData.pipelineResponseConfig &&
                   pipelineData.pipelineResponseConfig[0] &&
                   pipelineData.pipelineResponseConfig[0].config &&
                   pipelineData.pipelineResponseConfig[0].config[0];

    if (!config) return res.status(502).json({ error: 'Bhashini returned empty pipeline config.' });

    const serviceId  = config.serviceId;
    const callbackUrl = pipelineData.pipelineInferenceAPIEndPoint.callbackUrl;
    const inferKey   = pipelineData.pipelineInferenceAPIEndPoint.inferenceApiKey.value;

    // Step 2: Call TTS inference
    const inferRes = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': inferKey
      },
      body: JSON.stringify({
        pipelineTasks: [{
          taskType: 'tts',
          config: {
            language: { sourceLanguage: language },
            serviceId: serviceId,
            gender: gender,
            samplingRate: 8000
          },
          input: [{ source: text }]
        }],
        inputData: { input: [{ source: text }] }
      })
    });

    if (!inferRes.ok) {
      const err = await inferRes.text();
      console.error('Bhashini TTS inference error:', err);
      return res.status(502).json({ error: 'Bhashini TTS inference failed.' });
    }

    const inferData = await inferRes.json();
    const audioContent = inferData.pipelineResponse &&
                         inferData.pipelineResponse[0] &&
                         inferData.pipelineResponse[0].audio &&
                         inferData.pipelineResponse[0].audio[0] &&
                         inferData.pipelineResponse[0].audio[0].audioContent;

    if (!audioContent) {
      console.error('No audio in Bhashini response:', JSON.stringify(inferData).slice(0, 300));
      return res.status(502).json({ error: 'No audio returned from Bhashini.' });
    }

    return res.status(200).json({
      audioBase64: audioContent,
      mimeType: 'audio/wav',
      language: language
    });

  } catch (err) {
    console.error('[Bhashini TTS fatal]', err && err.message);
    return res.status(500).json({ error: 'TTS error: ' + (err && err.message || 'unknown') });
  }
};
