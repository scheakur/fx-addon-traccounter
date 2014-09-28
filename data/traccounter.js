const container = new Vue({
  el: document.querySelector('.traccounter'),
  data: {
    urls: [],
    newUrl: '',
    newTitle: '',
    jsonData: '',
  },
  methods: {
    hide: hide,
    save: save,
    remove: remove,
    importData: importData,
    exportData: exportData,
    showController: showController,
    hideController: hideController,
  },
});


self.port.on('add', function(id, url, title) {
  console.log(id, url, title);
  container.urls.push({
    id: id,
    url: url,
    title: title,
    num: '?',
  });
});

self.port.on('update', function(id, res) {
  var index = container.urls.map(function(info) {
    return info.id;
  }).indexOf(id);

  if (index > -1) {
    var num = extractNumber(res);
    container.urls[index].num = num;
  }
});


function hide() {
  self.port.emit('hide');
}


function remove(data) {
  var id = data.id;
  var index = container.urls.map(function(info) {
    return info.id;
  }).indexOf(id);

  if (index > -1) {
    container.urls.splice(index, 1);
    self.port.emit('remove', id);
  }
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
  var data = JSON.parse(container.jsonData);
  data.forEach(function(d) {
    self.port.emit('save', d.url, d.title);
  });
  container.jsonData = '';
}


function exportData() {
  container.jsonData = JSON.stringify(container.urls, null, '  ');
}


function showController() {
  container.$el.querySelector('.tracs').classList.add('blur');
  container.$el.querySelector('.screen').style.display = 'block';
}


function hideController() {
  container.$el.querySelector('.screen').style.display = 'none';
  container.$el.querySelector('.tracs').classList.remove('blur');
}


function makeDraggable() {
  var dragging;

  document.addEventListener('dragstart', function(event) {
    var draggable = getDraggable(event.target);
    if (draggable) {
      dragging = draggable;
      event.dataTransfer.setData('text/plain', draggable.getAttribute('data-url'));
      draggable.classList.add('dragging');
    }
  }, false);

  document.addEventListener('dragend', function(event) {
    var draggable = getDraggable(event.target);
    if (draggable) {
      draggable.classList.remove('dragging');
    }
  }, false);

  document.addEventListener('dragover', function(event) {
    event.preventDefault();
    var draggable = getDraggable(event.target);
    if (draggable && draggable !== dragging && !draggable.classList.contains('shadow')) {
      draggable.classList.add('shadow');
    }
  }, false);

  document.addEventListener('dragenter', function(event) {
    var draggable = getDraggable(event.target);
    var from = getDraggable(event.relatedTarget);
    if (draggable && !from && draggable !== dragging) {
      draggable.classList.add('shadow');
    }
  }, false);

  document.addEventListener('dragleave', function(event) {
    var draggable = getDraggable(event.target);
    var to = getDraggable(event.relatedTarget);
    if (draggable && draggable !== to) {
      draggable.classList.remove('shadow');
    }
  }, false);

  document.addEventListener('drop', function(event) {
    event.preventDefault();
    var draggable = getDraggable(event.target);
    if (draggable && draggable !== dragging) {
      draggable.classList.remove('shadow');
      var ids = container.urls.map(function(info) {
        return info.id;
      });
      var from = ids.indexOf(dragging.getAttribute('data-id'));
      var to = ids.indexOf(draggable.getAttribute('data-id'));
      var target = container.urls.splice(from, 1)[0];
      container.urls.splice(to, 0, target);
    }
  }, false);

  function getDraggable(el) {
    return getParent(el, 'draggable', 'tracs');
  }

  function isDraggable(el) {
    return el.classList && el.classList.contains('draggable');
  }

  function getParent(el, clazz, stopper) {
    while (el) {
      if (el.classList && el.classList.contains(stopper)) {
        return null;
      }
      if (el.classList && el.classList.contains(clazz)) {
        return el;
      }
      el = el.parentNode;
    }
    return null;
  }

}

makeDraggable();
