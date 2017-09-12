const http = require('http'),
        fs = require('fs')

file = fs.readFileSync('./index.html')
const hostname = '192.168.25.4'
const port = 3000

const server = http.createServer((req, res) => {
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
