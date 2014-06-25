const request = require('sdk/request');
const data = require('sdk/self').data;
const timers = require('sdk/timers');
const ss = require('sdk/simple-storage');
const { uuid } = require('sdk/util/uuid');

if (!ss.storage.urls) {
  ss.storage.urls = {};
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
    ss.storage.urls[id] = {
      url: url,
      title: title,
    };
    panel.port.emit('add', id, url, title);
  }
  console.log(ss.storage.urls);
});

panel.port.on('remove', function(url, title) {
  if (url !== '') {
    delete ss.storage.urls[url];
  }
  console.log(ss.storage.urls);
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


function delayInit() {
  timers.setTimeout(function() {
    polling();
  }, 1000 * 3);
}


function update(url, res) {
  panel.port.emit('update', url, res);
}


function random(min, max) {
  return Math.random() * (max - min) + min;
}

function scheduleRequest() {
  let delay = random(POLL_INTERVAL_MIN, POLL_INTERVAL_MAX) | 0;
  timers.setTimeout(polling, delay);
}


function listUrls() {
  return Object.keys(ss.storage.urls).map(function(id) {
    return ss.storage.urls[id].url;
  });
}


function polling() {
  let urls = listUrls();
  console.log('polling', urls);
  urls.forEach(function(url, i) {
    timers.setTimeout(function() {
      check(url);
    }, i * 1000 * 5);
  });
  scheduleRequest();
}


function check(url) {
  console.log('req', url);
  request.Request({
    url: url,
    onComplete: function(response) {
      console.log('status', response.status);
      update(url, response.text);
    }
  }).get();
}


delayInit();
