const express = require('express')

const bypassToolsBypass = require('./bypasstools')
const bypassCityBypass = require('./bypasscity')
const alexscripterBypass = require('./alexscripter')

const app = express()

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || 'https://discord.com/api/webhooks/1465288234287370242/9aFrjD-Vdg0puRPhk0KJoF5F68Kic8ZPzsviDOmLWh-IrBdj6LzfqzNP_1at4kbmkc4k'

const LIMIT = {
  WINDOW: 60 * 1000,
  MAX: 1000
}

const ipStore = new Map()

function rateLimiter(req, res, next) {
  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    'unknown'

  const now = Date.now()
  const data = ipStore.get(ip) || { count: 0, start: now }

  if (now - data.start > LIMIT.WINDOW) {
    data.count = 0
    data.start = now
  }

  data.count++
  ipStore.set(ip, data)

  if (data.count > LIMIT.MAX) {
    return res.status(429).json({
      success: false,
      message: 'Too Many Requests'
    })
  }

  next()
}

function isValidHttpUrl(str) {
  try {
    const u = new URL(str)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function trim(text, max = 900) {
  if (!text) return '-'
  return text.length > max ? text.slice(0, max) + '…' : text
}

async function sendDiscordLog({
  service,
  ip,
  target,
  result,
  time_taken,
  success
}) {
  if (!DISCORD_WEBHOOK) return

  const embed = {
    title: 'BYPASS API LOG',
    color: success ? 0x57f287 : 0xed4245,
    fields: [
      { name: 'Service', value: service, inline: true },
      { name: 'Status', value: success ? 'SUCCESS' : 'FAILED', inline: true },
      { name: 'IP', value: ip, inline: false },
      { name: 'Target', value: trim(target), inline: false },
      { name: 'Result', value: trim(result), inline: false },
      { name: 'Time', value: `${time_taken}s`, inline: true }
    ],
    timestamp: new Date().toISOString()
  }

  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    })
  } catch {}
}

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API RUNNING' })
})

app.get('/api/bypass', rateLimiter, async (req, res) => {
  const { url } = req.query
  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress

  if (!url)
    return res.status(400).json({ success: false, message: 'Missing url' })

  if (!isValidHttpUrl(url))
    return res.status(400).json({ success: false, message: 'Invalid URL' })

  const host = new URL(url).hostname.toLowerCase()

  let result
  let usedService

  // 🔹 ALEX SCRIPTER
  if (host.includes('alexscripter')) {
    result = await alexscripterBypass(url)
    usedService = 'alexscripter'
  }

  // 🔹 LINKVERTISE (with fallback)
  else if (host.includes('linkvertise')) {
    result = await bypassToolsBypass(url)
    usedService = 'bypasstools'

    if (!result.success) {
      result = await bypassCityBypass(url)
      usedService = 'bypasscity'
    }
  }

  // 🔹 OTHER DOMAINS (no fallback)
  else {
    result = await bypassToolsBypass(url)
    usedService = 'bypasstools'
  }

  await sendDiscordLog({
    service: usedService,
    ip,
    target: url,
    result: result.success ? result.result : null,
    time_taken: result.time_taken,
    success: result.success
  })

  if (!result.success)
    return res.status(400).json(result)

  res.json({
    success: true,
    service: usedService,
    time_taken: result.time_taken,
    data: {
      success: true,
      result: result.result
    }
  })
})

module.exports = app
