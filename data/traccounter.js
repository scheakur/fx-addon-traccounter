const container = new Vue({
  el: document.querySelector('.traccounter'),
  data: {
    numbers: {},
    newUrl: '',
    newTitle: '',
    importJson: '',
  },
  methods: {
    hide: hide,
    save: save,
    remove: remove,
    importData: importData,
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

self.port.on('update', function(id, res) {
  if (container.numbers[id]) {
    var num = extractNumber(res);
    container.numbers[id].num = num;
  }
});


function hide() {
  self.port.emit('hide');
}


function remove(data) {
  var id = data.$key;
  container.numbers.$delete(id);
  self.port.emit('remove', id);
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


function importData() {
  var data = JSON.parse(container.importJson);
  data.forEach(function(d) {
    self.port.emit('save', d.url, d.title);
  });
  container.importJson = '';
}
