var protocolViewController = View.createController("protocolViewController", {

    zzf_console_onShow: function(){
        var dv_id = this.zzf_console.getFieldValue('sc_zzfcard.dv_name');
        var is_em = this.zzf_console.getFieldValue('sc_zzfcard.is_em');
        var bl_id = this.zzf_console.getFieldValue('sc_zzfcard.bl_id');
        
        var restriction = new Ab.view.Restriction();
        
        if (dv_id != '') {
        	var array = dv_id.split("^");
            restriction.addClause('sc_zzfcard.dv_name', array, 'in');
        }
        if (is_em != '') {
            restriction.addClause('sc_zzfcard.is_em', is_em, '=');
        }
        if (bl_id != '') {
        	var array = bl_id.split("^");
            restriction.addClause('sc_zzfcard.bl_id', array, 'in');
        }
        
        this.zzf_protocol_list.refresh(restriction);
    },
    zzf_protocol_list_details_onClick: function(row){
        var card_id = row.record['sc_zzfcard.card_id'];
        
        View.openDialog("asc-bj-usms-house-view-all-pro-detail-dialog.axvw", null, false,{
			  title:'详细信息',
			  width:1000,
			  height:800,
			  cardId:card_id,
			  closeButton: false});
    },
    zzf_console_onClear: function(){
    	this.zzf_console.clear();
    	this.zzf_protocol_list.refreshClearAllFilters();
    }
});
