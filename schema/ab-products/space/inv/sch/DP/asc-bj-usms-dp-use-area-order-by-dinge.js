/**
 * @author Kevenxi
 */
var byDvDingeUseAreaOrderController = View.createController('byDvDingeUseAreaOrderController', {

    dingEJBId: "",
    restriction: new Ab.view.Restriction(),
    
    afterViewLoad: function(){
        this.ascBjUsmsDvUseAreaOrderGrid.sortEnabled = false;
    },
    
    ascBjUsmsDvUseAreaOrderGrid_afterRefresh: function(){
        var title = String.format(getMessage('secondGridTitle'), this.dingEJBId);
        this.ascBjUsmsDvUseAreaOrderGrid.setTitle(title);
        
        this.setOrder(this.ascBjUsmsDvUseAreaOrderGrid);
    },
    
    setOrder: function(gridPanel){
        var rows = gridPanel.rows;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            
            var rowEl = Ext.get(row.row.dom).dom;
            var orderNum = i + 1;
            if (orderNum < 10) {
                orderNum = "0" + orderNum;
            }
            else {
                orderNum = "" + orderNum;
            }
            rowEl.cells[2].innerHTML = orderNum;
            //rowEl.cells[5].innerHTML = this.getOrder(this.dingEJBId);
        }
    },
    
    getOrder: function(Dejb){
        var orderNum;
        
        this.restriction.clauses.length = 0;
        this.restriction.addClause("em.dingejibie_id", Dejb, "=");
        var records = View.dataSources.get("ds_asc-bj-usms-dp-use-area-order-by-dinge_order_em").getRecords(this.restriction);
        if (records.length > 0) {
            for (var j = 0; j < records.length; j++) {
                var record = records[j];
                var dvId = record.getValue("em.dv_id");
                if (this.dvId == dvId) {
                    orderNum = j + 1;
                    if (orderNum < 10) {
                        orderNum = "0" + orderNum;
                    }
                    else {
                        orderNum = "" + orderNum;
                    }
                    break;
                }
            }
        }
        
        return orderNum;
    }
    
})

function onRefreshBottomReport(){
    var deListPanel = View.panels.get("ascBjUsmsDingEGrid");
    byDvDingeUseAreaOrderController.dingEJBId = deListPanel.rows[deListPanel.selectedRowIndex]["sc_dinge_jibie.dingejibie_id"];
    var dvOrderPanel = View.panels.get("ascBjUsmsDvUseAreaOrderGrid");
    dvOrderPanel.addParameter("dejbIdRes", byDvDingeUseAreaOrderController.dingEJBId);
    dvOrderPanel.refresh();
}

