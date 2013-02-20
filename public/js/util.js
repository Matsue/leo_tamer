(function() {
  Object.clone = function(source) {
    return $.extend({}, source);
  };

  Ext.define("LeoTamer.Msg", {
    statics: {
      // alert with ERROR icon
      alert: function(title, msg, fn, scope) {
        Ext.Msg.show({
          title: title,
          msg: msg,
          fn: fn,
          scope: scope,
          buttons: Ext.Msg.OK,
          icon: Ext.Msg.ERROR // set icon
        });
      }
    },

    constructor: function () {
      this.callSuper(arguments);
    }
  });

  Ext.define("LeoTamer.model.NameValue", {
    extend: "Ext.data.Model",
    fields: ["name", "value", "group"]
  });

  LeoTamer.confirm_password = function(callback, msg) {
    var msg = msg || "";

    if (msg !== "") msg += "<br><br>";
    msg += "Please Input Your Passowrd:";

    Ext.Msg.prompt("Confirm", msg, function(btn, password) {
      if (btn === "ok") callback(password);
    });
  }

  Ext.util.Format.SI = function(number, format) {
    var format = format || "0";
    if (number < 1024) {
        return Ext.util.Format.number(number, format);
    } else if (number < 1048576) {
        return Ext.util.Format.number(Math.round(((number * 100) / 1024)) / 100, format) + "K";
    } else if (number < 1073741824) {
        return Ext.util.Format.number(Math.round(((number * 100) / 1048576)) / 100, format) + "M";
    } else if (number < 1099511627776) {
        return Ext.util.Format.number(Math.round(((number * 100) / 1073741824)) / 100, format) + "G";
    } else {
        return Ext.util.Format.number(Math.round(((number * 100) / 1099511627776)) / 100, format) + "T";
    }
  };
}).call(this);
