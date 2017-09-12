const http = require('http'),
      fs = require('fs'),
      hostname = '127.0.0.1',
      port = 3000,
      file = fs.readFileSync('./index.html'),
      server = http.createServer((req, res) => {
            if (req.url != '/favicon.ico') {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/html')
                res.end(file.toString())
                console.log(req.connection.remoteAddress)
                console.log(req.url)
            }
      });

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
});
