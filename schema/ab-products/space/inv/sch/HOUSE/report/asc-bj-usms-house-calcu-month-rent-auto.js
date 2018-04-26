
var ascBjUsmsZzfRentOffer=View.createController('ascBjUsmsZzfRentOffer', {
    year: 2013,
    month: 1,    
    afterViewLoad: function(){
       this.year = parseInt(AUSC_getCurrentYear());
       this.month = parseInt(AUSC_getCurrentMonth());
       this.ascBjUsmsRentOfferGrid_changeRec.buildPostFooterRows = addTotalRowNew;
       this.ascBjUsmsRentOfferGrid_allRec.buildPostFooterRows = addTotalRow;
    },
	afterInitialDataFetch: function(){
		this.ascBjUsmsZzfRentOfferConsole.setFieldValue("sc_zzfrent.year", this.year+"");
        this.ascBjUsmsZzfRentOfferConsole.setFieldValue("sc_zzfrent.month", this.month+"");
        /*
         * 进入页面默认加载当前月份的数据
         */
        this.refreshBaoPanGrid(this.year,this.month);
        var tabs = View.panels.get("baopanTabs");
        tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
        this.tabs_afterTabChange(null, "changeRecTab", "changeRecTab");
	},
	
	tabs_afterTabChange :function(tabPanel, selectedTabName, newTabName){
		var year = this.ascBjUsmsZzfRentOfferConsole.getFieldValue("sc_zzfrent.year");
		var month = this.ascBjUsmsZzfRentOfferConsole.getFieldValue("sc_zzfrent.month");
		
		if (selectedTabName == "changeRecTab"){
			if (this.ascBjUsmsRentOfferGrid_changeRec.rows.length == 0){
				this.refreshChgRecGrid(year, month);
			}
		}else{
			if (this.ascBjUsmsRentOfferGrid_allRec.rows.length == 0){
				this.refreshAllRecGrid(year, month);
				
			}
		}
	},
    ascBjUsmsZzfRentOfferConsole_onShow: function(){
		var year = this.ascBjUsmsZzfRentOfferConsole.getFieldValue("sc_zzfrent.year");
		var month = this.ascBjUsmsZzfRentOfferConsole.getFieldValue("sc_zzfrent.month");
        
		if (year == ''){
			alert("请输入年度!")
			return;
		}
		if (month == ''){
			alert("请输入月份!")
			return;
		}
		if (year > this.year)
		{
			alert("请检查输入的年度");
			return;
		}
		if ( year == this.year && month > this.month)
		{
			alert("请检查输入的月份,只能查看本月及以前月份的报盘数据");
			return;

		}
		
        var detailsDS = View.dataSources.get("ascBjUsmsZzfRentOfferDetailsDS");
        detailsDS.addParameter("year",year);
        detailsDS.addParameter("month",month);
        var records = detailsDS.getRecords();
        
        if (records.length == 0) {
			if ((this.year == year) && (this.month == month)) {
               //生成报盘数据
               this.createBaoPanData(year,month);
			   this.refreshBaoPanGrid(year,month);
			}else{
				View.alert("没有"+year+"年"+month+"月的报盘数据!");
				return;
			}
        }
        else {
            if ((this.year == year) && (this.month == month)) {
                var con = View.confirm(year + "年" + month + "月已经存报盘已经存在,是否重新生成?点击[否]直接查看!",function(button){
                    if (button == 'yes') {
                    	ascBjUsmsZzfRentOffer.createBaoPanData(year,month);
                    	ascBjUsmsZzfRentOffer.refreshBaoPanGrid(year,month);
                     }else {
                         //直接显示
                    	 ascBjUsmsZzfRentOffer.refreshBaoPanGrid(year,month);
                     }
                });
            }
            else {
                //直接显示
				this.refreshBaoPanGrid(year,month);
            }
        }
    },
    /**
     * 
     * @param {Object} restriction
     */
	refreshBaoPanGrid:function(year,month){
    	this.refreshAllRecGrid(year, month);
    	this.refreshChgRecGrid(year, month);
	},
	/**
	 * 
	 */
	refreshAllRecGrid:function(year,month){
        this.ascBjUsmsRentOfferGrid_allRec.addParameter("year",year);
    	this.ascBjUsmsRentOfferGrid_allRec.addParameter("month",month);
    	this.ascBjUsmsRentOfferGrid_allRec.addParameter("changeFilter","");
		this.ascBjUsmsRentOfferGrid_allRec.refresh();
    },
    /**
     * 
     */
    refreshChgRecGrid:function(year,month){
        this.ascBjUsmsRentOfferGrid_changeRec.addParameter("year",year);
		this.ascBjUsmsRentOfferGrid_changeRec.addParameter("month",month);
		var changeFilter = "and sc_zzfrent_details.month_rent != nvl(sc_zzfrent_details.actual_payoff,0)";
		this.ascBjUsmsRentOfferGrid_changeRec.addParameter("changeFilter",changeFilter);
		this.ascBjUsmsRentOfferGrid_changeRec.refresh();
    },
    
    createBaoPanData: function(year, month){
        var result;
        try {
            result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SchoolHandler-createBaoPanRpt',year+"",month+"");
        } 
        catch (e) {
			if (e.code == 'ruleFailed') {
               //View.showMessage(e.message);
            }
            else {
               Workflow.handleError(e);
           }
		   return;
        }
        
        if (result.code == 'executed') {
            View.alert("报盘表创建成功!");
        }
        else {
            Workflow.handleError(result);
        }
    },
    
    ascBjUsmsRentOfferGrid_changeRec_afterRefresh:function(){
    	this.updateRowNumberForRptBaopan(this.ascBjUsmsRentOfferGrid_changeRec);
    },
    
    ascBjUsmsRentOfferGrid_allRec_afterRefresh:function(){
		this.updateRowNumberForRptBaopan(this.ascBjUsmsRentOfferGrid_allRec);
    },
	
	/**
     * update the column of xu hao 
     */
    updateRowNumberForRptBaopan: function(panel){
		var rowNumber = 0;
		var rows = panel.rows;
		for (var i=0;i<rows.length;i++){
			var row =rows[i];
			rowNumber++;
			row['sc_zzfrent_details.row_number'] = ""+rowNumber;
		}
		panel.build();
     },
     
    ascBjUsmsZzfRentOfferConsole_onFixedReport: function(){
      var year = this.ascBjUsmsZzfRentOfferConsole.getFieldValue("sc_zzfrent.year");
      var month = this.ascBjUsmsZzfRentOfferConsole.getFieldValue("sc_zzfrent.month");
	  View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "sczzfRentBaoPan",
            parameters: {
                'aYear': year,
				'aMonth':month
            },
            closeButton: false
        });
    },
    onEditNote:function(row){
    	var grid =this.ascBjUsmsRentOfferGrid_changeRec;
    	var selecteRow = grid.rows[grid.selectedRowIndex];
    	var cardId = selecteRow['sc_zzfrent_details.card_id.key'];
    	var year = selecteRow['sc_zzfrent_details.year'];
    	var month = selecteRow['sc_zzfrent_details.month.key'];
    	var res={'sc_zzfrent_details.card_id':cardId,'sc_zzfrent_details.year':year,'sc_zzfrent_details.month':month};
    	this.editNote.showInWindow({width:500,height:400,closeButton:false });
    	this.editNote.refresh(res);
    	grid.refresh();
    }
})

