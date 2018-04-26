var buId = null;
var abScSearchEmRmByDvController = View.createController("abScSearchEmRmByDvController", {
	
	afterViewLoad: function(){
		this.abScSearchEmRmByDvGrid.buildPostFooterRows = addTotalRowForCat;
		this.abScSearchEmRmByDvGrid.sortEnabled = false;
	},
	
    abScSearchEmRmByDvCrossTable_afterRefresh: function(){
        this.abScSearchEmRmByDvGridReportShow.show(false);
		commonSetTitle("abScSearchEmRmByDvGrid","abScSearchEmRmByDvCrossTable","bu.bu_id","danwei");
    },
	
	abScSearchEmRmByDvGridReportShow_afterRefresh:function(){
		addPercentageTag(this.abScSearchEmRmByDvGridReportShow,"em.chaoemianjibi",12);
	},
	
    abScSearchEmRmByDvGridReportShow_name_onClick: function(row){
		View.openDialog('asc-bj-usms-dp-em-info.axvw', null, false, {
            closeButton: false,
			emRecord:row.record
        });
    }
});

function onBarChartClick(obj){ 
    var grid = View.panels.get('abScSearchEmRmByDvGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    buId = selectedRow["bu.bu_id"];
    var detailPanel = View.panels.get('abScSearchEmRmByDvCrossTable');
    if (buId) {
        detailPanel.addParameter('buId', "='" + buId + "'");
    }
    else {
        detailPanel.addParameter('buId', " is not null ");
    }
	detailPanel.addParameter('changjiangxuezhe', "长江学者");
	detailPanel.addParameter('zhenggao', "正高");
	detailPanel.addParameter('fugao', "副高");
	detailPanel.addParameter('zhongji', "中级以下");
	detailPanel.addParameter('chuji', "初级");
	detailPanel.addParameter('waiji', "外籍");
    detailPanel.refresh();
}

function onBarClick(obj){
	var grid = View.panels.get('abScSearchEmRmByDvCrossTable');
    var selectedRow = grid.rows[grid.selectedRowIndex];
	var dvid1 = selectedRow["dv.dv_id"];
    var detailPanel = View.panels.get('abScSearchEmRmByDvGridReportShow');
    var restriction = new Ab.view.Restriction();
    if (dvid1) {
        restriction.addClause('rm.dv_id', dvid1, '=');
        detailPanel.refresh(restriction);
		detailPanel.setTitle(getMessage('yuanxi')+dvid1);
        restriction.removeClause('rm.dv_id');
    }
    else {
        if (buId) {
            detailPanel.addParameter('bId', "='" + buId + "'");
        }
        detailPanel.refresh();
		detailPanel.setTitle(getMessage('yuanxi'));
    }
    detailPanel.show(true);
}

function onEmployClick(){
    View.openDialog('asc-bj-usms-dp-em-info.axvw');
}
/**
* add total row if there are more lines
* @param {Object} parentElement
*/
function addTotalRowForCat(parentElement){
   if (this.rows.length < 2) {
       return;
   }
	
	var totalAreaShiyong = 0.0;
	var totalAreaJianZhu = 0.0;
	var totalProportion = 0.0;
   for (var i = 0; i < this.rows.length; i++) {
       var row = this.rows[i];
       
		var fntstdCountValue = row['bu.area_rm'];
		if(row['bu.area_rm.raw']){
			fntstdCountValue = row['bu.area_rm.raw'];
		}
		if (!isNaN(parseInt(fntstdCountValue))) {
			totalAreaShiyong += parseFloat(fntstdCountValue);
		}
		
		var fntstdPriceValue = row['bu.area_jianzhu'];	
		if(row['bu.area_jianzhu.raw']){
			fntstdPriceValue = row['bu.area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(fntstdPriceValue))) {
			totalAreaJianZhu += parseFloat(fntstdPriceValue);
		}
		
   }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalAreaJianZhu = totalAreaJianZhu.toFixed(2);
	
	totalProportion = calPercentAreaJianzhu(this,totalAreaJianZhu);
	totalProportion = totalProportion.toFixed(2)+'%';
	
	var ds = this.getDataSource();
	
	
   // create new grid row and cells containing statistics
   var gridRow = document.createElement('tr');
   parentElement.appendChild(gridRow);
   // column 1: 'Total' title
   addColumn(gridRow, 1, getMessage('total'));
	// column 2: total area
   addColumn(gridRow, 1, ds.formatValue('bu.area_rm', totalAreaShiyong, true));
   // column 3: total area of Structure
   addColumn(gridRow, 1, ds.formatValue('bu.area_jianzhu', totalAreaJianZhu, true));
	// column 4: total proportion
   addColumn(gridRow, 1, ds.formatValue('bu.mianjibi', totalProportion, true));
}

/**
* Calculate the percent of the jianzhu area of per rmcat
* @param {Object} panel
* @param {Object} totleArea
*/
function calPercentAreaJianzhu(panel,totleArea){
	
	var totalProportion = 0.0;
	
	for (var i = 0; i < panel.rows.length; i++) {
       var row = panel.rows[i];
       var rmcatProportion = 0.0;
		
		var rmcatAreaJianzhuValue = row['bu.area_jianzhu'];	
		if(row['bu.area_jianzhu.raw']){
			rmcatAreaJianzhuValue = row['bu.area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(rmcatAreaJianzhuValue)) && (!isNaN(parseFloat(totleArea)))) {
			if (parseFloat(totleArea) != 0){
				rmcatProportion = parseFloat(rmcatAreaJianzhuValue)*100.0/parseFloat(totleArea);
			}
		}
		var rowEl = Ext.get(row.row.dom).dom;
		rowEl.cells[3].innerHTML = rmcatProportion.toFixed(2)+'%';
		
		
		totalProportion += parseFloat(rmcatProportion);
   }
	
	return totalProportion;
}

