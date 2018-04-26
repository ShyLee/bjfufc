var abBjBizHouseRmListController =  View.createController('abBjBizHouseRmListController', {
	
	afterInitialDataFetch:function(){
		var sql = " rm.rm_type in ('30601','30602','30603','30604','30605','30606') ";
		this.bizHouseRmGrid.addParameter('isKZF',sql);
    	this.bizHouseRmGrid.refresh();
	},
	bizHouseRmGrid_onIsKZF:function(){
		var sql = " rm.rm_type in ('30601','30602','30603','30604','30605','30606') and rm.yzlzys = 0 ";
		this.bizHouseRmGrid.addParameter('isKZF',sql);
    	this.bizHouseRmGrid.refresh();
	},
	bizHouseRmGrid_onIsWMF:function(){
		var sql = " rm.rm_type in ('30601','30602','30603','30604','30605','30606') and rm.yzlzys > 0 and rm.yzlzys < rm.kzlzys ";
		this.bizHouseRmGrid.addParameter('isKZF',sql);
    	this.bizHouseRmGrid.refresh();
	},
	bizHouseRmGrid_onAll:function(){
		var sql = " rm.rm_type in ('30601','30602','30603','30604','30605','30606') ";
		this.bizHouseRmGrid.addParameter('isKZF',sql);
    	this.bizHouseRmGrid.refresh();
	}
	
	
});