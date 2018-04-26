var abDataBlMngtChgController = View.createController('abDataBlMngtChgController',{
	openerController:null,
	blId:"",
	blName:"",
	area:"",
	value:"",
	flag:"",//传递一个标记值，如果是change， dialog为变更框，如果为history，dialog显示变更历史列表
	afterInitialDataFetch: function(){
		this.blId  = this.view.parameters['bl_id'];
		this.blName = this.view.parameters['bl_name'];
		this.area = this.view.parameters['area'];
		this.value = this.view.parameters['value'];
		if(this.blId!=null && this.blId!=""){
			var res = new Ab.view.Restriction();
			this.historyGrid.setTitle(getMessage('blName') + this.blName);
			res.addClause('sc_bl_value_chg.bl_id',this.blId,'=');
			this.historyGrid.refresh(res);
			
		}else{
			this.historyGrid.setTitle("查看所有变更历史");
		}
		
	},
	accordDateConsole_onShow:function(){
    	var from_date = this.accordDateConsole.getFieldValue('date_from');
        var to_date = this.accordDateConsole.getFieldValue('date_to');
        if(Date.parse(from_date.replace(/-/g,"/"))>Date.parse(to_date.replace(/-/g,"/"))){
      	  View.showMessage("截止时间不能小于起始时间！");
      	  return false;
        }

    }
});