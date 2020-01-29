var express = require('express');
var app = express();
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static(__dirname));
app.get('/index.html', function (req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})

app.post('/get-whois', function (req, res) {
    // Prepare output in JSON format
    console.log(req.body);
    console.log(req.query);
    var domain = req.body.domain;
    var whois = "";
    // check if the domain is valid
    if (typeof domain !== 'undefined' && domain.trim() === '') {
        res.end(JSON.stringify(response));
    } else {
        const sqlite3 = require('sqlite3').verbose();

        // access and open the database
        let db = new sqlite3.Database('./db/log.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the log database.');
        });

        // insert one row into the langs table
        db.run(`INSERT INTO log(query) VALUES(?)`, [domain], function (err) {
            if (err) {
                return console.log(err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted with row id: ${this.lastID}`);
        });

        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });


        // Include Nodejs' net module.
        const Net = require('net');
        // The port number and hostname of the server.
        const port = 43;
        const host = 'whois.verisign-grs.com';

        // Create a new TCP client.
        const client = new Net.Socket();
        // Send a connection request to the server.
        client.connect({ port: port, host: host }, function () {
            // If there is no error, the server has accepted the request and created a new
            // socket dedicated to us.
            console.log('TCP connection established with the server.');

            // The client can now send data to the server by writing to its socket.
            client.write(domain + "\r\n");
        });

        // The client can also receive data from the server by reading from its socket.
        client.on('data', function (chunk) {
            whois += `${chunk.toString()}`;
            //console.log(`Data received from the server: ${chunk.toString()}.`);
            console.log(whois);
            // Request an end to the connection after the data has been received.
            client.end();
        });

        client.on('end', function () {
            console.log('Requested an end to the TCP connection');
            res.end(encodeURI(whois));
        });
    }
})

var server = app.listen(8000, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://", host, port)
})