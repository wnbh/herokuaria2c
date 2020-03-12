const http = require('http')
const httpProxy = require('http-proxy')
const express = require('express')
const request = require('request')
const httpsrv = require('httpsrv')
const fs = require('fs')
const SECRET = /rpc-secret=(.*)/.exec(
	fs.readFileSync('aria2c.conf', 'utf-8')
)[1]
const ENCODED_SECRET = Buffer.from(SECRET).toString('base64')

const PORT = process.env.PORT || 1234
const app = express()
const proxy = httpProxy.createProxyServer({
	target: 'ws://localhost:6800',
	ws: true
})
const server = http.createServer(app)

// Proxy websocket
server.on('upgrade', (req, socket, head) => {
	proxy.ws(req, socket, head)
})

//Import Bootstrap CSS
app.use(express.static(__dirname + '/bootstrap'));

// Handle normal http traffic
app.use('/jsonrpc', (req, res) => {
	req.pipe(request('http://localhost:6800/jsonrpc')).pipe(res)
})
app.use(
	'/downloads/' + ENCODED_SECRET,
	httpsrv({
		basedir: __dirname + '/downloads'
	})
)
app.use('/ariang', express.static(__dirname + '/ariang'))
app.get('/', (req, res) => {
	res.send(`
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" type="text/css" href="../bootstrap.min.css" />
<link rel="stylesheet" type="text/css" href="../bootstrap.css" />
<link rel="stylesheet" type="text/css" href="../signin.css" />
</head>
<body class="text-center">
<form class="form-signin">
<img class="mb-4" src="../cloud-download-alt-solid.svg" alt="logo" width="72" height="72">
<h1 class="h3 mb-3 font-weight-normal">Aria2C Menu</h1>
<label for="secret" class="sr-only">aria2c Password</label>
<input type="password" id="secret" class="form-control">
<hr style="border: none">
<button id="panel" class="btn btn-lg btn-primary btn-block">Sign in</button>
<button id="downloads" class="btn btn-lg btn-primary btn-block">Files</button>
<p class="mt-5 mb-3 text-muted">&copy; maple3142 &amp; bluedogerino 2020</p>
</form>
<script>
panel.onclick=function(){
	open('/ariang/#!/settings/rpc/set/wss/'+location.hostname+'/443/jsonrpc/'+btoa(secret.value),'_blank')
}
downloads.onclick=function(){
	open('/downloads/'+btoa(secret.value)+'/')
}
</script>
</body>
</html>
`)
})
server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))

if (process.env.HEROKU_APP_NAME) {
	const readNumUpload = () =>
		new Promise((res, rej) =>
			fs.readFile('numUpload', 'utf-8', (err, text) =>
				err ? rej(err) : res(text)
			)
		)
	const APP_URL = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`
	const preventIdling = () => {
		request.post(
			'http://localhost:6800/jsonrpc',
			{
				json: {
					jsonrpc: '2.0',
					method: 'aria2.getGlobalStat',
					id: 'preventIdling',
					params: [`token:${SECRET}`]
				}
			},
			async (err, resp, body) => {
				console.log('preventIdling: getGlobalStat response', body)
				const { numActive, numWaiting } = body.result
				const numUpload = await readNumUpload()
				console.log(
					'preventIdling: numbers',
					numActive,
					numWaiting,
					numUpload
				)
				if (
					parseInt(numActive) +
						parseInt(numWaiting) +
						parseInt(numUpload) >
					0
				) {
					console.log('preventIdling: make request to prevent idling')
					request(APP_URL)
				}
			}
		)
		setTimeout(preventIdling, 15 * 60 * 1000) // 15 min
	}
	preventIdling()
}
