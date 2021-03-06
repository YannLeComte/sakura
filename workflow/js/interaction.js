document.addEventListener("dragstart", function ( e ) {
    e.dataTransfer.setData('text/plain', null);
    var rect = e.target.getBoundingClientRect();
    currently_dragged = e.target;
    
    if (currently_dragged.id.includes("svg_modal_link")) {
        //currently_dragged.innerHTML = svg_round_square("");
        var modal_id = currently_dragged.id.split("_")[3];
        var bdiv = document.getElementById("modal_link_"+modal_id+"_body");
    }
    drag_delta = [e.clientX - rect.left, e.clientY - rect.top];
}, false);


main_div.addEventListener("dragover", function( e ) {
    e.preventDefault();
}, false);


main_div.addEventListener("drop", function( e ) {
    e.preventDefault();
    
    //Operators
    if (currently_dragged.id.includes("static")) {
        var rect = main_div.getBoundingClientRect();
        create_operator_instance_on_hub(e.clientX - rect.left - drag_delta[0], 
                                        e.clientY - rect.top - drag_delta[1] + e.target.scrollTop, 
                                        currently_dragged.id.split("_").slice(-2)[0]);
    }
    
    
    //Link params
    else if (currently_dragged.id.includes("svg_modal_link") && e.target.parentElement.parentElement.id.includes("svg_modal_link")) {
        var param_out = currently_dragged;
        var param_in = e.target.parentElement.parentElement;
        
        //Make sure the two links are from two objects
        if (    (param_out.id.includes("_in_") && param_in.id.includes("_in_")) ||
                (param_out.id.includes("_out_") && param_in.id.includes("_out_")) ) {
            return ;
        }
        //Make sure out is from object out
        else if (param_out.id.includes("_in_") && param_out.id.includes("_in_")) {
            param_in = currently_dragged;
            param_out = e.target.parentElement.parentElement;
        }
        
        var tab1 = param_out.id.split("_");
        var out_id = parseInt(tab1[6]);
        var in_id = parseInt(param_in.id.split("_")[6]);
        
        var link = link_from_id('con_'+parseInt(tab1[4]));
        
        if (! link.params || (link.params.out_id != out_id && link.params.in_id != in_id)) {
            ws_request('create_link', [link.src, out_id, link.dst, in_id], {}, function (link_id_from_hub) {
                //local creation
                create_link_line(link, out_id, in_id);
                create_params(link, out_id, in_id, parseInt(link_id_from_hub));
                
                //changing svgs
                var div_out = document.getElementById(param_out.id)
                var div_in  = document.getElementById(param_in.id);
                div_in.innerHTML = svg_round_square_crossed("");
                div_out.innerHTML = svg_round_square_crossed("");
                
                currently_dragged = null;
                
                save_project();
            });
        }
        else {
            console.log("Already exists !!");
            currently_dragged = null;
        }
    }
    else {
        console.log("Unknown Drop !!!");
        currently_dragged = null;
    }
}, false);


$(window).bind('keypress', function(e){
    if ( $("#modal_op_selector").is(':visible') && (e.keyCode == 13 || e.which == 13))
        select_op_add_panel();
});


$('#sakura_operator_contextMenu').on("click", "a", function() {
    $('#sakura_operator_contextMenu').hide();
    remove_operator_instance(op_focus_id, true);
    jsPlumb.repaintEverything();
});

$('#sakura_link_contextMenu').on("click", "a", function() {
    $('#sakura_link_contextMenu').hide();
    remove_link(link_focus_id);
});


$('#sakura_main_div').on("click", function () {
    if (op_focus_id != null) {
        $('#sakura_operator_contextMenu').hide();
        op_focus_id = null;
    }
    else if (link_focus_id != null) {
        $('#sakura_link_contextMenu').hide();
        op_focus_id = null;
    }
});


function open_op_menu(e) {
    $('#sakura_operator_contextMenu').css({
      display: "block",
      left: e.clientX - e.layerX + 30,
      top: e.clientY - e.layerY + 30
    });
    op_focus_id = this.id;
    return false;
}


function open_op_modal() {
    var modal_name = "modal_"+this.id;
    fill_all(this.id);
    if ($('#'+modal_name+"_dialog").attr('class').includes("full_width")) {
        $('#'+modal_name+"_dialog").toggleClass("full_width");
        $('#'+modal_name+"_body").css("height", "100%");
        $('#'+modal_name+"_body").children().eq(1).css("height", "100%");
        current_nb_rows = max_rows;
    }
    $('#'+modal_name).modal();
}


function jsp_drag_stop(e) {
    var ot = document.getElementById("sakura_main_div");
    if (e.el.getBoundingClientRect().left < ot.getBoundingClientRect().left)
        e.el.style.left = 20 + "px";
    if (e.el.getBoundingClientRect().top < ot.getBoundingClientRect().top)
        e.el.style.top = 20 + "px";
        
    var ids = e.el.id.split("_");
    
    //GUI update
    if (ids[0] == 'op') {
        var index = instance_index_from_id(ids[2]);
        global_ops_inst[index].gui = { x: parseInt(e.el.style.left),
                                       y: parseInt(e.el.style.top) };
        save_project()
    }
    jsPlumb.repaintEverything();        //Very Important when dragging elements manually
}


