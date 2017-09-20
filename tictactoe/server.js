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
    console.log(connections)
    if (connections.length > maxConnections/2)
        process.exit(15)
    for (let i = 0; i < connections.length; i++) {
        if (connections[i][3] == 'X') {
            connections[i][0]--
            if (connections[i][0] < 1)
                connections.splice(i, 1)
        } else {
            connections[i][1]--
            if (connections[i][1] < 1)
                connections.splice(i, 1)
        }
    }
}, 1000)

http.createServer((req, res) => {
    let url = parse(req.url),
        path = url.pathname,
        query = url.query,
        info = querystring.parse(query)

    if (path == '/connect') {
        res.end(JSON.stringify(getConnection()))
    } else if (path == '/get_turn') {
        let index = getIndex(info.token)
        if (index != undefined && connections[index][3] == info.char) {
            if (info.char == 'X')
                connections[index][0] = timeout
            else
                connections[index][1] = timeout
            res.end(JSON.stringify(connections[index][4]))
        } else {
            res.end()
        }
    } else if (path == '/set_turn') {
        let index = getIndex(info.token)
        if (index != undefined && connections[index][3] == info.char) {
            req.on('data', (data) => {
                connections[index][4] = JSON.parse(data.toString())
            })
            if (info.char == 'X') {
                connections[index][0] = timeout
                connections[index][3] = 'Y'
            } else {
                connections[index][1] = timeout
                connections[index][3] = 'X'
            }
        }
        res.end()
    } else if (path == '/timeout') {
        res.end(`${timeout}`)
    } else if (path == '/assets/Tic_tac_toe.png') {
        res.end(logo)
    } else if (path == '/assets/dot-paper.png') {
        res.end(patt)
    } else {
        res.end(html)
    }
}).listen(port, host)
