if(process.env.NODE_ENV !== 'PRODUCTION') {
  require('dotenv').load();
}

const APIAI_TOKEN = process.env.APIAI_TOKEN;
const APIAI_SESSION_ID = process.env.APIAI_SESSION_ID;

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'hbs');

const server = app.listen(process.env.PORT || 3000, () => {
  console.log('server listening on port %d', server.address().port);
});

const apiai= require('apiai')(APIAI_TOKEN);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.render('home');
});

io.on('connection', function(socket) {
  socket.on('chat message', (text) => {
    let apiaiReq = apiai.textRequest(text, {
      sessionId: APIAI_SESSION_ID
    });

    apiaiReq.on('response', (res) => {
      let aiText = res.result.fulfillment.speech;
      socket.emit('bot reply', aiText);
    });

    apiaiReq.on('error', (error) => {
      console.log(error);
    });

    apiaiReq.end();
  });
});
