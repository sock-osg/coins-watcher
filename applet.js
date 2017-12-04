const Applet = imports.ui.applet;
const Util = imports.misc.util;
const Settings = imports.ui.settings;
const Soup = imports.gi.Soup;
const _httpSession = new Soup.SessionAsync();

Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

Debugger = {
  logLevel: 0,
  setLogLevel: function(level) {
    this.log("Setting new log level: "+level, 1);
    this.logLevel = level;
  },

	log: function(message, level) {
    //if (!level) {
      //level = 1;
    //}
    //if (level <= this.logLevel) {
      global.log(message);
    //}
	}
}

BitsoGateway = {
  init: function() {
    this._services = {
      BTC: {
        url: 'https://api.bitso.com/v3/ticker?book=btc_mxn'
      },
      ETH: {
        url: 'https://api.bitso.com/v3/ticker?book=eth_mxn'
      },
      XRP: {
        url: 'https://api.bitso.com/v3/ticker?book=xrp_mxn'
      }
    };
  },

  get: function(currency, callback) {
    Debugger.log("Calling url: " + this._services[currency].url, 2);
    var request = new Soup.Message({
			method: 'GET',
			uri: new Soup.URI(this._services[currency].url)
		});
    _httpSession.queue_message(request, function(_httpSession, message) {
      Debugger.log("Status code: " + message.status_code, 2);
			if (message.status_code !== 200) {
				return;
			}
			let data = request.response_body.data;
			callback(data);
		});
  }
}

function MyApplet(metadata, orientation, panel_height, instance_id) {
  this._init(metadata, orientation, panel_height, instance_id);
}

MyApplet.prototype = {
  __proto__: Applet.TextIconApplet.prototype,

  _init: function(metadata, orientation, panelHeight, instanceId) {
    Applet.TextIconApplet.prototype._init.call(this, orientation, panelHeight, instanceId);

    this._metadata = metadata;

    BitsoGateway.init();

    //this._numPomodoroSetFinished = 0;
    BitsoGateway.get('XRP', function(data) {
      Debugger.log("Response: ", 2);
      Debugger.log(data, 2);
      this.set_applet_label(data.payload.last);
    });
  },

  on_applet_clicked: function() {
    //Util.spawn('xkill');
  },

  _setTimerLabel: function(ticks) {
    ticks = ticks || 0;

    let minutes, seconds;
    minutes = seconds = 0;

    if (ticks > 0) {
      minutes = parseInt(ticks / 60);
      seconds = parseInt(ticks % 60);
    }

    let timerText = "%d".format(this._numPomodoroSetFinished);

    this.set_applet_label(timerText);
  },
};

function main(metadata, orientation, panelHeight, instanceId) {
  let myModule = imports.ui.appletManager.applets[metadata.uuid];
  let myApplet = new MyApplet(metadata, orientation, panelHeight, instanceId);
  return myApplet;
}
