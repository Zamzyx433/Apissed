const axios = require('axios')

async function followRedirect(url) {
  const res = await axios.get(url, {
    maxRedirects: 10,
    validateStatus: s => s >= 200 && s < 400,
    headers: {
      'user-agent':
        'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/127.0.0.0 Mobile Safari/537.36'
    }
  })

  return res.request.res.responseUrl
}

function parseDonotlink(url) {
  if (!url.includes('donotlink.me/')) return url

  const raw = url.split('donotlink.me/')[1]
  if (!raw) return url

  return decodeURIComponent(raw)
}

async function bypassYtsubme(url) {
  let finalUrl = url

  const m = finalUrl.match(/\/s2u\/([a-zA-Z0-9]+)/)
  if (m) {
    finalUrl = `https://www.ytsubme.com/s2u/?urlid=${m[1]}`
  }

  const urlObj = new URL(finalUrl)
  const urlid = urlObj.searchParams.get('urlid')
  if (!urlid) throw new Error('urlid not found')

  const api =
    `https://www.ytsubme.com/dashboard/api/s2u_links.php` +
    `?mode=s2uGetLink&code=${urlid}`

  const { data } = await axios.get(api, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
    }
  })

  if (!data?.return_url) {
    throw new Error('return_url not found')
  }

  return data.return_url
}

module.exports = async function ytsubmeBypass(url) {
  const start = Date.now()

  try {
    if (!url) throw new Error('URL required')

    let redirected = await followRedirect(url)
    redirected = parseDonotlink(redirected)

    let final

    if (redirected.includes('ytsubme.com/s2u')) {
      final = await bypassYtsubme(redirected)
    } else {
      final = redirected
    }

    return {
      success: true,
      time_taken: ((Date.now() - start) / 1000).toFixed(2),
      result: final
    }

  } catch (err) {
    return {
      success: false,
      time_taken: ((Date.now() - start) / 1000).toFixed(2),
      message: err.message
    }
  }
}
