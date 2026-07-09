'use client'

import  { type ReactNode, useMemo } from 'react'
import { AssistantRuntimeProvider, Suggestions, useAui, useLocalRuntime, type ChatModelAdapter, type ChatModelRunResult } from '@assistant-ui/react'

export type Direction = 'ja-pt' | 'pt-ja'

// Target language sent to /api/chat for each direction.
const TARGET: Record<Direction, string> = {
  'ja-pt': 'pt',
  'pt-ja': 'ja',
}

const SUGGESTIONS: Record<Direction, Array<{ title: string; label: string; prompt: string }>> = {
  'ja-pt': [
    {
      title: 'あいさつ',
      label: '基本のあいさつ',
      prompt: 'はじめまして。どうぞよろしくお願いします。',
    },
    {
      title: '道案内',
      label: '駅への行き方',
      prompt: '一番近い駅までの行き方を教えてください。',
    },
    {
      title: 'レストラン',
      label: '注文する',
      prompt: 'おすすめの料理は何ですか？これを一つください。',
    },
    {
      title: 'ビジネス',
      label: 'メールの返信',
      prompt: 'ご連絡ありがとうございます。内容を確認のうえ、改めてご返信いたします。',
    },
  ],
  'pt-ja': [
    {
      title: 'Saudação',
      label: 'Saudação básica',
      prompt: 'Prazer em conhecê-lo. Muito obrigado.',
    },
    {
      title: 'Direções',
      label: 'Como chegar à estação',
      prompt: 'Pode me dizer como chegar à estação mais próxima?',
    },
    {
      title: 'Restaurante',
      label: 'Fazer um pedido',
      prompt: 'Qual é o prato recomendado? Quero um deste, por favor.',
    },
    {
      title: 'Negócios',
      label: 'Responder e-mail',
      prompt: 'Obrigado pelo contato. Após verificar o conteúdo, responderei novamente.',
    },
  ],
}

function toApiMessage(message: { role: string; content: unknown }) {
  const content = message.content
  return {
    role: message.role,
    content: typeof content === 'string' ? content : Array.isArray(content) ? content.map((part: { text?: string }) => part.text ?? '').join('\n') : '',
  }
}

function createAdapter(direction: Direction): ChatModelAdapter {
  return {
    async *run({ messages, abortSignal }) {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(toApiMessage),
          target: TARGET[direction],
        }),
        signal: abortSignal,
      })

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(err.error ?? `Chat request failed (${res.status})`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          try {
            const payload = JSON.parse(trimmed) as { content: ChatModelRunResult['content'] }
            if (payload.content) {
              yield { content: payload.content }
            }
          } catch {
            // skip malformed lines
          }
        }
      }
      if (buffer.trim()) {
        try {
          const payload = JSON.parse(buffer.trim()) as { content: ChatModelRunResult['content'] }
          if (payload.content) yield { content: payload.content }
        } catch {
          // skip
        }
      }
    },
  }
}

export function TranslateRuntimeProvider({
  direction,
  children,
}: Readonly<{ direction: Direction; children: ReactNode }>) {
  const runtime = useLocalRuntime(useMemo(() => createAdapter(direction), [direction]))

  const aui = useAui({
    suggestions: Suggestions(SUGGESTIONS[direction]),
  })

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}
