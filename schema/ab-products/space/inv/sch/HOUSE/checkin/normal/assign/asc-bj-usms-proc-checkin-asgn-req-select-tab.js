var ascbjApproveController = View.createController("ascbjApproveController", {
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.apply_grid.refresh();
    },
    
    filter_form_onShow: function(){
        var dateBegin = this.filter_form.getFieldValue('date_from');
        var dateEnd = this.filter_form.getFieldValue('date_to');
        var restriction = new Ab.view.Restriction();
        if (Date.parse(dateBegin.replace(/-/g, "/")) > Date.parse(dateEnd.replace(/-/g, "/"))) {
            View.showMessage("截止时间不能小于起始时间！");
            return false;
        }
        if (dateBegin != '') {
            restriction.addClause('activity_log.date_requested', dateBegin, '&gt;=');
        }
        if (dateEnd != '') {
            restriction.addClause('activity_log.date_requested', dateEnd, '&lt;=');
        }
        this.apply_grid.refresh(restriction);
    }
});

function selectNextTab(){
    //当点击select按钮时候  获得当前选择的
    var grid = View.panels.get('apply_grid');
    var index = grid.selectedRowIndex;
    var record = grid.gridRows.get(index).getRecord();
    var tabs = ascbjApproveController.tabs;
    tabs.cardId = record.getValue('sc_zzfcard.card_id');
    var nextTabName = 'yuangongTab';
    var nextTab = tabs.findTab(nextTabName);
    tabs.selectTab(nextTabName);
    nextTab.loadView();
    nextTab.show(true);
}
