/* jshint -W098 */

/*
 * Chained - jQuery chained selects plugin
 *
 * Copyright (c) 2010-2013 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 *
 * Version: 0.9.6-dev
 *
 */

;(function($, window, document, undefined) {
    "use strict";

    $.fn.remoteChained = function(parent_selector, url, options) {

        var settings = $.extend( {}, $.fn.remoteChained.defaults, options);

        return this.each(function() {

            /* Save this to self because this changes when scope changes. */
            var self   = this;
            var backup = $(self).clone();

            /* Handles maximum two parents now. */
            $(parent_selector).each(function() {
                $(this).bind("change", function() {

                    /* Build data array from parents values. */
                    var data = {};
                    $(parent_selector).each(function() {
                        var id = $(this).attr(settings.attribute);
                        var value = $(":selected", this).val();
                        data[id] = value;

                        /* Optionally also include values from these inputs. */
                        if (settings.values) {
                            $(settings.values).each(function() {
                                /* Do not include own value. */
                                if (self !== this) {
                                    var id = $(this).attr(settings.attribute);
                                    var value = $(this).val();
                                    data[id] = value;
                                }
                            });
                        }
                    });

                    $.getJSON(url, data, function(json) {
                        build.call(self, json);
                        /* Force updating the children. */
                        $(self).trigger("change");
                    });
                });

                /* If we have bootstrapped data given in options. */
                if (settings.bootstrap) {
                     build.call(self, settings.bootstrap);
                     settings.bootstrap = null;
                 }
            });

            /* Build the select from given data. */
            function build(json) {
                /* If select already had something selected, preserve it. */
                var selected_key = $(":selected", self).val();

                /* Clear the select. */
                $("option", self).remove();

                var option_list = [];
                if ($.isArray(json)) {
                    /* JSON is already an array (which preserves the ordering of options) */
                    /* [["","--"],["series-1","1 series"],["series-3","3 series"]] */
                    option_list = json;
                } else {
                    /* JSON is an JavaScript object. Rebuild it as an array. */
                    /* {"":"--","series-1":"1 series","series-3":"3 series"} */
                    for (var index in json) {
                        if (json.hasOwnProperty(index)) {
                            option_list.push([index, json[index]]);
                        }
                    }
                }

                /* Add new options from json. */
                for (var i=0; i!==option_list.length; i++) {
                    var key = option_list[i][0];
                    var value = option_list[i][1];

                    /* Set the selected option from JSON. */
                    if ("selected" === key) {
                        selected_key = value;
                        continue;
                    }
                    var option = $("<option />").val(key).append(value);
                    $(self).append(option);
                }

                /* Loop option again to set selected. IE needed this... */
                $(self).children().each(function() {
                    if ($(this).val() === selected_key) {
                        $(this).attr("selected", "selected");
                    }
                });

                /* If we have only the default value disable select. */
                if (1 === $("option", self).size() && $(self).val() === "") {
                    $(self).attr("disabled", "disabled");
                } else {
                    $(self).removeAttr("disabled");
                }
            }
        });
    };

    /* Alias for those who like to use more English like syntax. */
    $.fn.remoteChainedTo = $.fn.remoteChained;

    /* Default settings for plugin. */
    $.fn.remoteChained.defaults = {
        attribute: "name",
        values : null,
        bootstrap : null
    };

})(window.jQuery || window.Zepto, window, document);