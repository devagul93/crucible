import m from "mithril";
import assign from "lodash.assign";

import * as children from "./children";
import * as instructions from "./instructions";

import css from "./split.css";

export default {
    view : function(ctrl, options) {
        var field  = options.field;
        
        return m("div", { class : css.container },
            field.instructions ? m.component(instructions, { field : field.instructions }) : null,
            (field.children || []).map(function(section) {
                return m("div", { class : css.section },
                    m.component(children, assign({}, options, {
                        // Don't want to repeat any incoming class that children might've passed in
                        class  : false,
                        fields : section.children
                    }))
                );
            })
        );
    }
};
