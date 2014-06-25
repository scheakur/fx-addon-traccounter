const container = new Vue({
  el: document.querySelector('.traccounter'),
  data: {
    numbers: {},
    newUrl: '',
    newTitle: ''
  },
  methods: {
    hide: hide,
    save: save,
    remove: remove,
  },
});


self.port.on('update', function(url, res) {
  var num = extractNumber(res);
  container.$data.numbers[url].num = num;
});


function hide() {
  self.port.emit('hide');
}


function remove(data) {
  var url = data.$key;
  container.numbers.$delete(url);
  self.port.emit('remove', url);
}


function save() {
  var url = container.$data.newUrl;
  if (url === '') {
    return;
  }
  var title = container.$data.newTitle;
  if (title === '') {
    title = url;
  }
  container.$data.numbers.$add(url, {
    title: title,
    num: '?'
  });
  self.port.emit('save', url, title);
  container.$data.newUrl = '';
  container.$data.newTitle = '';
}


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
