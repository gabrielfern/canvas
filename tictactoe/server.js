const http = require('http'),
      fs = require('fs'),
      querystring = require('querystring'),
      {parse} = require('url'),
      port = 2100,
      host = '0.0.0.0',
      html = fs.readFileSync('tictactoe.html'),
      logo = fs.readFileSync('assets/Tic_tac_toe.png'),
      patt = fs.readFileSync('assets/dot-paper.png'),
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
        connections.push([timeout, 0, yieldToken(tokenLeng), 'X', null])
        leng = connections.length
        return ['X', connections[leng-1][2]]
    } else {
        connections[leng-1][1] = timeout
        return ['Y', connections[leng-1][2]]
    }
}
function getIndex(token) {
    for (let i = 0; i < connections.length; i++) {
        if (token == connections[i][2])
            return i
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
    let url = parse(req.url),
        path = url.pathname,
        query = url.query
    if (path == '/connect') {
        res.end(JSON.stringify(getConnection()))
    } else if (path == '/turn') {
        let info = querystring.parse(query),
            index = getIndex(info.token)
        req.on('data', (data) => {
            //console.log(JSON.parse(data.toString()))
            res.end(JSON.stringify(getConnection()))
        })
    } else if (path == '/assets/Tic_tac_toe.png') {
        res.end(logo)
    } else if (path == '/assets/dot-paper.png') {
        res.end(patt)
    } else {
        res.end(html)
    }
}).listen(port, host)
