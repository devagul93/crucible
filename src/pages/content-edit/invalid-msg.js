import m from "mithril";

import css from "./invalid-msg.css";

export function controller(options) {
    var ctrl = this;

    ctrl.prevInvalid = false;
    ctrl.transitioning = false;

    ctrl.reset = function() {
        ctrl.prevInvalid = false;
        ctrl.transitioning = false;
    };
}

export function view(ctrl, options) {
    var content = options.content,
        state = content.get(),
        invalidFields = state.form.invalidFields || [];

    if(state.ui.invalid && !ctrl.prevInvalid) {
        ctrl.transitioning = true;
        ctrl.prevInvalid = state.ui.invalid;
    }

    if(!ctrl.transitioning && state.form.valid) {
        return m("div", { style : "display:none;" });
    }

    return m("div", {
            class : !state.ui.invalid ? css.delayedHide : css.visible,

            config : function(el, isInit) {
                if(isInit) {
                    return;
                }

                el.addEventListener("transitionend", function(evt) {
                    content.resetInvalid();
                    ctrl.reset();
                    m.redraw();
                });
            }
        },
        "Missing required fields.",
        m("ul",
            invalidFields.map(function(name) {
                return m("li", name);
            })
        ),
        m("button", {
                class : css.closeInvalidMessage,

                onclick : content.resetInvalid()
            },
            "x" // todo, figure out how to use a unicode x here
        )
    );
}