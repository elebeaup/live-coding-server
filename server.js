const express = require('express');
const urlExists = require('url-exists');
const proxy = require('http-proxy-middleware');
const cors = require('cors');

const port = process.env.PORT || 3000;
const app = express();

const ttyProxy = proxy(['/terminal/**', '/*.js'], {
  target: 'http://localhost:7681',
  ws: true,
  pathRewrite: {
    '^/terminal': '/'
  }
});

app.use(ttyProxy);
app.use(cors());

app.head('/api/ping', function (req, res) {
  const url = req.query.url;
  console.log(`Pinging ${url}`);

  urlExists(url, (err, exists) => {
    if (!exists) {
      res.status(404);
    }
    else {
      res.status(200);
    }

    res.end();
  });
});

app.listen(port);
