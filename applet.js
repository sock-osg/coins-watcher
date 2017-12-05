const Lang = imports.lang

const Applet = imports.ui.applet;
const Util = imports.misc.util;
const Settings = imports.ui.settings;
const Mainloop = imports.mainloop;
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

function MyApplet(metadata, orientation, panel_height, instance_id) {
  this._init(metadata, orientation, panel_height, instance_id);
}

MyApplet.prototype = {
  __proto__: Applet.TextIconApplet.prototype,

  _init: function(metadata, orientation, panelHeight, instanceId) {
    Applet.TextIconApplet.prototype._init.call(this, orientation, panelHeight, instanceId);

    this._metadata = metadata;

    this._runWatcher();
  },

  _runWatcher: function() {
    this.refreshPrices();
    Mainloop.timeout_add_seconds(10, Lang.bind(this, this._runWatcher));
  },

  _services: {
    BTC: {
      url: 'https://api.bitso.com/v3/ticker?book=btc_mxn'
    },
    ETH: {
      url: 'https://api.bitso.com/v3/ticker?book=eth_mxn'
    },
    XRP: {
      url: 'https://api.bitso.com/v3/ticker?book=xrp_mxn'
    }
  },

  loadJsonAsync: function loadJsonAsync(url, callback) {
    let context = this;
    let message = Soup.Message.new('GET', url);
    _httpSession.queue_message(message, function soupQueue(session, response) {
      callback.call(context, JSON.parse(response.response_body.data));
    })
  },

  refreshPrices: function refreshPrices(recurse) {
    this.loadJsonAsync(this._services.BTC.url, function(dataBtc) {
      let btc = 'BTC:' + dataBtc.payload.last;

      this.loadJsonAsync(this._services.XRP.url, function(dataXrp) {
        let btcXrp = btc + ', XRP:' + dataXrp.payload.last;

        this.loadJsonAsync(this._services.ETH.url, function(dataEth) {
          let btcXrpEth = btcXrp + ', ETH:' + dataEth.payload.last;

          this.set_applet_label(_(btcXrpEth));
        });
      });
    });
  }
};

function main(metadata, orientation, panelHeight, instanceId) {
  let myModule = imports.ui.appletManager.applets[metadata.uuid];
  let myApplet = new MyApplet(metadata, orientation, panelHeight, instanceId);
  return myApplet;
}
