const http = require('http'),
      fs = require('fs'),
      port = 2555,
      host = '0.0.0.0',
      html = fs.readFileSync('./tictactoe.html'),
      logo = fs.readFileSync('assets/Tic_tac_toe.png'),
      patt = fs.readFileSync('./assets/dot-paper.png'),
      maxConnections = 20,
      tokenLeng = 10,
      timeout = 10

let connections = [],
    allChars = '',
    ranges = [[48, 58], [65, 91], [97, 123]]
for (let i = 0; i < 3; i++) {
    for (let j = ranges[i][0]; j < ranges[i][1]; j++) {
        allChars += String.fromCharCode(j)
    }
}
function yieldToken(length) {
    let token = ''
    for (let i = 0; i < length; i++) {
        token += allChars[Math.floor(Math.random()*allChars.length)]
    }
    return token
}
function getConnection() {
    let leng = connections.length
    if (leng == 0 || connections[leng-1][1] > 1) {
        connections.push([timeout, 0, yieldToken(tokenLeng)])
        leng = connections.length
        return ['X', connections[leng-1][2]]
    } else {
        connections[leng-1][1] = timeout
        return ['Y', connections[leng-1][2]]
    }
}
setInterval(() => {
    if (connections.length > maxConnections/2)
        process.exit(15)
    for (let i = 0; i < connections.length; i++) {
        connections[i][0]--
        connections[i][1]--
        if (connections[i][0] < 1)
            connections.splice(i, 1)
    }
}, 1000)

http.createServer((req, res) => {
    if (req.method == 'POST') {
        req.on('data', (data) => {
            console.log(JSON.parse(data.toString()))
        })
    } else if (req.url == '/connect') {
        res.end(JSON.stringify(getConnection()))
    }
    else if (req.url == '/assets/Tic_tac_toe.png')
        res.end(logo)
    else if (req.url == '/assets/dot-paper.png')
        res.end(patt)
    else
        res.end(html)
}).listen(port, host)
