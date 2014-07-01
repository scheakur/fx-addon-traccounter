const request = require('sdk/request');
const { data } = require('sdk/self');
const timers = require('sdk/timers');
const { storage } = require('sdk/simple-storage');
const { uuid } = require('sdk/util/uuid');

function initOrRestoreData() {
  if (!storage.urls) {
    storage.urls = {};
    return;
  }

  Object.keys(storage.urls).forEach(function(id) {
    let info = storage.urls[id];
    let url = info.url;
    let title = info.title;
    panel.port.emit('add', id, url, title);
  });
}

const button = require('sdk/ui/button/toggle').ToggleButton({
  id: 'traccounter',
  label: 'Numbers',
  icon: {
    '16': './icon/traccounter-16.png',
    '32': './icon/traccounter-32.png',
    '64': './icon/traccounter-64.png',
  },
});

const panel = require('sdk/panel').Panel({
  contentURL: data.url('numbers.html'),
  contentScriptFile: [
    data.url('vue.min.js'),
    data.url('traccounter.js'),
  ]
});


let openPanelPreventer = null;

panel.on('hide', function(state) {
  preventOpenTemporary();
  buttonOff();
});

button.on('click', function(state) {
  if (openIsPrevented()) {
    breakPreventer();
    buttonOff();
    return;
  }
  if (state.checked) {
    openPanel();
  }
});

panel.port.on('hide', function() {
  panel.hide();
});

panel.port.on('save', function(url, title) {
  if (url !== '') {
    let id = uuid().number;
    storage.urls[id] = {
      url: url,
      title: title,
    };
    panel.port.emit('add', id, url, title);
  }
});

panel.port.on('remove', function(id) {
  if (id !== '') {
    delete storage.urls[id];
  }
});


function preventOpenTemporary() {
  if (openPanelPreventer !== null) {
    timers.clearTimeout(openPanelPreventer);
  }
  openPanelPreventer = timers.setTimeout(function() {
    openPanelPreventer = null;
  }, 300);
}


function openIsPrevented() {
  return openPanelPreventer !== null;
}


function breakPreventer() {
  timers.clearTimeout(openPanelPreventer);
  openPanelPreventer = null;
}


function openPanel() {
  panel.show({
    width: 600,
    height: 600,
    position: button,
  });
}


function buttonOff() {
  button.state('window', {
    checked: false
  });
}


const POLL_INTERVAL_MIN = 1000 * 60;  // 1 minute
const POLL_INTERVAL_MAX = 1000 * 60 * 5;  // 5 minutes


function delayStartPolling() {
  timers.setTimeout(function() {
    polling();
  }, 1000 * 3);
}


function update(id, res) {
  panel.port.emit('update', id, res);
}


function random(min, max) {
  return Math.random() * (max - min) + min;
}

function scheduleRequest() {
  let delay = random(POLL_INTERVAL_MIN, POLL_INTERVAL_MAX) | 0;
  timers.setTimeout(polling, delay);
}


function listIdAndUrls() {
  return Object.keys(storage.urls).map(function(id) {
    return [id, storage.urls[id].url];
  });
}


function polling() {
  let urls = listIdAndUrls();
  urls.forEach(function([id, url], i) {
    timers.setTimeout(function() {
      check(id, url);
    }, i * 1000 * 5);
  });
  scheduleRequest();
}


function check(id, url) {
  request.Request({
    url: url,
    onComplete: function(response) {
      update(id, response.text);
    }
  }).get();
}


initOrRestoreData();
delayStartPolling();
