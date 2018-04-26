
var abBjUsmsZZFSelectRmDialogController = View.createController('abBjUsmsZZFSelectRmDialogController',{
	openerController:null,
	rentStd:null,//租金标准
	typeCouldChange:true,//租金标准是否可以改变
	selectXYRmGrid_afterRefresh: function(){
		this.selectXYRmGrid.enableSelectAll(false);
	},
	selectXYRmGrid_onAdd: function(){
		var selectedRows = this.selectXYRmGrid.getSelectedRows();
		if(selectedRows.length == 0){
			alert("请选择协议房");
			return;
		}
		this.openerController.aprotocalRmRecords = selectedRows;
		this.openerController.rentStd = this.rentStd;
		this.openerController.showSelectedProtocalRm(selectedRows);
		View.closeThisDialog();
	},
	selectXYRmGrid_onReturn: function(){
		View.closeThisDialog();
	},
	/**
	 * 只能同时选择一种租金标准的房间
	 * */
	selectXYRmGrid_multipleSelectionColumn_onClick: function(row){
		if(this.rentStd != null){
			if(this.rentStd != row.getFieldValue('bl.rent_std')){
				row.select(false);
				alert("不能同时选择两种租金标准的房间");
			}
		}else{
			this.rentStd = row.getFieldValue('bl.rent_std');
		}
		if(this.typeCouldChange){
			var selectedRows = this.selectXYRmGrid.getSelectedRows();
			if(selectedRows.length == 0){
				this.rentStd = null;
			}
		}
		
	}
});