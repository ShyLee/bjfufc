/**
 * @author Kevenxi
 */
var byDvEmDingeAnaController = View.createController('byDvEmDingeAnaController', {

    dvId: "",
    restriction: new Ab.view.Restriction(),
    
    afterViewLoad: function(){
        this.ascBjUsmsDvEmGingEGrid.sortEnabled = false;
		this.ascDvDingeRenJunUseMianCrossRpt.addEventListener('afterGetData', this.ascDvDingeRenJunUseMianCrossRpt_afterGetData, this);
    },
	
    ascBjUsmsDvEmGingEGrid_afterRefresh: function(){
        var title = String.format(getMessage('secondGridTitle'), this.dvId);
        this.ascBjUsmsDvEmGingEGrid.setTitle(title);
        
        this.setOrder(this.ascBjUsmsDvEmGingEGrid);
    },
    
    setOrder: function(gridPanel){
        var rows = gridPanel.rows;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var dingeJB = row['sc_dinge_jibie.dingejibie_id'];
			
			var rowEl = Ext.get(row.row.dom).dom;
			rowEl.cells[6].innerHTML = this.getOrder(dingeJB);
        }
    },
	
	ascDvDingeRenJunUseMianCrossRpt_afterGetData:function(panel, dataSet){
		// change all column titles
        for (var c = 0; c < dataSet.columnValues.length; c++) {
			 
            //var columnTitle = dataSet.columnValues[c].l + ' CE';
		    //dataSet.columnValues[c].l = columnTitle;
			var columnTitle = dataSet.columnValues[c].l;
			if (columnTitle.toUpperCase() == 'UNDEFINED'){
				dataSet.columnValues[c].l = "未定义";
			}
        }

        // change all row titles
		/*
        for (var r = 0; r < dataSet.rowValues.length; r++) {
            var rowTitle = dataSet.rowValues[r].l;
			//alert(rowTitle);
            dataSet.rowValues[r].l = rowTitle;
        }
        */
        
        
	},
	
    getOrder: function(Dejb){
        var orderNum;
        
        this.restriction.clauses.length = 0;
        this.restriction.addClause("em.dingejibie_id", Dejb, "=");
        var records = View.dataSources.get("ds_asc-bj-usms-dp-em-dinge-rpt_order_em").getRecords(this.restriction);
        if (records.length > 0) {
            for (var j = 0; j < records.length; j++) {
                var record = records[j];
                var dvId = record.getValue("em.dv_id");
                if (this.dvId == dvId) {
                    orderNum = j + 1;
                    if (orderNum < 10) {
                        orderNum = "0" + orderNum;
                    }else{
						orderNum = "" + orderNum;
					}
                    break;
                }
            }
        }
		
		return orderNum;
    }
    
})

function onCrossTableClick(obj){
    var detailGrid = View.panels.get('ascBjUsmsDvEmGingEGrid');
    
    var restriction = obj.restriction;
    byDvEmDingeAnaController.dvId = restriction.clauses[0].value;
    detailGrid.addParameter('dvIdRes', restriction.clauses[0].value);
    
    detailGrid.refresh();
}

