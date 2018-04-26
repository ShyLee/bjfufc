/**
 * @author Keven.xi
 */
var abScRptRmbyBlRmcat = View.createController('abScRptRmbyBlRmcatController', {
	
	rm_cat:"",
	bl_id:"",
	blName:"",
	
	afterViewLoad: function(){
		this.abScRptRmbyBlRmcat_rmcatSumGrid.buildPostFooterRows = addTotalRow;
		this.abScRptRmbyBlRmcat_rmcatSumGrid.sortEnabled = false;
	},
	
	/**
	 * 
	 */
	abScRptRmbyBlRmcat_blSumGrid_afterRefresh:function(){
		var title = String.format(getMessage('secondPanelTitle'),this.rm_cat );
		this.abScRptRmbyBlRmcat_blSumGrid.setTitle(title);
		
		this.rm_type = "";
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rm.rm_type","-1","=");
		this.abScRptRmbyBlRmcat_rmGrid.refresh(restriction);
		
	},
	
	abScRptRmbyBlRmcat_rmGrid_afterRefresh:function(){
		var title = String.format(getMessage('bottomPanelTitle'),this.blName);
		this.abScRptRmbyBlRmcat_rmGrid.setTitle(title);
	}
	
});


function onRefreshSecondReport(){
	var rmcatPanel = View.panels.get("abScRptRmbyBlRmcat_rmcatSumGrid");
	abScRptRmbyBlRmcat.rm_cat = rmcatPanel.rows[rmcatPanel.selectedRowIndex]["rmcat.rm_cat"];
	var blPanel = View.panels.get("abScRptRmbyBlRmcat_blSumGrid");
	blPanel.addParameter("rmcatRes",abScRptRmbyBlRmcat.rm_cat);
	blPanel.refresh();
}

function onRefreshBottomReport(){
	var rmPanel = View.panels.get("abScRptRmbyBlRmcat_rmGrid");
	var blPanel = View.panels.get("abScRptRmbyBlRmcat_blSumGrid");
	abScRptRmbyBlRmcat.bl_id = blPanel.rows[blPanel.selectedRowIndex]["bl.bl_id"];
	abScRptRmbyBlRmcat.blName= blPanel.rows[blPanel.selectedRowIndex]["bl.name"];
	
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rm.rm_cat",abScRptRmbyBlRmcat.rm_cat,"=");
	restriction.addClause("rm.bl_id",abScRptRmbyBlRmcat.bl_id,"=");
	rmPanel.refresh(restriction);
	
}

/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRow(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	var totalAreaShiyong = 0.0;
	var totalAreaJianZhu = 0.0;
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
	
	calPercentAreaJianzhu(this,totalAreaJianZhu);
	
	var ds = this.getDataSource();
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: empty	
    addColumn(gridRow, 1);
    // column 2: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
    // column 3: total area
    addColumn(gridRow, 1, ds.formatValue('rmcat.area', totalAreaShiyong, true));
    // column 4: total area of Structure
    addColumn(gridRow, 1, ds.formatValue('rmcat.area_jianzhu', totalAreaJianZhu, true));
}

/**
 * Calculate the percent of the jianzhu area of per rmcat
 * @param {Object} panel
 * @param {Object} totleArea
 */
function calPercentAreaJianzhu(panel,totleArea){
	
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
		rowEl.cells[4].innerHTML = rmcatProportion.toFixed(2)+'%';
    }
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