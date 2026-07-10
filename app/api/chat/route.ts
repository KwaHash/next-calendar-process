import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  try {
    const { messages, target } = await request.json() as {
      messages: Array<{ role: string; content: string }>
      target?: string
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const language = target === 'ja' ? 'Japanese (日本語)' : 'Portuguese (Português)'
    const scriptRule =
      target === 'ja'
        ? 'The output must use Japanese script (kanji, hiragana, katakana) only. ' +
          'Transliterate any Latin-script or foreign words into katakana (e.g., "Kawasaki" → "カワサキ"). ' +
          'Do not leave any Latin-script characters in the output.'
        : 'The output must use the Latin alphabet only. ' +
          'Transliterate any Japanese words, including kanji, hiragana, and katakana, into the Latin alphabet (e.g., "川崎" → "Kawasaki"). ' +
          'Do not leave any Japanese characters in the output.'

    const systemPrompt: OpenAI.ChatCompletionMessageParam = {
      role: 'system',
      content:
        `You are a translation engine like Google Translate. Translate the user's message into ${language}. ` +
        'Translate or transliterate EVERY word, including proper nouns, personal names, and place names. ' +
        `${scriptRule} ` +
        `Output only the ${language} translation — no explanations, notes, parenthetical readings, or the original text. ` +
        'Preserve the meaning, tone, formatting, and any line breaks of the original.',
    }

    // Get the FULL translation reliably: non-streaming + retry, so a transient
    // failure or a truncated stream can never leave the text partly translated.
    const translate = async (): Promise<string> => {
      let lastError: unknown = new Error('Translation failed')
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [systemPrompt, ...(messages as OpenAI.ChatCompletionMessageParam[])],
            temperature: 0,
          })
          const choice = completion.choices[0]
          const text = choice?.message?.content?.trim() ?? ''
          // Retry if the model returned nothing or was cut off by the token limit.
          if (text && choice?.finish_reason !== 'length') return text
          lastError = new Error(`Incomplete translation (finish_reason: ${choice?.finish_reason ?? 'none'})`)
        } catch (err) {
          lastError = err
        }
      }
      throw lastError instanceof Error ? lastError : new Error('Translation failed')
    }

    const fullText = await translate()

    // Emit the completed translation in the existing NDJSON incremental shape
    // (re-chunked for a smooth reveal). Every line carries the accumulated text,
    // and the final line always carries the complete translation.
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      start(controller) {
        const CHUNK_SIZE = 24
        for (let i = CHUNK_SIZE; i < fullText.length; i += CHUNK_SIZE) {
          const payload = { content: [{ type: 'text' as const, text: fullText.slice(0, i) }] }
          controller.enqueue(encoder.encode(JSON.stringify(payload) + '\n'))
        }
        const finalPayload = { content: [{ type: 'text' as const, text: fullText }] }
        controller.enqueue(encoder.encode(JSON.stringify(finalPayload) + '\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' },
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Chat request failed' },
      { status: 500 }
    )
  }
}
