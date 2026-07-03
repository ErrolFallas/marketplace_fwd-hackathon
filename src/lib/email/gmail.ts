import 'server-only'
import nodemailer from 'nodemailer'
import { serverEnv } from '@/lib/env.server'

// Timeouts explícitos para no colgar la operación si Gmail no responde.
const CONNECTION_TIMEOUT_MS = 10_000
const GREETING_TIMEOUT_MS = 10_000
const SOCKET_TIMEOUT_MS = 20_000

export function createGmailTransport() {
  if (!serverEnv.GMAIL_USER || !serverEnv.GMAIL_APP_PASSWORD) {
    throw new Error('GMAIL_USER y GMAIL_APP_PASSWORD son requeridas')
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: serverEnv.GMAIL_USER,
      pass: serverEnv.GMAIL_APP_PASSWORD,
    },
    connectionTimeout: CONNECTION_TIMEOUT_MS,
    greetingTimeout: GREETING_TIMEOUT_MS,
    socketTimeout: SOCKET_TIMEOUT_MS,
  })
}

export function getGmailFrom(): string {
  return `FWD Talent <${serverEnv.GMAIL_USER}>`
}
