const axios = require('axios')
const cheerio = require('cheerio')

module.exports = async function alexscripter(url) {
  const start = Date.now()

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
      },
      timeout: 30000
    })

    const $ = cheerio.load(data)
    const finalUrl = $('a.custom-button').attr('href')

    if (!finalUrl)
      throw new Error('Final button URL not found')

    return {
      success: true,
      time_taken: ((Date.now() - start) / 1000).toFixed(2),
      result: finalUrl
    }
  } catch (err) {
    return {
      success: false,
      time_taken: ((Date.now() - start) / 1000).toFixed(2),
      message: err.message
    }
  }
}
