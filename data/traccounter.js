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


self.port.on('add', function(id, url, title) {
  console.log(id, url, title);
  container.numbers.$add(id, {
    url: url,
    title: title,
    num: '?',
  });
});

self.port.on('update', function(url, res) {
  var num = extractNumber(res);
  url = normalizeUrl(url);
  container.numbers[url].num = num;
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
  var url = container.newUrl;
  if (url === '') {
    return;
  }
  var title = container.newTitle;
  if (title === '') {
    title = url;
  }
  container.newUrl = '';
  container.newTitle = '';
  self.port.emit('save', url, title);
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
