const Lang = imports.lang

const Applet = imports.ui.applet
const Util = imports.misc.util
const Settings = imports.ui.settings
const Mainloop = imports.mainloop
const Soup = imports.gi.Soup
const _httpSession = new Soup.SessionAsync()

Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault())

const UUID = "coins-watcher@oz.com";
const APPLET_PATH = imports.ui.appletManager.appletMeta[UUID].path;
const coinPriceUrl = 'https://api.bitso.com/v3/ticker?book='
const supportedCoins = [ 'BTC', 'ETH', 'XRP', 'MANA', 'BAT' ]
const refreshTimeInSeconds = 3

let coinCounter = 0

var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  maximumFractionDigits: 3, // (causes 2500.99 to be printed as $2,501)
})

Debugger = {
  logLevel: 1,
  setLogLevel: function(level) {
    this.log(`Setting new log level: ${level}`, 1)
    this.logLevel = level
  },

	log: function(message, level) {
    //if (!level) {
      //level = 1
    //}
    //if (level <= this.logLevel) {
      global.log(message)
    //}
	},

  logError: function(error) {
    global.logError(error)
  }
}

function MyApplet(metadata, orientation, panel_height, instance_id) {
  this._init(metadata, orientation, panel_height, instance_id)
}

MyApplet.prototype = {
  __proto__: Applet.TextIconApplet.prototype,

  _init: function(metadata, orientation, panelHeight, instanceId) {
    Applet.TextIconApplet.prototype._init.call(this, orientation, panelHeight, instanceId)

    try {
      //this.set_applet_icon_name("network");

      this._metadata = metadata

      this._runWatcher()
    } catch (error) {
      Debugger.logError(error);
    }
  },

  _runWatcher: function() {
    this.refreshPrices(supportedCoins[coinCounter])

    if (coinCounter < supportedCoins.length) {
      coinCounter++
    }
    if (coinCounter >= supportedCoins.length) {
      coinCounter = 0
    }

    Mainloop.timeout_add_seconds(refreshTimeInSeconds, Lang.bind(this, this._runWatcher))
  },

  loadJsonAsync: function(url, callback) {
    let context = this
    let message = Soup.Message.new('GET', url)
    _httpSession.queue_message(message, function soupQueue(session, response) {
      callback.call(context, JSON.parse(response.response_body.data))
    })
  },

  refreshPrices: function(coin) {
    const lowCaseCoinName = coin.toLowerCase();

    this.loadJsonAsync(`${coinPriceUrl}${lowCaseCoinName}_mxn`, function(dataCoin) {
      this.set_applet_tooltip(_(`${coin}\n⬆ = ${formatter.format(dataCoin.payload.high)}\n⬇ = ${formatter.format(dataCoin.payload.low)}`))
      this.set_applet_icon_path(`${APPLET_PATH}/icons/${lowCaseCoinName}.svg`);
      this.set_applet_label(_(` ${formatter.format(dataCoin.payload.last)}`))
    })
  }
}

function main(metadata, orientation, panelHeight, instanceId) {
  //let myModule = imports.ui.appletManager.applets[metadata.uuid]
  let myApplet = new MyApplet(metadata, orientation, panelHeight, instanceId)
  return myApplet
}
