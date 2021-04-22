const https = require('https')
const puppeteer = require('puppeteer')

const clientId = ''
const companyId = ''
const pleoUserEmail = ''
const pleoUserPassword = ''

authenticate(pleoUserEmail, pleoUserPassword, token => {
    console.log(token)
})

/**
 * Authenticate with Pleo
 * @param {String} username
 * @param {String} password
 * @param {Function} callback
 * @return {String} OAuth access token
 */
async function authenticate(username, password, callback) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto('https://app.pleo.io/login')

    // Get OAuth ID from session storage
    const sessionId = await page.evaluate(() => sessionStorage.getItem('oauthId'))

    let request = https.request({
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        hostname: 'auth.pleo.io',
        path: `/oauth/login?client_id=${clientId}&redirect_uri=https://app.pleo.io/login&response_type=token&scope=resource:basic&state={"id":"${sessionId}"}`,
        method: 'POST'
    }, response => {
        let body = ''

        response.on('data', data => {
            body += data
        })

        response.on('end', () => {
            browser.close()

            // Extract OAuth access token from response
            callback(/#access_token=([a-z0-9]+)&/.exec(body)[1])
        })
    })

    request.end(`email=${username}&password=${password}`)
}
