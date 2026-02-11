const chromium = require('@sparticuz/chromium')
const puppeteer = require('puppeteer-core')
const { performance } = require('perf_hooks')

module.exports = async function link4sub(url) {
  const start = performance.now()
  let browser

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
      defaultViewport: chromium.defaultViewport
    })

    const page = await browser.newPage()

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    })

    await page.waitForFunction(() => {
      try {
        const v = localStorage.getItem('_STU')
        return v && JSON.parse(v)?.data?.lnk
      } catch {
        return false
      }
    }, { timeout: 30000 })

    const stuJson = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('_STU'))
    )

    const links = Object.values(stuJson.data.lnk).map(v => v.url)

    return {
      success: true,
      time_taken: ((performance.now() - start) / 1000).toFixed(2),
      result: links[0]
    }
  } catch (err) {
    return {
      success: false,
      time_taken: ((performance.now() - start) / 1000).toFixed(2),
      message: err.message
    }
  } finally {
    if (browser) await browser.close()
  }
}
