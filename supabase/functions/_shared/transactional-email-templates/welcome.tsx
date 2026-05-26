/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Pintask'
const SITE_URL = 'https://pintask.online'

interface WelcomeEmailProps {
  name?: string
}

const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME} — let's pin your first task</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `Welcome aboard, ${name}!` : `Welcome to ${SITE_NAME}!`}
        </Heading>
        <Text style={text}>
          You're all set. {SITE_NAME} is the personal kanban that bends to how
          you work — pin your top tasks, drag them across columns, and let the
          AI assistant break the big ones down for you.
        </Text>
        <Text style={text}>
          Jump into your board and add your first task:
        </Text>
        <Button style={button} href={SITE_URL}>
          Open my board
        </Button>
        <Text style={footer}>
          Questions or feedback? Just reply to this email — a human reads every
          message.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Welcome to Pintask',
  displayName: 'Welcome email',
  previewData: { name: 'Sam' },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
}
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: 'hsl(230, 25%, 12%)',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: 'hsl(220, 10%, 46%)',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const button = {
  backgroundColor: 'hsl(250, 65%, 55%)',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '12px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
