'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { COMMANDS } from '@/lib/terminal/commands'
import type { CommandResult, ContactFlow, TerminalLine, TerminalState } from '@/types/terminal'

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function makeLine(
  type: TerminalLine['type'],
  content: TerminalLine['content'],
): TerminalLine {
  return { id: makeId(), type, content }
}

function hydrateLines(lines: Omit<TerminalLine, 'id'>[]): TerminalLine[] {
  return lines.map(l => ({ ...l, id: makeId() }))
}

const INITIAL_STATE: TerminalState = {
  lines: [
    makeLine('system', 'Welcome to vishrut.tech'),
    makeLine('system', "Type 'help' to see available commands."),
  ],
  input: '',
  history: [],
  historyIndex: -1,
  isLoading: false,
  contactFlow: null,
}

export function useTerminal() {
  const [state, setState] = useState<TerminalState>(INITIAL_STATE)
  const outputRef = useRef<HTMLDivElement | null>(null)
  // Keep a ref to state so async callbacks always see current state
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  // Auto-scroll output pane on new lines
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [state.lines])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, input: e.target.value }))
  }, [])

  // ─── Contact flow ─────────────────────────────────────────────────────────

  const advanceContactFlow = useCallback(async (flow: ContactFlow, trimmed: string) => {
    if (flow.step === 'name') {
      if (!trimmed) {
        setState(prev => ({
          ...prev,
          lines: [...prev.lines, makeLine('error', 'Name cannot be empty.')],
        }))
        return
      }
      setState(prev => ({
        ...prev,
        lines: [...prev.lines, makeLine('output', 'Enter your email:')],
        contactFlow: { step: 'email', data: { name: trimmed } },
      }))
      return
    }

    if (flow.step === 'email') {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
      if (!valid) {
        setState(prev => ({
          ...prev,
          lines: [...prev.lines, makeLine('error', 'Please enter a valid email address.')],
        }))
        return
      }
      setState(prev => ({
        ...prev,
        lines: [...prev.lines, makeLine('output', 'Enter your message:')],
        contactFlow: { step: 'message', data: { ...flow.data, email: trimmed } },
      }))
      return
    }

    if (flow.step === 'message') {
      if (!trimmed) {
        setState(prev => ({
          ...prev,
          lines: [...prev.lines, makeLine('error', 'Message cannot be empty.')],
        }))
        return
      }
      const { name, email } = flow.data
      setState(prev => ({
        ...prev,
        lines: [
          ...prev.lines,
          makeLine('output', `Name:    ${name}`),
          makeLine('output', `Email:   ${email}`),
          makeLine('output', `Message: ${trimmed}`),
          makeLine('output', 'Send? (yes/no)'),
        ],
        contactFlow: { step: 'confirm', data: { ...flow.data, message: trimmed } },
      }))
      return
    }

    if (flow.step === 'confirm') {
      if (trimmed === 'yes') {
        setState(prev => ({ ...prev, isLoading: true }))
        try {
          const res = await fetch('/api/terminal/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(flow.data),
          })
          const successLine = res.ok
            ? makeLine('output', "Message sent! I'll get back to you soon.")
            : makeLine('error', 'Failed to send. Try emailing me at zvishrut@gmail.com.')
          setState(prev => ({
            ...prev,
            isLoading: false,
            contactFlow: null,
            lines: [...prev.lines, successLine],
          }))
        } catch {
          setState(prev => ({
            ...prev,
            isLoading: false,
            contactFlow: null,
            lines: [
              ...prev.lines,
              makeLine('error', 'Network error. Try emailing me at zvishrut@gmail.com.'),
            ],
          }))
        }
      } else {
        setState(prev => ({
          ...prev,
          contactFlow: null,
          lines: [...prev.lines, makeLine('output', 'Cancelled.')],
        }))
      }
    }
  }, [])

  // ─── Command dispatch ─────────────────────────────────────────────────────

  const runCommand = useCallback(async (raw: string) => {
    const [name, ...args] = raw.trim().split(/\s+/)
    const key = name.toLowerCase()

    // Resolve command by name or alias
    let def = COMMANDS[key]
    if (!def) {
      const entry = Object.entries(COMMANDS).find(([, d]) => d.aliases?.includes(key))
      if (entry) def = entry[1]
    }

    if (!def) {
      setState(prev => ({
        ...prev,
        lines: [...prev.lines, makeLine('error', `command not found: ${key}`)],
      }))
      return
    }

    const currentState = stateRef.current

    if (def.type === 'sync') {
      const result = def.handler(args, currentState) as CommandResult
      setState(prev => ({
        ...prev,
        lines: [...prev.lines, ...hydrateLines(result.lines)],
        ...(result.nextState ?? {}),
      }))
      return
    }

    // Async: show a loading placeholder, then swap it out
    const loadingId = makeId()
    setState(prev => ({
      ...prev,
      isLoading: true,
      lines: [...prev.lines, { id: loadingId, type: 'system' as const, content: 'Loading...' }],
    }))

    try {
      const result = await (def.handler(args, currentState) as Promise<CommandResult>)
      setState(prev => ({
        ...prev,
        isLoading: false,
        lines: [
          ...prev.lines.filter(l => l.id !== loadingId),
          ...hydrateLines(result.lines),
        ],
        ...(result.nextState ?? {}),
      }))
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
        lines: [
          ...prev.lines.filter(l => l.id !== loadingId),
          makeLine('error', 'Command failed. Please try again.'),
        ],
      }))
    }
  }, [])

  // ─── Keyboard handler ─────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      const { input, history, historyIndex, contactFlow, isLoading } = stateRef.current
      if (isLoading) return

      // Ctrl+C — cancel contact flow
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault()
        setState(prev => ({
          ...prev,
          input: '',
          contactFlow: null,
          lines: [...prev.lines, makeLine('system', '^C')],
        }))
        return
      }

      // Ctrl+L — clear
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault()
        setState(prev => ({ ...prev, lines: [], input: '' }))
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const next = Math.min(historyIndex + 1, history.length - 1)
        setState(prev => ({ ...prev, historyIndex: next, input: history[next] ?? '' }))
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = Math.max(historyIndex - 1, -1)
        setState(prev => ({
          ...prev,
          historyIndex: next,
          input: next === -1 ? '' : history[next],
        }))
        return
      }

      if (e.key === 'Tab') {
        e.preventDefault()
        if (!input.trim()) return
        const allNames = [
          ...Object.keys(COMMANDS),
          ...Object.values(COMMANDS).flatMap(d => d.aliases ?? []),
        ]
        const matches = allNames.filter(n => n.startsWith(input.toLowerCase()))
        if (matches.length === 1) {
          setState(prev => ({ ...prev, input: matches[0] }))
        }
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        const trimmed = input.trim()

        // Echo the typed line and update history
        setState(prev => ({
          ...prev,
          input: '',
          historyIndex: -1,
          lines: [...prev.lines, makeLine('input', trimmed || '')],
          history: trimmed
            ? [trimmed, ...prev.history.filter(h => h !== trimmed)]
            : prev.history,
        }))

        if (!trimmed) return

        if (contactFlow) {
          await advanceContactFlow(contactFlow, trimmed)
        } else {
          await runCommand(trimmed)
        }
      }
    },
    [advanceContactFlow, runCommand],
  )

  const appendLine = useCallback(
    (type: TerminalLine['type'], content: TerminalLine['content']) => {
      setState(prev => ({ ...prev, lines: [...prev.lines, makeLine(type, content)] }))
    },
    [],
  )

  return {
    lines: state.lines,
    input: state.input,
    isLoading: state.isLoading,
    handleInputChange,
    handleKeyDown,
    outputRef,
    appendLine,
  }
}
