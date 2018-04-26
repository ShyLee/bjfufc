var undergroundfacilityControlller = View.createController('undergroundfacilityControlller', {

    ts_relic_safe_console_onShow: function(){
        var bl_id = this.ts_relic_safe_console.getFieldValue("rm.bl_id");
        var rm_cat = this.ts_relic_safe_console.getFieldValue("rm.rm_cat");
        var rm_type = this.ts_relic_safe_console.getFieldValue("rm.rm_type");
        var restriction = new Ab.view.Restriction();
        if (bl_id != "") {
            restriction.addClause('rm.bl_id', bl_id, 'like');
        }
        if (rm_cat != "") 
            restriction.addClause('rm.rm_cat', rm_cat, 'like');
        if (rm_type != "") 
            restriction.addClause('rm.rm_type', rm_type, 'like');
        this.ts_relic_safe_form.refresh(restriction);
    }
    
    
});
