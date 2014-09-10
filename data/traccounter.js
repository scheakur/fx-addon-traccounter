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
    showController: showController,
    hideController: hideController,
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
    if (draggable && !to) {
      draggable.classList.remove('shadow');
    }
  }, false);

  document.addEventListener('drop', function(event) {
    event.preventDefault();
    var draggable = getDraggable(event.target);
    if (draggable && draggable !== dragging) {
      var container = dragging.parentNode;
      var fromUpper = dragging.offsetTop - draggable.offsetTop < 0;
      var fromLeft = dragging.offsetLeft - draggable.offsetLeft < 0;
      draggable.classList.remove('shadow');
      container.removeChild(dragging);
      if (fromUpper || fromLeft) {
        container.insertBefore(dragging, draggable.nextElementSibling);
      } else {
        container.insertBefore(dragging, draggable);
      }
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
