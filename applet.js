const Lang = imports.lang

const Applet = imports.ui.applet;
const Util = imports.misc.util;
const Settings = imports.ui.settings;
const Mainloop = imports.mainloop;
const Soup = imports.gi.Soup;
const _httpSession = new Soup.SessionAsync();

Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

const coinPriceUrl = 'https://api.bitso.com/v3/ticker?book='
const supportedCoins = [ 'BTC', 'ETH', 'XRP', 'LTC', 'MANA' ]
let coinCounter = 0

Debugger = {
  logLevel: 1,
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
    this.refreshPrices(supportedCoins[coinCounter]);

    if (coinCounter < supportedCoins.length) {
      coinCounter++
    }
    if (coinCounter >= supportedCoins.length) {
      coinCounter = 0
    }

    Mainloop.timeout_add_seconds(3, Lang.bind(this, this._runWatcher));
  },

  loadJsonAsync: function(url, callback) {
    let context = this;
    let message = Soup.Message.new('GET', url);
    _httpSession.queue_message(message, function soupQueue(session, response) {
      callback.call(context, JSON.parse(response.response_body.data));
    })
  },

  refreshPrices: function(coin) {
    this.loadJsonAsync(`${coinPriceUrl}${coin.toLowerCase()}_mxn`, function(dataBtc) {
      this.set_applet_label(_(`${coin}:\t➥ = ${dataBtc.payload.last}\t⬇ = ${dataBtc.payload.low}\t⬆ = ${dataBtc.payload.high}`));
    });
  }
};

function main(metadata, orientation, panelHeight, instanceId) {
  //let myModule = imports.ui.appletManager.applets[metadata.uuid];
  let myApplet = new MyApplet(metadata, orientation, panelHeight, instanceId);
  return myApplet;
}
