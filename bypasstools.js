const axios = require('axios')

const SOLVER_API_BASE =
  'https://fathurweb.qzz.io/api/solver/turnstile-min'

const BYPASS_API = 'https://bypass.tools/api/bypass'
const ORIGIN_SITE = 'https://bypass.tools/'
const SITE_KEY = '0x4AAAAAACXArKb_xnkUnwy8'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/127.0.0.0 Mobile Safari/537.36'

async function solveTurnstile(url, siteKey) {
  const { data } = await axios.get(SOLVER_API_BASE, {
    params: { url, siteKey },
    timeout: 45000
  })

  if (!data || !data.status)
    throw new Error(data?.message || 'Solver failed')

  const token =
    data.result || data.token || data?.data?.token

  if (!token) throw new Error('Token not found')

  return token
}

module.exports = async function bypassTools(targetUrl) {
  const start = Date.now()

  try {
    if (!targetUrl) throw new Error('URL required')

    const cfToken = await solveTurnstile(
      ORIGIN_SITE,
      SITE_KEY
    )

    const { data } = await axios.post(
      BYPASS_API,
      {
        url: targetUrl,
        captchaToken: cfToken,
        forceRefresh: false,
        isPremium: false,
        key: null
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
          Origin: ORIGIN_SITE,
          Referer: ORIGIN_SITE,
          'User-Agent': USER_AGENT
        },
        timeout: 30000
      }
    )

    const time_taken = (
      (Date.now() - start) /
      1000
    ).toFixed(2)

    if (!data?.status || !data?.result) {
      return {
        success: false,
        time_taken,
        message: 'BypassTools failed'
      }
    }

    return {
      success: true,
      time_taken,
      result: data.result
    }
  } catch (err) {
    return {
      success: false,
      time_taken: (
        (Date.now() - start) /
        1000
      ).toFixed(2),
      message: err.message
    }
  }
}
