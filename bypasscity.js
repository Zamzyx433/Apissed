const APIKEY =
  process.env.BYPASSCITY_KEY || 'freeApikey'

module.exports = async function bypassCity(url) {
  const start = Date.now()

  try {
    const res = await fetch(
      `https://anabot.my.id/api/tools/bypassCity?url=${encodeURIComponent(
        url
      )}&apikey=${APIKEY}`
    )

    const json = await res.json()
    const end = Date.now()

    if (!json?.success || !json?.data?.result) {
      return {
        success: false,
        time_taken: ((end - start) / 1000).toFixed(2),
        message: 'BypassCity failed'
      }
    }

    return {
      success: true,
      time_taken: ((end - start) / 1000).toFixed(2),
      result: json.data.result
    }
  } catch (err) {
    const end = Date.now()
    return {
      success: false,
      time_taken: ((end - start) / 1000).toFixed(2),
      message: err.message
    }
  }
}
