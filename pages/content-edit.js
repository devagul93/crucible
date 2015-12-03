"use strict";

var m = require("mithril"),
    
    types  = require("../types"),
    db     = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl = this,
            
            entry  = db.child("content/" + m.route.param("id")),
            schema = db.child("schemas/" + m.route.param("schema"));
        
        ctrl.ref    = entry;
        ctrl.entry  = null;
        ctrl.schema = null;
        
        entry.on("value", function(snap) {
            ctrl.entry = snap.val();
            
            if(!ctrl.entry.data) {
                ctrl.entry.data = {};
            }
            
            m.redraw();
        });

        schema.on("value", function(snap) {
            ctrl.schema = snap.val();

            m.redraw();
        })
        
        ctrl.namechange = function(name) {
            ctrl.entry.name = name;
        };
        
        ctrl.fieldchange = function(key, value) {
            ctrl.entry.data[key] = value;
        };
        
        ctrl.onsubmit = function(e) {
            e.preventDefault();
            
            ctrl.entry.updated = db.TIMESTAMP;
            
            entry.update(ctrl.entry);
        };
    },

    view : function(ctrl) {
        if(!ctrl.entry || !ctrl.schema) {
            return m("h1", "LOADING...");
        }

        return [
            m("h1", "Content - Editing \"" + (ctrl.entry.name || "") + "\""),
            
            m("div",
                m("label",
                    "Type: ",
                    m("a", { href : "/schemas/" + ctrl.entry._schema, config : m.route }, ctrl.schema.name)
                )
            ),
            m.component(types.components.fields.show, { details : ctrl.schema, ref : ctrl.ref, data : ctrl.entry })
        ];
    }
};
