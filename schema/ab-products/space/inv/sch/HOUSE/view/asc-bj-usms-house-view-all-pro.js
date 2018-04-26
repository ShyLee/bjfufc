var protocolViewController = View.createController("protocolViewController", {

    zzf_console_onShow: function(){
        var dateBegin = this.zzf_console.getFieldValue('date_from');
        var dateEnd = this.zzf_console.getFieldValue('date_to');
        var restriction = new Ab.view.Restriction();
        if (Date.parse(dateBegin.replace(/-/g, "/")) > Date.parse(dateEnd.replace(/-/g, "/"))) {
            View.showMessage("截止时间不能小于起始时间！");
            return false;
        }
        if (dateBegin != '') {
            restriction.addClause('sc_zzfcard.date_checkin', dateBegin, '&gt;=');
        }
        if (dateEnd != '') {
            restriction.addClause('sc_zzfcard.date_checkin', dateEnd, '&lt;=');
        }
        this.zzf_protocol_list.refresh(restriction);
    },
    zzf_protocol_list_details_onClick: function(row){
        var cardId = row.record['sc_zzfcard.card_id'];
        var res = new Ab.view.Restriction();
        res.addClause('sc_zzfcard.card_id', cardId, '=');
        
        this.zzf_protocol_details.refresh(res);
        this.zzf_protocol_details.showInWindow({
            x: 300,
            y: 300,
            width: 800,
            height: 400,
            closeButton: false
        })
    },
});