function refreshPanel(){
	var grid = View.panels.get('ascBjUsmsRentOfferGrid_changeRec');
	grid.refresh();
}
/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRow(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	
	var totalMonthRent = 0.0;
	//var totalBuKouRent = 0.0;
	var totalActualRent = 0.0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		var monthRent = row['sc_zzfrent_details.month_rent'];
		if(row['sc_zzfrent_details.month_rent.raw']){
			monthRent = row['sc_zzfrent_details.month_rent.raw'];
		}
		if (!isNaN(parseFloat(monthRent))) {
			totalMonthRent += parseFloat(monthRent);
		}
		/*
		var buKouRent = row['sc_zzfrent_details.bukou_rent'];	
		if(row['sc_zzfrent_details.bukou_rent.raw']){
			buKouRent = row['sc_zzfrent_details.bukou_rent.raw'];
		}
		if (!isNaN(parseFloat(buKouRent))) {
			totalBuKouRent += parseFloat(buKouRent);
		}
		*/
		var actualRent = row['sc_zzfrent_details.actual_payoff'];	
		if(row['sc_zzfrent_details.actual_payoff.raw']){
			actualRent = row['sc_zzfrent_details.actual_payoff.raw'];
		}
		if (!isNaN(parseFloat(actualRent))) {
			totalActualRent += parseFloat(actualRent);
		}
    }
    totalMonthRent = totalMonthRent.toFixed(2);
    //totalBuKouRent = totalBuKouRent.toFixed(2);
    totalActualRent = totalActualRent.toFixed(2);;
	
	var ds = this.getDataSource();
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: empty	
    addColumn(gridRow, 1);
    // column 2: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	// column 3: empty	
    addColumn(gridRow, 1);
	// column 4: empty	
    addColumn(gridRow, 1);
    // column 5: empty	
    addColumn(gridRow, 1);
    addColumn(gridRow, 1);
    addColumn(gridRow, 1);
    addColumn(gridRow, 1);
    addColumn(gridRow, 1);

	// column 7: month_rent
    addColumn(gridRow, 1, ds.formatValue('sc_zzfrent_details.month_rent', totalMonthRent, true));
    // column 8: total area
    //addColumn(gridRow, 1, ds.formatValue('sc_zzfrent_details.bukou_rent', totalBuKouRent, true));
    // column 9: actual_payoff
    addColumn(gridRow, 1, ds.formatValue('sc_zzfrent_details.actual_payoff', totalActualRent, true));
    // column 10: note1
    addColumn(gridRow, 1);
}


