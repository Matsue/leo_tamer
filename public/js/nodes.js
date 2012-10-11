(function() {

  Ext.define('LeoTamer.model.Nodes', {
    extend: 'Ext.data.Model',
    fields: ["type", "node", "status", "ring_hash_current", "ring_hash_previous", "joined_at"]
  });

  Ext.define("LeoTamer.model.NameValue", {
    extend: 'Ext.data.Model',
    fields: ["name", "value"]
  });

  Ext.define("LeoTamer.Nodes", {
    extend: "Ext.panel.Panel",
    id: "nodes_panel",
    title: "Node Status",
    layout: "border",
    initComponent: function() {
      var detail_store, groupingFeature, node_grid, node_grid_dblclick, node_store, status, status_store;

      node_store = Ext.create("Ext.data.Store", {
        model: "LeoTamer.model.Nodes",
        groupField: 'type',
        proxy: {
          type: 'ajax',
          url: 'nodes/status.json',
          reader: {
            type: 'json',
            root: 'data'
          }
        },
        autoLoad: true
      });

      status = function(val) {
        var src;
        switch (val) {
          case "running":
            src = "images/accept.gif";
            break;
          case "stop":
            src = "images/cross.gif";
            break;
          case "suspended":
            src = "images/error.gif";
            break;
          default:
            throw "invalid status specified.";
        }
        return "<img class='status' src='" + src + "'> " + val;
      };

      groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
        groupHeaderTpl: '{name} ({rows.length} node{[values.rows.length > 1 ? "s" : ""]})',
        hideGroupedHeader: true
      });

      status_store = Ext.create("Ext.data.Store", {
        fields: ["status"],
        data: [
          {
            status: "attached"
          }, {
            status: "running"
          }, {
            status: "restarted"
          }, {
            status: "suspended"
          }, {
            status: "downed"
          }, {
            status: "stopped"
          }
        ]
      });

      detail_store = Ext.create("Ext.data.ArrayStore", {
        model: "LeoTamer.model.NameValue",
        proxy: {
          type: 'ajax',
          url: 'nodes/detail.json',
          reader: {
            type: 'json',
            root: 'data'
          }
        }
      });

      node_grid_select = function(self, record, item, index, event) {
        console.log(self, record, item, index, event);
        detail_store.getProxy().extraParams = {
          node: record.data.node
        };
        detail_store.load();
      };

      node_grid = Ext.create("Ext.grid.Panel", {
        title: 'nodes',
        store: node_store,
        region: "center",
        forceFit: true,
        layout: "fit",
        features: [groupingFeature],
        viewConfig: {
          trackOver: false
        },
        columns: [
          {
            dataIndex: "type"
          }, {
            text: "Node",
            dataIndex: 'node',
            sortable: true
          }, {
            text: "Status",
            dataIndex: 'status',
            renderer: status,
            sortable: true
          }, {
            text: "Ring (Cur)",
            dataIndex: 'ring_hash_current'
          }, {
            text: "Ring (Prev)",
            dataIndex: 'ring_hash_previous'
          }, {
            text: "Joined At",
            dataIndex: "joined_at"
          }
        ],
        tbar: [
          {
            xtype: "textfield",
            fieldLabel: "Filter:",
            labelWidth: 50,
            listeners: {
              change: function(self, new_value) {
                if (new_value === "") node_store.clearFilter();
                return node_store.filter("node", new_value);
              }
            }
          }
        ],
        listeners: {
          viewready: function() {
            return this.getSelectionModel().select(0);
          },
          select: node_grid_select
        }
      });

      detail_grid  = Ext.create("Ext.grid.Panel", {
        xtype: 'grid',
        forceFit: true,
        columns: [
          {
            dataIndex: "name",
            text: "Name"
          }, {
            dataIndex: "value",
            text: "Value"
          }
        ],
        store: detail_store
      });

      detail_panel = Ext.create("Ext.panel.Panel", {
        title: 'details',
        region: "east",
        width: 300,
        layout: "fit",
        items: detail_grid
      });

      Ext.apply(this, {
        defaults: {
          split: true
        },
        items: [
          node_grid,
          detail_panel
        ]
      });
      return this.callParent(arguments);
    }
  });

}).call(this);
