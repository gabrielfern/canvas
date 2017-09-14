const http = require('http'),
      fs = require('fs'),
      hostname = '0.0.0.0',
      port = 3000,
      html = fs.readFileSync('./index.html'),
      logo = fs.readFileSync('./assets/Canva_Logo.png'),
      server = http.createServer((req, res) => {
            if (req.url == '/favicon.ico') {
                res.setHeader('Content-Type', 'image/png')
                //fs.createReadStream('./assets/Canva_Logo.png').pipe(res)
                res.end(logo)
            } else {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/html')
                res.end(html)
                console.log(Date() +
                            `\n${req.connection.remoteAddress}` +
                            `\n${req.url}\n`
                )
            }
      })

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})