function addTotalRowNew(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	
	var totalMonthRent = 0.0;
	//var totalBuKouRent = 0.0;
	var totalActualRent = 0.0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		var monthRent = row['sc_zzfrent_details.month_rent'];
		if(row['sc_zzfrent_details.month_rent.raw']){
			monthRent = row['sc_zzfrent_details.month_rent.raw'];
		}
		if (!isNaN(parseFloat(monthRent))) {
			totalMonthRent += parseFloat(monthRent);
		}
		/*
		var buKouRent = row['sc_zzfrent_details.bukou_rent'];	
		if(row['sc_zzfrent_details.bukou_rent.raw']){
			buKouRent = row['sc_zzfrent_details.bukou_rent.raw'];
		}
		if (!isNaN(parseFloat(buKouRent))) {
			totalBuKouRent += parseFloat(buKouRent);
		}
		*/
		var actualRent = row['sc_zzfrent_details.actual_payoff'];	
		if(row['sc_zzfrent_details.actual_payoff.raw']){
			actualRent = row['sc_zzfrent_details.actual_payoff.raw'];
		}
		if (!isNaN(parseFloat(actualRent))) {
			totalActualRent += parseFloat(actualRent);
		}
    }
    totalMonthRent = totalMonthRent.toFixed(2);
    //totalBuKouRent = totalBuKouRent.toFixed(2);
    totalActualRent = totalActualRent.toFixed(2);;
	
	var ds = this.getDataSource();
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: empty	
    addColumn(gridRow, 1);
    // column 2: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	// column 3: empty	
    addColumn(gridRow, 1);
	// column 4: empty	
    addColumn(gridRow, 1);
    // column 5: empty	
    addColumn(gridRow, 1);
    addColumn(gridRow, 1);
    addColumn(gridRow, 1);
    addColumn(gridRow, 1);
    addColumn(gridRow, 1);
    addColumn(gridRow, 1);
    addColumn(gridRow, 1);
    addColumn(gridRow, 1);
	// column 7: month_rent
    addColumn(gridRow, 1, ds.formatValue('sc_zzfrent_details.month_rent', totalMonthRent, true));
    // column 8: total area
    //addColumn(gridRow, 1, ds.formatValue('sc_zzfrent_details.bukou_rent', totalBuKouRent, true));
    // column 9: actual_payoff
    addColumn(gridRow, 1, ds.formatValue('sc_zzfrent_details.actual_payoff', totalActualRent, true));
    // column 10: note1
    addColumn(gridRow, 1);
}

/**
 * add column
 * @param {Object} gridRow
 * @param {int} count
 * @param {String} text
 */
function addColumn(gridRow, count, text){
    for (var i = 0; i < count; i++) {
        var gridCell = document.createElement('th');
        if (text) {
            gridCell.innerHTML = text;
            gridCell.style.textAlign = 'right';
            gridCell.style.color = 'blue';
        }
        gridRow.appendChild(gridCell);
    }
}