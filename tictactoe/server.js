const http = require('http'),
      fs = require('fs'),
      querystring = require('querystring'),
      {parse} = require('url'),
      port = 2100,
      host = '0.0.0.0',
      html = fs.readFileSync('index.html'),
      offline = fs.readFileSync('offline.html'),
      online = fs.readFileSync('online.html'),
      logo = fs.readFileSync('assets/Tic_tac_toe.png'),
      patt = fs.readFileSync('assets/dot-paper.png'),
      css = fs.readFileSync('stylish.css'),
      log = fs.createWriteStream('connections.log', {flags: 'a'}),
      log2 = fs.createWriteStream('games.log', {flags: 'a'}),
      maxConnections = 30,
      maxLogSize = 1000000,
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
function getConnection(nickName) {
    let leng = connections.length
    if (leng == 0 || connections[leng-1][1] > 1) {
        connections.push([timeout, 0, yieldToken(tokenLeng), 'X', null,
                            nickName, null])
        leng = connections.length
        return ['X', connections[leng-1][2]]
    } else {
        connections[leng-1][1] = timeout
        connections[leng-1][6] = nickName
        return ['O', connections[leng-1][2], connections[leng-1][5]]
    }
}
function getIndex(token) {
    for (let i = 0; i < connections.length; i++) {
        if (token == connections[i][2])
            return i
    }
}
function getOnCount() {
    let count = 0
    for (let i = 0; i < connections.length; i++) {
        if (connections[i][0] > 0)
            count++
            if (connections[i][1] > 0)
                count++
    }
    return count
}
setInterval(() => {
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
    process.stdout.write(' '.repeat(10) + '\r')
    process.stdout.write('Online: ' + getOnCount() + '\r')
}, 1000)

http.createServer((req, res) => {
    let url = parse(req.url),
        path = url.pathname,
        query = url.query,
        info = querystring.parse(query)

    process.stdout.write(path)
    process.stdout.write('\n')
    if (path != '/on_count' && path != '/get_game' && path != '/get_turn')
        fs.stat('connections.log', (err, stat) => {
            if (stat.size <= maxLogSize || stat == undefined)
                log.write(`${path},${req.connection.remoteAddress},${Date()}\n`)
        })
    if (path == '/get_game') {
        let index = getIndex(info.token)
        if (index != undefined) {
            if (connections[index][1] > 0) {
                connections[index][0] = timeout + 1
                connections[index][1] = timeout
                res.end(connections[index][6])
            }
            else {
                connections[index][0] = 3
                res.end()
            }
        } else {
            res.end()
        }
    } else if (path == '/set_game') {
        req.on('data', (data) => {
            res.end(JSON.stringify(getConnection(data.toString())))
        })
    } else if (path == '/get_turn') {
        let index = getIndex(info.token)
        if (index != undefined && connections[index][3] == info.char) {
            if (info.char == 'X')
                connections[index][0] = timeout + 1
            else
                connections[index][1] = timeout + 1
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
                connections[index][3] = 'O'
            } else {
                connections[index][1] = timeout
                connections[index][3] = 'X'
            }
        }
        res.end()
    } else if (path == '/result_log') {
        req.on('data', (data) => {
            fs.stat('games.log', (err, stat) => {
                if (stat.size <= maxLogSize || stat == undefined)
                    if (Buffer.byteLength(data.toString()) + stat.size <=
                        maxLogSize)
                        log2.write(`${data.toString()},${Date()}\n`)
            })
        })
    } else if (path == '/timeout') {
        res.end(`${timeout}`)
    } else if (path == '/on_count') {
        res.end(`${getOnCount()}`)
    } else if (path == '/assets/Tic_tac_toe.png') {
        res.end(logo)
    } else if (path == '/assets/dot-paper.png') {
        res.end(patt)
    } else if (path == '/stylish.css') {
        res.setHeader('Content-Type', 'text/css')
        res.end(css)
    } else if (path == '/offline') {
        res.end(offline)
    } else if (path == '/online') {
        res.end(online)
    } else {
        res.end(html)
    }
}).listen(port, host, () => console.log('running at http://localhost:2100'))
