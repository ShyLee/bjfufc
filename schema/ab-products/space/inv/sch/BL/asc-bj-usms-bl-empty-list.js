/**
 * @author Keven.xi
 */
var abScVwVacantAreabyBl = View.createController('abScVwVacantAreabyBlController', {
	
	blId:"",
	
	afterViewLoad: function(){
		this.abScVwVacantAreaRptPanel.buildPostFooterRows = addTotalRow;
	},
	/**
	 * show the employees in the selected room 
	 * @param {Object} row
	 */
    abScVwVacantAreaConsolePanel_onShow: function(){
		var restriction = this.getRestriction();
		if (this.blId){
			this.abScVwVacantAreaRptPanel.addParameter("blIdRes","rm.bl_id='"+this.blId+"'");
		}else{
			this.abScVwVacantAreaRptPanel.addParameter("blIdRes","1=1");
		}
		
		this.abScVwVacantAreaRptPanel.refresh(restriction);
    },
	
	abScVwVacantAreaConsolePanel_onClear:function(){
		this.abScVwVacantAreaConsolePanel.clear();
		$('rmType').selectedIndex = 0;
	},
	/**
	 * set panel title
	 */
	abScVwVacantAreaRptPanel_afterRefresh:function(){
		var title = String.format(getMessage('rptPanelTitle'), this.blId);
		this.abScVwVacantAreaRptPanel.setTitle(title);
	},
	
	/**
	 * get console and tree restriction
	 */
	getRestriction:function(){
		var restriction = new Ab.view.Restriction;
		var dvId = this.abScVwVacantAreaConsolePanel.getFieldValue("rm.dv_id");
		var rmType = $('rmType').value;
		var rmTypeIndex = $('rmType').selectedIndex;
		/*
	     * 注意房间的使用单位有三种情况 1 正常的使用单位 2 未分配 3 空值（不确定） 第三种情况不能再报表中显示或查询出来
	     * 
	     * A用户没有输入使用单位和查询类型  表示 搜索  房屋类型为未定义 或者 (房屋类型为办公室或教师办公室)且现有人数为0  
	     * B用户输入使用单位但没输入查询类型 表示 搜索已分配使用单位且房屋类型为未定义 或者 已分配使用单位且(房屋类型为办公室或教师办公室)且现有人数为0
	     * C用户输入使用单位且输入查询类型 表示已分配使用单位且房屋类型为指定类型且现有人数为0
	     * D用户没有输入使用单位但输入查询类型 表示 搜索  房屋类型为指定类型且现有人数为0
		 */
		if (rmTypeIndex != 0){
			if (dvId == "") { //D
				if (rmTypeIndex == 1){
					restriction.addClause("rm.rm_type",'办公室','=','AND');
				}
				if (rmTypeIndex == 2){
					restriction.addClause("rm.rm_type",'教师办公室','=','AND');
				}
				restriction.addClause("rm.count_em", 0, '=', 'AND');
				
			}else{// C
				restriction.addClause("rm.dv_id",dvId+'%','LIKE','AND');
				if (rmTypeIndex == 1){
					restriction.addClause("rm.rm_type",'办公室','=','AND');
				}
				if (rmTypeIndex == 2){
					restriction.addClause("rm.rm_type",'教师办公室','=','AND');
				}
				restriction.addClause("rm.count_em", 0, '=', 'AND');
				
			}
			
			//var sql = " AND rm.cap_em - rm.count_em > 0";
			//this.abScVwVacantAreaRptPanel.addParameter("capcountRes",sql);
		}else{
			if (dvId == "") {//A
				restriction.addClause("rm.rm_type",'未定义%','LIKE','AND');
				
				restriction.addClause("rm.rm_type",'办公室','=',')OR((');
		        restriction.addClause("rm.rm_type", '教师办公室', '=', 'OR');
				restriction.addClause("rm.count_em", 0, '=', ')AND');
			}else{ //B
				restriction.addClause("rm.dv_id",dvId+'%','LIKE');
				restriction.addClause("rm.rm_type",'未定义%','LIKE','AND');
				restriction.addClause("rm.dv_id",dvId+'%','LIKE',')OR((');
				
				restriction.addClause("rm.rm_type", '办公室', '=', ')AND(');
		        restriction.addClause("rm.rm_type", '教师办公室', '=', 'OR');
				restriction.addClause("rm.count_em", 0, '=', ')AND');
			}
			
			//var sql = " AND rm.cap_em - rm.count_em > 0";
			//this.abScVwVacantAreaRptPanel.addParameter("capcountRes",sql);
			
		}
		return restriction;
		
	}
    
    
});

function onSiteTreeClick(ob){
	abScVwVacantAreabyBl.blId = "";
}
/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onBlTreeClick(ob){
    var currentNode = View.panels.get('abScVwVacantArea_SiteTree').lastNodeClicked;
	var siteName = currentNode.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScVwVacantArea_SiteTree', title);
	
    var blId = currentNode.data['bl.bl_id'];
	
	abScVwVacantAreabyBl.blId = blId;
	var restriction= abScVwVacantAreabyBl.getRestriction();
    
    var facultySumGrid = View.panels.get('abScVwVacantAreaRptPanel');
	
	facultySumGrid.addParameter("blIdRes","rm.bl_id='"+blId+"'");
    facultySumGrid.refresh(restriction);
}


function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScVwVacantArea_SiteTree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var siteCode = treeNode.data['site.site_id'];
        if (!siteCode) {
            labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + getMessage("noSite") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var buildingId = treeNode.data['bl.bl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
	
	 
}

/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRow(parentElement){
    if (this.rows.length < 2 || this.rows.length > 100) {
        return;
    }
	var totalCount = this.rows.length;
	var totalArea = 0.0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		var fntstdPriceValue = row['rm.area'];	
		if(row['rm.area.raw']){
			fntstdPriceValue = row['rm.area.raw'];
		}
		if (!isNaN(parseFloat(fntstdPriceValue))) {
			totalArea += parseFloat(fntstdPriceValue);
		}
    }
	totalArea = totalArea.toFixed(2);
	
	var ds = this.getDataSource();
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: empty	
    addColumn(gridRow, 1,getMessage('total'));
    // column 2: 
    addColumn(gridRow, 1, ds.formatValue('rm.bl_id', totalCount, true));
    // column 3: 
    addColumn(gridRow, 1, ds.formatValue('rm.area', totalArea, true));
	// column 1: empty	
    addColumn(gridRow, 1);
	// column 1: empty	
    addColumn(gridRow, 1);
	// column 1: empty	
    addColumn(gridRow, 1);
	// column 1: empty	
    addColumn(gridRow, 1);
	// column 1: empty	
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

