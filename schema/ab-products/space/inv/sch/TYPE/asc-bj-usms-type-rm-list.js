/**
 * @author Keven.xi
 */
var abScRptRmbySumRmtypeRmcat = View.createController('abScRptRmbySumRmtypeRmcatController', {
	
	rm_cat:"",
	rm_type:"",
	
	afterViewLoad: function(){
		this.abScRptRmbySumRmtypeRmcat_rmcatSumGrid.buildPostFooterRows = addTotalRowForCat;
		this.abScRptRmbySumRmtypeRmcat_rmcatSumGrid.sortEnabled = false;
		
		//var height = this.getRegionPanelHeight("abScRptRmbySumRmtypeRmcat_rmGrid");
		//this.abScRptRmbySumRmtypeRmcat_rmGrid.panelHeight = height;
	},
	/**
	 * 
	 */
	abScRptRmbySumRmtypeRmcat_rmtypeSumGrid_afterRefresh:function(){
		var title = String.format(getMessage('secondPanelTitle'),this.rm_cat );
		this.abScRptRmbySumRmtypeRmcat_rmtypeSumGrid.setTitle(title);
		
		this.rm_type = "";
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rm.rm_type","-1","=");
		this.abScRptRmbySumRmtypeRmcat_rmGrid.refresh(restriction);
	},
	
	abScRptRmbySumRmtypeRmcat_rmGrid_afterRefresh:function(){
		var title = String.format(getMessage('bottomPanelTitle'),this.rm_type );
		this.abScRptRmbySumRmtypeRmcat_rmGrid.setTitle(title);
	},
	
	getRegionPanelHeight:function(panelId){
		var height  = 0;
		var gridPanel = View.panels.get(panelId);
		var layoutManager = View.getLayoutManager(gridPanel.layout);
		
		var regionPanel = layoutManager.getRegionEl(gridPanel.region);
		height = regionPanel.dom.style.height;
		if (!height){
			height = 200+regionPanel.defaultUnit;
		}
		return height;
	}
	
    
});


function onRefreshSecondReport(){
	var rmcatPanel = View.panels.get("abScRptRmbySumRmtypeRmcat_rmcatSumGrid");
	abScRptRmbySumRmtypeRmcat.rm_cat = rmcatPanel.rows[rmcatPanel.selectedRowIndex]["rmcat.rm_cat"];
	var rmtypePanel = View.panels.get("abScRptRmbySumRmtypeRmcat_rmtypeSumGrid");
	rmtypePanel.addParameter("rmcatRes",abScRptRmbySumRmtypeRmcat.rm_cat);
	rmtypePanel.refresh();
}

function onRefreshBottomReport(){
	var rmPanel = View.panels.get("abScRptRmbySumRmtypeRmcat_rmGrid");
	var rmtypePanel = View.panels.get("abScRptRmbySumRmtypeRmcat_rmtypeSumGrid");
	abScRptRmbySumRmtypeRmcat.rm_type = rmtypePanel.rows[rmtypePanel.selectedRowIndex]["rmtype.rm_type"];
	
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rm.rm_cat",abScRptRmbySumRmtypeRmcat.rm_cat,"=");
	restriction.addClause("rm.rm_type",abScRptRmbySumRmtypeRmcat.rm_type,"=");
	rmPanel.refresh(restriction);
	
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
        
		var fntstdCountValue = row['rmcat.area'];
		if(row['rmcat.area.raw']){
			fntstdCountValue = row['rmcat.area.raw'];
		}
		if (!isNaN(parseInt(fntstdCountValue))) {
			totalAreaShiyong += parseFloat(fntstdCountValue);
		}
		
		var fntstdPriceValue = row['rmcat.area_jianzhu'];	
		if(row['rmcat.area_jianzhu.raw']){
			fntstdPriceValue = row['rmcat.area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(fntstdPriceValue))) {
			totalAreaJianZhu += parseFloat(fntstdPriceValue);
		}
		
    }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalAreaJianZhu = totalAreaJianZhu.toFixed(2);
	
	totalProportion = calPercentAreaJianzhu(this,totalAreaJianZhu);
	totalProportion  = totalProportion.toFixed(2);
	
	var ds = this.getDataSource();
	
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	// column 2: empty	
    addColumn(gridRow, 1);
	// column 3: empty	
    addColumn(gridRow, 1);
	// column 4: total area
    addColumn(gridRow, 1, ds.formatValue('rmcat.area', totalAreaShiyong, true));
    // column 5: total area of Structure
    addColumn(gridRow, 1, ds.formatValue('rmcat.area_jianzhu', totalAreaJianZhu, true));
	// column 6: total proportion
    addColumn(gridRow, 1, ds.formatValue('rmcat.percent_area', totalProportion, true));
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
		
		var rmcatAreaJianzhuValue = row['rmcat.area_jianzhu'];	
		if(row['rmcat.area_jianzhu.raw']){
			rmcatAreaJianzhuValue = row['rmcat.area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(rmcatAreaJianzhuValue)) && (!isNaN(parseFloat(totleArea)))) {
			if (parseFloat(totleArea) != 0){
				rmcatProportion = parseFloat(rmcatAreaJianzhuValue)*100.0/parseFloat(totleArea);
			}
		}
		var rowEl = Ext.get(row.row.dom).dom;
		rowEl.cells[5].innerHTML = rmcatProportion.toFixed(2)+'%';
		
		totalProportion += parseFloat(rmcatProportion);
    }
	
	return totalProportion;
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
