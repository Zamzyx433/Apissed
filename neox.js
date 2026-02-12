const axios = require('axios')

module.exports = async function neoxBypass() {
  const start = Date.now()
  const target = 'https://neoxsoftworks.eu/api/save-key'

  try {
    const response = await axios.post(
      target,
      {},
      {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          Referer: 'https://neoxsoftworks.eu/key.html',
          Origin: 'https://neoxsoftworks.eu',
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/127.0.0.0 Mobile Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 10000
      }
    )

    if (!response.data?.key)
      throw new Error('Backend protected')

    return {
      success: true,
      time_taken: ((Date.now() - start) / 1000).toFixed(2),
      result: response.data.key
    }
  } catch (err) {
    return {
      success: false,
      time_taken: ((Date.now() - start) / 1000).toFixed(2),
      message: err.message
    }
  }
}
