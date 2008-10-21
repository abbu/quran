(function($) {
$.quran.trigger = function(ev,data) {
    $($.quran).trigger(ev,data);
};
$.quran.bind = function(ev,fn) {
    $($.quran).bind(ev,fn);
}; 
$.quran._state = {};
$.quran.set_state = function(key,data) {
    $.quran._state[key] = data;
};
$.quran.get_state = function(key) {
    return $.quran._state[key];
};
$.quran.save_application_state = function() {
    console.log('Save app state');
    var keys = new Array();
    for (var key in $.quran._state) {
        if (typeof $.quran._state[key] == 'object') {
            for (var key2 in $.quran._state[key]) {
                if ((typeof $.quran._state[key][key2] == 'number') || (typeof $.quran._state[key][key2] == 'string')) {
                    keys.push(key + '_' + key2);
                    $.cookie(key + '_' + key2, $.quran._state[key][key2]);
                }
            }
        } else if ((typeof $.quran._state[key] == 'number') || (typeof $.quran._state[key] == 'string')) {
            keys.push(key);
            $.cookie(key, $.quran._state[key]);
        }
    }
    $.cookie('keys',keys);
};
$.quran.restore_application_state = function() {
    console.log('Restore app state');
    if ($.cookie('keys')) {
        var keys = $.cookie('keys').split(',');
        var objects = {};
        $.each(keys, function(n,key) {
            if (key.match(/_/)) {
                var key1 = key.split('_')[0];
                var key2 = key.split('_')[1];
                eval('objects.'+ key1 +' = objects.'+ key1 +' || {};');
                eval('$.extend(objects.'+ key1 +',{ '+ key2 +':'+ $.cookie(key) +' });');
                //eval('console.log(objects.'+ key1 +');');
            } else {
                $.quran.set_state(key, $.cookie(key));
            }
        });
        for (var key in objects) {
            $.quran.set_state(key, objects[key]);
        }
    }
    $.quran.trigger('application-state-restored');
};
$(window).load(function() {
    $.quran.restore_application_state();
});
$(window).unload(function() {
    $.quran.save_application_state();
});
var widgets_selector = '#widgets';
$.quran._init_widget = function(widget,options) {
    var callbacks = options.bind;
    $.each(callbacks, function(ev_name, callback) {
        $.quran.bind(ev_name, function(ev,data) {
            callback.call(widget,data);
        });
    });

    var name = options.name || 'give me a name!';
    var node = $('<div class="widget" id="'+ widget.widgetBaseClass +'">');
    var head = $('<div class="head">');
    var name_label = $('<div class="name-label">'+ name +'</div>');
    var sort_handle = $('<div class="sort-handle">');
    var drag_handle = $('<div class="drag-handle">');
    var body = $('<div class="body">');
    $(document).ready(function() {
        head
            .append(name_label)
            .append(sort_handle)
            .append(drag_handle)
        ;
        node
            .append(head)
            .append(body)
            .resizable()
        ;
        $(widgets_selector)
            .append(node)
        ;
    });
    return body;
};
$.quran.add_widget = function(widget_name) {
    $(document).ready(function() {
        $(widgets_selector)[widget_name]();
    });
};
$.quran.remove_widget = function(id) {
};
function get_aya_obj_with_keyword(keyword) {
    var aya_obj = $.quran.get_state('aya');
    if (aya_obj) {
        if (keyword == 'next') {
            if ((aya_obj.id + 1) <= $.quran.data.sura[aya_obj.sura + 1][0]) {
                return {
                    id: aya_obj.id + 1,
                    sura: aya_obj.sura,
                    aya: aya_obj.aya + 1
                };
            } else
            if (aya_obj.sura < 114) {
                return {
                    id: aya_obj.id + 1,
                    sura: aya_obj.sura + 1,
                    aya: 1
                };
            }
        } else
        if (keyword == 'prev') {
            if ((aya_obj.id - 1) > $.quran.data.sura[aya_obj.sura][0]) {
                return {
                    id: aya_obj.id - 1,
                    sura: aya_obj.sura,
                    aya: aya_obj.aya - 1
                };
            } else {
                if (aya_obj.sura > 1) {
                    return {
                        id: aya_obj.id - 1,
                        sura: aya_obj.sura - 1,
                        aya: $.quran.data.sura[aya_obj.sura - 1][1]
                    };
                } else {
                    return {
                        id: 6236,
                        sura: 114,
                        aya: 6
                    };
                }
            }
        }
    }
    return {
        id: 1,
        sura: 1,
        aya: 1
    };
}
function get_aya_obj_with_id(id) {
    var sura, aya;
    id = parseInt(id);
    for (var i=1; i<($.quran.data.sura.length-1); i++) {
        if ($.quran.data.sura[i+1][0] >= id) {
            sura = i;
            aya = id - $.quran.data.sura[i][0];
            break;
        }
    }
    if (id && sura && aya) {
        return {
            id: id,
            sura: sura,
            aya: aya
        };
    } else {
        return {
            id: 1,
            sura: 1,
            aya: 1
        };
    }
}
function get_aya_obj_with_sura_and_aya(sura,aya) {
    var id;
    sura = parseInt(sura);
    aya  = parseInt(aya);
    if ($.quran.data.sura[sura] && (aya <= $.quran.data.sura[sura][1])) {
        id = $.quran.data.sura[sura][0] + aya;
    }
    if (id && sura && aya) {
        return {
            id: id,
            sura: sura,
            aya: aya
        };
    } else {
        return {
            id: 1,
            sura: 1,
            aya: 1
        };
    }
}
function get_aya_obj_with_sura(sura) {
    var id, aya;
    sura = parseInt(sura);
    if ($.quran.data.sura[sura] && (sura >= 1) && (sura <= 114)) {
        id = $.quran.data.sura[sura][0] + 1;
        aya = 1;
    }
    if (id && sura && aya) {
        return {
            id: id,
            sura: sura,
            aya: aya
        };
    } else {
        return {
            id: 1,
            sura: 1,
            aya: 1
        };
    }
}
function change_aya(ev, keyword_or_obj) {
    var keyword, obj;
    var aya_before, aya_after;
    
    aya_before = $.quran.get_state('aya');

    if (typeof keyword_or_obj == 'string') {
        keyword = keyword_or_obj;
    } else 
    if (typeof keyword_or_obj == 'object') {
        obj = keyword_or_obj;
    }
    if (keyword) { // next, prev
        if ((keyword == 'next') || (keyword == 'prev')) {
            $.quran.set_state('aya',get_aya_obj_with_keyword(keyword));
        }
    }
    if (obj) {
        if (obj.id) {
            $.quran.set_state('aya',get_aya_obj_with_id(obj.id));
        } else
        if (obj.sura && obj.aya) {
            $.quran.set_state('aya',get_aya_obj_with_sura_and_aya(obj.sura,obj.aya));
        } else
        if (obj.sura) {
            $.quran.set_state('aya',get_aya_obj_with_sura(obj.sura));
        }
    }

    aya_after = $.quran.get_state('aya');

    if (!aya_before || (aya_before.id != aya_after.id)) {
        $.quran.trigger('aya-changed', aya_after);
    }
}
function change_recitor(ev, recitor) {
    var recitor_before, recitor_after;

    recitor_before = $.quran.get_state('recitor');

    $.quran.set_state('recitor', recitor);

    recitor_after = $.quran.get_state('recitor');

    if (!recitor_before || (recitor_before != recitor_after)) {
        $.quran.trigger('recitor-changed', recitor_after);
    }
}
$.quran.bind('change-aya', change_aya);
$.quran.bind('change-recitor', change_recitor);
})(jQuery);
(function($) {
$.widget('quran.controller', {
    _init: function() {
        console.log('controller');
        this.body = $.quran._init_widget(this, {
            name: 'Controller',
            bind: {
                'aya-changed': this.set_aya,
                'recitor-changed': this.set_recitor,
                'application-state-restored': function() {
                    console.log('state restore',arguments);
                    var aya_obj = $.quran.get_state('aya');
                    if (aya_obj) {
                        this.set_aya(aya_obj);
                    }
                    var recitor = $.quran.get_state('recitor');
                    if (recitor) {
                        this.set_recitor(recitor);
                    }
                }
            }
        });
        this.recitor_select = $('<select>');
        this.sura_select = $('<select>');
        this.aya_select = $('<select>');

        var my = this;
        function populate_recitors() {
            console.log('populate recitors');
            for (var i=0; i < $.quran.config.recitors.length; i++) {
                my.recitor_select
                    .append('<option value='+ $.quran.config.recitors[i][1] +'>'+ $.quran.config.recitors[i][0] +'</option>');
            }
        }
        function populate_suras() {
            console.log('populate suras');
            for (var i=1; i < $.quran.data.sura.length - 1; i++) {
                 my.sura_select
                    .append('<option value='+ i +'>'+ $.quran.data.sura[i][5] + '</option>');
            }
        }
        function set_defaults() {
            if (!$.quran.get_state('recitor')) {
                $.quran.set_state('recitor', my.recitor_select[0].options[my.recitor_select[0].selectedIndex].value);
            }
            if (!$.quran.get_state('aya')) {
                $.quran.set_state('aya', { id: 1, aya: 1, sura: 1 });
            }
        }

        populate_recitors();
        populate_suras();
        set_defaults();

        this.recitor_select.change(function() {
            console.log('recitor select change setting state');
            $.quran.trigger('change-recitor', $(this)[0].options[$(this)[0].selectedIndex].value);
        });
        this.sura_select.change(function() {
            console.log('sura select change setting state');
            $.quran.trigger('change-aya', { sura: $(this)[0].options[$(this)[0].selectedIndex].value });
        });
        this.aya_select.change(function() {
            console.log('aya select change setting state');
            $.quran.trigger('change-aya', { id: $(this)[0].options[$(this)[0].selectedIndex].value });
        });

        this.body.append(this.recitor_select);
        this.body.append(this.sura_select);
        this.body.append(this.aya_select);

        this.prev_sura_button = $('<div class="icon-resultset-first">&#160;</div>');
        this.prev_aya_button = $('<div class="icon-resultset-previous">&#160;</div>');
        this.next_aya_button = $('<div class="icon-resultset-next">&#160;</div>');
        this.next_sura_button = $('<div class="icon-resultset-last">&#160;</div>');

        this.prev_sura_button.click(function() { my.prev_sura.call(my); });
        this.prev_aya_button.click(function() { my.prev_aya.call(my); });
        this.next_aya_button.click(function() { my.next_aya.call(my); });
        this.next_sura_button.click(function() { my.next_sura.call(my); });

        this.body.append(this.prev_sura_button);
        this.body.append(this.prev_aya_button);
        this.body.append(this.next_aya_button);
        this.body.append(this.next_sura_button);
    },
    set_aya: function(aya_obj) {
        console.log('set_aya',aya_obj);
        if (!this.last_sura || (this.last_sura != aya_obj.sura)) {
            console.log('!= sura');
            this.set_sura(aya_obj.sura);
            this.aya_select.html('');
            for (var i=1; i <= $.quran.data.sura[aya_obj.sura][1]; i++) {
                var index = $.quran.data.sura[aya_obj.sura][0] + i;
                this.aya_select
                    .append('<option value='+ index +'>'+ i + '</option>');
            }
            this.last_sura = aya_obj.sura;
        }
        var selectedIndex = 0;
        for (var i = 0; i < this.aya_select[0].options.length; i++) {
            var option = this.aya_select[0].options[i];
            if (option.value == aya_obj.id) {
                selectedIndex = i;
                break;
            }
        }
        this.aya_select[0].selectedIndex = selectedIndex;
    },
    get_aya: function() {
        return parseInt(this.aya_select[0].options[this.aya_select[0].selectedIndex].value);
    },
    set_sura: function(sura) {
        console.log('set sura',sura);
        var selectedIndex = 0;
        for (var i = 0; i < this.sura_select[0].options.length; i++) {
            var option = this.sura_select[0].options[i];
            if (option.value == sura) {
                selectedIndex = i;
                break;
            }
        }
        this.sura_select[0].selectedIndex = selectedIndex;
    },
    get_sura: function() {
        return parseInt(this.sura_select[0].options[this.sura_select[0].selectedIndex].value);
    },
    set_recitor: function(recitor) {
        if (recitor != this.get_recitor()) { 
            console.log('set recitor',recitor);
            var selectedIndex = 0;
            for (var i = 0; i < this.recitor_select[0].options.length; i++) {
                var option = this.recitor_select[0].options[i];
                if (option.value == recitor) {
                    selectedIndex = i;
                    break;
                }
            }
            this.recitor_select[0].selectedIndex = selectedIndex;
        }
    },
    get_recitor: function() {
        return this.recitor_select[0].options[this.recitor_select[0].selectedIndex].value;
    },
    prev_aya: function() {
        $.quran.trigger('change-aya','prev');
    },
    prev_sura: function() {
        var sura = this.get_sura() - 1;
        if ((sura <= 0) || (sura > 114)) {
            sura = 114;
        }
        $.quran.trigger('change-aya', { sura: sura });
    },
    next_aya: function() {
        $.quran.trigger('change-aya','next');
    },
    next_sura: function() {
        var sura = this.get_sura() + 1;
        if ((sura <= 0) || (sura > 114)) {
            sura = 1;
        }
        $.quran.trigger('change-aya', { sura: sura });
    }
});
$(document).ready(function() {
    $.quran.add_widget('controller');
});
$.widget('quran.player', {
    _init: function() {
        console.log('player');
        this.body = $.quran._init_widget(this, {
            name: 'Player',
            bind: {
                'aya-changed': this.set_track,
                'recitor-changed': function(recitor) {
                    this.set_track(undefined, recitor);
                },
                'application-state-restored': function() {
                    var aya_obj = $.quran.get_state('aya');
                    var recitor = $.quran.get_state('recitor');
                    if (aya_obj && recitor) {
                        this.set_track(aya_obj,recitor);
                    }
                }
            }
        });

        this.play_button = $('<div class="icon-control-play">');
        this.position_slider = $('<div class="position-slider">');
        this.position_slider_handle = $('<div class="position-slider-handle">').appendTo(this.position_slider);
        this.time_played_indicator = $('<div>');
        this.time_total_indicator = $('<div>');
        this.volume_slider = $('<div class="volume-slider">');
        this.volume_slider_handle = $('<div class="volume-slider-handle">').appendTo(this.volume_slider);
        this.more_options_menu = $('<div>');


        this.body.append(this.play_button);
        this.body.append(this.position_slider);
        this.body.append(this.time_played_indicator);
        this.body.append(this.time_total_indicator);
        this.body.append(this.volume_slider);
        this.body.append(this.more_options_menu);
    },
    set_track: function(aya_obj,recitor) {
        if (aya_obj === undefined) { //recitor change
            console.log('set_track (recitor change)',aya_obj,recitor);
        } else
        if (recitor === undefined) { //aya change
            console.log('set_track (aya change)',aya_obj,recitor);
        } else { //fresh
            console.log('set_track (fresh change)',aya_obj,recitor);
        }
    },
    get_track: function() {
    },
    set_range: function() {
    },
    get_range: function() {
    },
    set_time: function() {
    },
    get_time: function() {
    },
    set_volume: function() {
    },
    get_volume: function() {
    },
    set_mode: function() {
    },
    get_mode: function() {
    },
    play: function() {
    },
    pause: function() {
    },
    stop: function() {
    }
});
$(document).ready(function() {
    $.quran.add_widget('player');
});
})(jQuery);
/*
// application
(function($) {
    // event handling
    $.quran.trigger = function(ev,data) {
        $($.quran).trigger(ev,data);
    };
    $.quran.bind = function(ev,fn) {
        $($.quran).bind(ev,fn);
    }; 

    function change_aya(ev, keyword_or_obj) {
        var keyword, obj;
        if (typeof keyword_or_obj == 'string') {
            keyword = keyword_or_obj;
        } else if (typeof keyword_or_obj == 'object') {
            obj = keyword_or_obj;
        }
        if (keyword) {
            // next, prev
        }
        if (obj) {
            if (obj.id) {
                $.quran.set_state(get_sura_aya_with_id(obj.id));
            }
        }
    };
    $.quran.bind('change-aya', change_aya);

    // state handling
    $.quran.state = new Object();
    $.quran.get_state = function(key) {
        return $.quran.state[key] || false;
    };
    $.quran.set_state = function(key, value) {
        $.quran.state[key] = value;
        $.quran.trigger('state-change',{
            key: key,
            value: value
        });
    };
    $.quran.restore_application_state = function() {
        //console.log('restore_state');
        if ($.cookie('keys')) {
            var keys_object = $.cookie('keys').split(',');
            $.each(keys_object, function(n,key) {
                $.quran.set_state(key, $.cookie(key));
            });
        }

        $.quran.trigger('application-state-restored');
    };
    $.quran.save_application_state = function() {
        var keys = new Array();
        for (var key in $.quran.state) {
            keys.push(key);
            $.cookie(key, $.quran.state[key]);
        }
        $.cookie('keys',keys);
    };

    // widget framework
    $.quran.widgets = new Object();
    $.quran.create_widget = function(options) {
        var widget = options.widget;
        var title = options.title;

        $.quran.widgets[widget.widgetName] = widget;

        var element   = $('<div class="widget">');
        var head      = $('<div class="head">'+ title +'</div>');
        var body      = $('<div class="body">');

        element
            .append(head)
            .append(body);

        widget.element
            .append(element);

        return body;
    };

    // run-time browser events
    $(window).load(function() {
        // restore state from cookies
        //console.log('load');
        function get_working_mirror() {
            // this should ping mirrors and check paths
            return $.quran.config.mp3_mirrors[0]; // just return the first thing for now
        };
        var mirror = get_working_mirror();
        $.quran.set_state('mirror', mirror);

        $.quran.restore_application_state();
    });
    $(window).unload(function() {
        // save state in cookies
        $.quran.save_application_state();
    });
    $(window).resize(function() {
        // resize the app components to fit if they don't behave elastically
    });
    $(window).scroll(function() {
        // attempt to reposition window to 0, 0
    });
    $(window).error(function(msg, url, line) {
        // maybe send an ajax post to our server so that we can log it
    });
    $(document).ready(function() {
        //console.log('ready');
        $(document.body).quranController({
            title: 'Quran Controller'
        });
        $(document.body).quranPlayer({
            title: 'Quran Player'
        });
    });
})(jQuery);
// controller
(function($) {
    // the following is very complex but it works relatively well.
    // please do not refactor unless you ultimately enhance functionality
    // or enhance efficiency in a reasonable cost-benefit trade off
    $.widget('ui.quranController', {
        _init: function() {
            var widget = this;
            var options = widget.options;

            widget.ui = new Object();

            widget.ui.body = $.quran.create_widget({
                widget: widget,
                title: options.title
            });

            widget.ui.body.html(
                widget._make_inner_body()
            );
            
            widget.ui.select_aya     = widget.ui.body.find('.select-aya')
            .change(function() {
                var aya = $(this)[0].selectedIndex+1;
                var index = $(this)[0].value;
                $.quran.set_state('aya', aya);
                $.quran.set_state('index', index);
                //console.log('change aya',aya,index);
            });
            widget.ui.select_sura    = widget.ui.body.find('.select-sura')
            .change(function() {
                $.quran.set_state('sura', $(this)[0].value);
                widget._populate_ayas();
                widget.ui.select_aya.trigger('change');
            });
            widget.ui.select_recitor = widget.ui.body.find('.select-recitor')
            .change(function() {
                $.quran.set_state('recitor', $(this)[0].value);
            });

            widget._populate_recitors();
            widget._populate_suras();
            widget._populate_ayas();

            var prev_sura = function(ev,last_aya) {
                var selector = widget.ui.select_sura;
                var dom = selector[0];
                var go_last_next = false;
                if ((last_aya) && (dom.selectedIndex != 0)) {
                    go_last_next = true;
                }
                var prev = dom.selectedIndex-1;
                if ((prev >= 0) && (dom.options[prev])) {
                    dom.selectedIndex = prev;
                    selector.trigger('change');
                }

                if (go_last_next) {
                    var selector = widget.ui.select_aya;
                    var dom = selector[0];
                    dom.selectedIndex = dom.options.length - 1;
                    selector.trigger('change');
                }
            };
            var prev_aya = function(ev) {
                var selector = widget.ui.select_aya;
                var dom = selector[0];
                var prev = dom.selectedIndex-1;
                if ((prev >= 0) && (dom.options[prev])) {
                    dom.selectedIndex = prev;
                    selector.trigger('change');
                } else {
                    var selector = widget.ui.select_sura;
                    var dom = selector[0];
                    if (dom.selectedIndex != 0)
                        prev_sura(ev,true);
                }
            };
            var next_aya = function() {
                var selector = widget.ui.select_aya;
                var dom = selector[0];
                var next = dom.selectedIndex+1;
                if (dom.options[next]) {
                    dom.selectedIndex = next;
                    selector.trigger('change');
                } else {
                    next_sura();
                }
            };
            $.quran.bind('next-aya',next_aya); // let other widgets hook in
            var next_sura = function() {
                var selector = widget.ui.select_sura;
                var dom = selector[0];
                var next = dom.selectedIndex+1;
                if (dom.options[next]) {
                    dom.selectedIndex = next;
                    selector.trigger('change');
                }
            };
            var mouseup = false;
            var scrolling = false;
            var scroll = function(dir,obj) {
                if (!mouseup && !scrolling)
                    setTimeout(function() {
                        scrolling = true;
                        eval('scroll("'+dir+'",'+'"'+obj+'");');
                    }, 250);
                else if (mouseup)
                    scrolling = false;
                else if (scrolling)
                    setTimeout(function() {
                        eval(dir+'_'+obj+'();');
                        eval('scroll("'+dir+'",'+'"'+obj+'");');
                    }, 50);
            };

            widget.ui.prev_sura = widget.ui.body.find('.icon-resultset-first')
            .click(prev_sura)
            .mousedown(function() {
                mouseup = false;
                scroll('prev','sura');
            })
            .mouseup(function() {
                mouseup = true;
            })
            .mouseout(function() {
                mouseup = true;
            })
            ;
            widget.ui.prev_aya  = widget.ui.body.find('.icon-resultset-previous')
            .click(prev_aya)
            .mousedown(function() {
                mouseup = false;
                scroll('prev','aya');
            })
            .mouseup(function() {
                mouseup = true;
            })
            .mouseout(function() {
                mouseup = true;
            })
            ;
            widget.ui.next_aya  = widget.ui.body.find('.icon-resultset-next')
            .click(next_aya)
            .mousedown(function() {
                mouseup = false;
                scroll('next','aya');
            })
            .mouseup(function() {
                mouseup = true;
            })
            .mouseout(function() {
                mouseup = true;
            })
            ;
            widget.ui.next_sura = widget.ui.body.find('.icon-resultset-last')
            .click(next_sura)
            .mousedown(function() {
                mouseup = false;
                scroll('next','sura');
            })
            .mouseup(function() {
                mouseup = true;
            })
            .mouseout(function() {
                mouseup = true;
            })
            ;
        },
        _make_inner_body: function() {
            var widget = this;
            var inner_body = $(
                '<select class="select-recitor"></select>' +
                '<select class="select-sura"></select>' +
                '<select class="select-aya"></select>' +
                '<div class="icon-resultset-first">&#160;</div>' +
                '<div class="icon-resultset-previous">&#160;</div>' +
                '<div class="icon-resultset-next">&#160;</div>' +
                '<div class="icon-resultset-last">&#160;</div>'
            );

            return inner_body;
        },
        _restore_state: function(key) {
            var widget = this;
            var el = eval('widget.ui.select_' + key);
            if ($.quran.get_state(key)) {
                el[0].selectedIndex = function() {
                var target_value = $.quran.get_state(key);
                var selected_index = 0;
                var arr = el[0].options
                for (var i=0; i < arr.length; i++) {
                    if (arr[i].value == target_value) {
                        selected_index = i;
                        break;
                    }
                }
                return selected_index;
                }();
            } else {
                $.quran.set_state(key, el[0].value);
            }
        },
        _populate_recitors: function() {
            var widget = this;
            for (var i=0; i < $.quran.config.recitors.length; i++) {
                widget.ui.select_recitor.append('<option value='+ $.quran.config.recitors[i][1] +'>'+ $.quran.config.recitors[i][0] + '</option>');
            }

            $.quran.bind('application-state-restored',function() {
                widget._restore_state('recitor');
            });
        },
        _populate_suras: function() {
            var widget = this;
            for (var i=1; i < $.quran.data.sura.length - 1; i++) { // iterates from '1' to '114'
                 widget.ui.select_sura.append('<option value='+ i +'>'+ $.quran.data.sura[i][5] + '</option>'); // 2nd array index: '5' corresponds to 'transliterated name'
            }

            $.quran.bind('application-state-restored',function() {
                widget._restore_state('sura');
            });
        },
        _populate_ayas: function() {
            var widget = this;
            function make_ayas() {
                var sura = $.quran.get_state('sura');
                var ayas = $.quran.data.sura[sura][1]; // 2nd array index '1' corresponds to number of ayas
                widget.ui.select_aya.html('');
                for (var i=1; i <= ayas; i++) {
                    var aya_index = parseInt($.quran.data.sura[sura][0]) + parseInt(i);
                    widget.ui.select_aya.append('<option value='+ aya_index +'>'+ i +'</option>');
                }
                var aya = widget.ui.select_aya[0].selectedIndex+1;
                var index = widget.ui.select_aya[0].value;
                $.quran.set_state('aya', aya);
                $.quran.set_state('index', index);
                //console.log('change sura',aya,index);
            };
            widget.ui.select_sura.one('change',make_ayas);
            $.quran.bind('application-state-restored',function() {
                make_ayas();
                widget._restore_state('aya');
            });
        }
    });


    $.extend('ui.quranController', {
        version: '0.1',
        defaults: {
        }
    });

})(jQuery);
// player
(function($) {


    $.widget('ui.quranPlayer', {
        _init: function() {
            var widget = this;
            var options = widget.options;



            $.quran.bind('state-change', function(ev,data) {
                widget.data = widget._get_data();
                console.log('state-change', ev,data);
            });



            widget.ui = new Object();

            widget.ui.body = $.quran.create_widget({
                widget: widget,
                title: options.title
            });

            widget.ui.body.html(
                widget._make_inner_body()
            );


            widget.ui.play_icon = widget.ui.body.find('.icon-control-play').click(function() {
                $(this).addClass('on');
                widget.play_mp3(widget.data);
            });
            widget.ui.position_slider = widget.ui.body.find('.position-slider').slider({
                handle: '.position-slider-handle',
                axis: 'horizontal',
            });
            widget.ui.volume_slider = widget.ui.body.find('.volume-slider').slider({
                handle: '.volume-slider-handle',
                axis: 'vertical',
            }).hide();
            widget._init_sound();
        },
        _make_inner_body: function() {
            var widget = this;
            var inner_body = $(
                '<div class="icon-control-play">&#160;</div>' + // play, pause, stop all in one
                '<div class="position-slider">' +
                    '<div class="position-slider-handle"></div>' +
                '</div>' +
                // time played / time total
                // volume icon <--
                '<div class="volume-slider">' +
                    '<div class="volume-slider-handle"></div>' +
                '</div>'
                // some other icon
                // other options slide out
                // i.e. familiar youtube layout
                // rating stars hm
            );

            return inner_body;
        },
        _get_data: function() {
            var prepend_zeros, sura_number, aya_number, mp3_id, mp3_url, mp3_data = new Object();
                
            sura_number = $.quran.get_state('sura');
            aya_number  = $.quran.get_state('aya');

            sura_number  = sura_number.toString();
            aya_number   = aya_number.toString();

            prepend_zeros = '';
            for (var i = sura_number.length; i < 3; i++) {
                prepend_zeros = prepend_zeros.concat('0');
            }
            sura_number = prepend_zeros.concat(sura_number);

            prepend_zeros = '';
            for (var i = aya_number.length; i < 3; i++) {
                prepend_zeros = prepend_zeros.concat('0');
            }
            aya_number = prepend_zeros.concat(aya_number);

            mp3_id  = sura_number + aya_number + '.mp3';
            mp3_url = $.quran.get_state('mirror') + $.quran.get_state('recitor') + '/' + mp3_id;

            mp3_data = {
                id  : mp3_id,
                url : mp3_url
            };

            //console.log(mp3_data);

            return mp3_data;
        },
        _init_sound: function() {
            var widget = this;
            // the only thing being done here is creating
            // an internal pointer to the soundManager instance
            widget.sound = soundManager;
        },
        load_mp3: function(data, play) {
            var widget = this;
            //console.log('load_mp3',data,play);
            widget.sound.createSound({
                id: data.id,
                url: data.url,
                onload: function() {
                    console.log('onload');
                    var sound = this;
                    widget.ui.position_slider.slider('destroy');
                    widget.ui.position_slider.slider({
                        handle: '.position-slider-handle',
                        axis: 'horizontal',
                        min: 0,
                        max: sound.durationEstimate
                    });
                    if (play)
                        widget.play_mp3(widget.data);
                },
                onplay: function() {
                    console.log('onplay');
                },
                onpause: function() {
                    console.log('onpause');
                },
                onresume: function() {
                    console.log('onresume');
                },
                onstop: function() {
                    console.log('onstop');
                },
                onfinish: function() {
                    console.log('onfinish');
                    widget.ui.play_icon.removeClass('on');

                    // if continuous is on, play the next ayah
                    if (widget.play_mode == 'continuous') {
                        $.quran.trigger('next-aya');
                        var data = widget._get_data();
                        widget.load_mp3(widget.data,true);
                    }
                },
                onjustbeforefinish: function() {
                    console.log('onjustbeforefinish');
                },
                onbeforefinishcomplete: function() {
                    console.log('onbeforefinishcomplete');
                },
                onbeforefinish: function() {
                    console.log('onbeforefinish');
                },
                onid3: function() {
                    console.log('onid3');
                },
                whileplaying: function() {
                    var sound = this;
                    widget.ui.position_slider.slider('moveTo',sound.position)
                }
            });
        },
        play_mp3: function(data) {
            var widget = this;
            if (($.inArray(widget.data.id, widget.sound.soundIDs) == -1) || (widget.last_url != data.url)) {
                // if the sound id is not in the sound manager
                // then call the load function with the 'play'
                // parameter set to true, which calls this function
                // back on the soundmanager's onload event

                if (widget.last_url != data.url) // temporary quick hackish diversion from design pattern
                    widget.sound.destroySound(widget.data.id);

                widget.last_url = data.url;
                widget.load_mp3(widget.data,true);
            } else { 
                // otherwise just play it
                widget.sound.play(widget.data.id);
            }
        },
        pause_mp3: function(data) {
            var widget = this;
        },
        resume_mp3: function(data) {
            var widget = this;
            widget.sound.resume(widget.data.id);
        }
    });

    $.extend('ui.quranPlayer', {
        version: '0.1',
        defaults: {
        }
    });

})(jQuery);
*/
