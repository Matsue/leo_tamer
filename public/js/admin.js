(function() {
  Ext.define("LeoTamer.Admin", {
    extend: "Ext.panel.Panel",
    id: "admin",
    title: "Admin",
    layout: "border",

    initComponent: function() {
      var buckets, endpoints, credentials;
      var set_icon, admin_store, admin_card, admin_grid;

      buckets = Ext.create("LeoTamer.Buckets");
      endpoints = Ext.create("LeoTamer.Endpoints");
      credentials = Ext.create("LeoTamer.Users");

      admin_store = Ext.create("Ext.data.Store", {
        fields: ["name"],
        data: [
          { name: "Buckets" },
          { name: "Endpoints" },
          { name: "Users" },
        ]
      });

      set_icon = function(value) {
        img = undefined
        switch(value) {
          case "Buckets":
            img = "<img src='images/bucket.png'> ";
            break;
          case "Endpoints":
            img = "<img src='images/endpoint.png'> ";
            break;
          case "Users":
            img = "<img src='images/users.png'> ";
            break;
        }
        return img + value;
      }

      admin_grid = Ext.create("Ext.grid.Panel", {
        title: "Menu",
        region: "west",
        id: "admin_grid",
        width: 200,
        forceFit: true,
        hideHeaders: true,
        store: admin_store,
        columns: [{
          dataIndex: "name",
          renderer: set_icon
        }],
        listeners: {
          select: function(self, record, index) {
            admin_card.getLayout().setActiveItem(index);
          },
          afterrender: function(self) {
            self.getSelectionModel().select(0);
          }
        }
      });

      admin_card = Ext.create("Ext.panel.Panel", {
        region: "center",
        layout: "card",
        activeItem: 0,
        items: [
          buckets,
          endpoints,
          credentials,
          history
        ]
      });

      Ext.apply(this, {
        items: [
          admin_grid,
          admin_card
        ]
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
