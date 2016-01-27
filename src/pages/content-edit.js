"use strict";

var m          = require("mithril"),
    get        = require("lodash.get"),
    set        = require("lodash.set"),
    merge      = require("lodash.merge"),
    assign     = require("lodash.assign"),
    capitalize = require("lodash.capitalize"),

    children = require("../types/children"),
    db       = require("../lib/firebase"),
    update   = require("../lib/update"),
    Entry    = require("../lib/entry"),

    layout = require("./layout"),
    nav    = require("./content-edit/nav"),

    publishing = require("./content-edit/publishing"),
    versioning = require("./content-edit/versioning"),

    css = require("./content-edit.css"),
    
    redraw = m.redraw.bind();

module.exports = {
    controller : function() {
        var ctrl = this,

            id     = m.route.param("id"),
            schema = db.child("schemas/" + m.route.param("schema")),
            entry  = new Entry({
                schema : m.route.param("schema"),
                id     : m.route.param("id")
            });
        
        ctrl.entry  = entry;
        ctrl.schema = null;
        ctrl.form   = null;
        ctrl.data   = {};

        // No sense doing any work if we don't have an id to operate on
        if(!entry.id) {
            return;
        }
        
        // Listen for data updates from firebase
        entry.data(function(data) {
            ctrl.data = data;
            
            m.redraw();
        });
        
        // Go load the schema
        schema.on("value", function(snap) {
            ctrl.schema = snap.val();
            ctrl.schema.key = snap.key();

            m.redraw();
        });
    },

    view : function(ctrl) {
        if(!ctrl.schema) {
            return m.component(layout);
        }
        
        if(!ctrl.entry.id) {
            return m.component(layout, {
                title   : capitalize(ctrl.schema.name),
                content : [
                    m.component(nav),
                    m("div", { class : css.empty },
                        m("p", "Select an entry from the list")
                    )
                ]
            });
        }

        return m.component(layout, {
            title   : capitalize(get(ctrl.data, "name")) + " | " + capitalize(ctrl.schema.name), 
            content : [
                m.component(nav),
                m("div", { class : css.content },
                    m("div", { class : css.head },
                        m("div", { class : css.actions },
                            m.component(publishing, {
                                entry   : ctrl.entry,
                                data    : ctrl.data,
                                class   : css.publishing,
                                enabled : ctrl.form && ctrl.form.checkValidity()
                            }),
                            m("div", { class : css.previewing },
                                m("button", {
                                        class  : css.preview,
                                        title  : "Preview",
                                        href   : ctrl.schema.preview + ctrl.id,
                                        target : "_blank"
                                    },
                                    m("svg", { class : css.previewIcon },
                                        m("use", { href : "/src/icons.svg#icon-preview" })
                                    ),
                                    "Preview"
                                )
                            ),
                            m.component(versioning, {
                                entry : ctrl.entry,
                                data  : ctrl.data,
                                class : css.versioning
                            })
                        )
                    ),
                    m("div", { class : css.body },
                        m("h2", { class : css.schema }, "/" + ctrl.schema.name + "/"),
                        m("h1", {
                                class : css.title,
                                contenteditable : true,
                                oninput : m.withAttr("innerText", update(ctrl.ref, ctrl.data, [ "name" ]))
                            },
                            ctrl.data.name || ""
                        ),
                        m("form", {
                                class  : css.form,
                                config : function(el, init) {
                                    if(init) {
                                        return;
                                    }

                                    ctrl.form = el;

                                    // force a redraw so publishing component can get
                                    // new args w/ actual validity
                                    m.redraw();
                                }
                            },
                            m.component(children, {
                                data   : ctrl.data.fields || {},

                                // TODO: Change to "fields"?
                                details : ctrl.schema.fields,
                                path   : [ "fields" ],
                                root   : ctrl.entry,
                                state  : ctrl.data.fields,
                                update : update.bind(null, ctrl.ref, ctrl.data)
                            })
                        )
                    )
                )
            ]
        });
    }
};
