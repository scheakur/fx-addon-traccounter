const container = new Vue({
  el: document.querySelector('.traccounter'),
  data: {
    numbers: {
      'http://trac.edgewall.org/report/1': '?'
    },
  },
  methods: {
    hide: hide
  },
});


function hide() {
  self.port.emit('hide');
}

self.port.on('update', function(url, res) {
  var num = extractNumber(res);
  container.$data.numbers[url] = num;
});

function extractNumber(res) {
  var matched = res.match(/<h1>([\n\r]|.)*?<\/h1>/m);
  if (matched) {
    var dom = document.createElement('div');
    dom.innerHTML = matched[0];
    var numDom = dom.querySelector('.numrows');
    if (numDom) {
      return numDom.textContent.match(/\d+/)[0];
    }
  }
  return '?';
}

