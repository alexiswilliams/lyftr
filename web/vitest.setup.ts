import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount anything rendered via Testing Library after each test, so mounted
// hooks/components don't leak across cases (a leaked hook keeps reacting to
// shared store updates and skews call counts).
afterEach(() => {
  cleanup()
})

// Mock localStorage to bypass Node's native implementation
const localStorageMock = (function () {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (i: number) => Object.keys(store)[i] || null,
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})
