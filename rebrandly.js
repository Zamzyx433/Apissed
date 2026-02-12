module.exports = async function bypassRebrandly(shortUrl) {
  const start = Date.now()

  try {
    if (!shortUrl) throw new Error('URL required')

    const response = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    })

    const destination = response.headers.get('location')

    if (!destination)
      throw new Error('Redirect location not found')

    return {
      success: true,
      time_taken: ((Date.now() - start) / 1000).toFixed(2),
      result: destination
    }
  } catch (err) {
    return {
      success: false,
      time_taken: ((Date.now() - start) / 1000).toFixed(2),
      message: err.message
    }
  }
}
