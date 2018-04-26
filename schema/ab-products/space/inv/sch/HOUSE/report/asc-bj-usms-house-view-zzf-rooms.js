
var viewZZFroomsControllor = View.createController('viewZZFroomsControllor', {  
  
  afterViewLoad: function(){
	  this.sc_zzfrent_details_Grid_Finance.show(false);
	  this.sc_zzfrent_details_Grid_House.show(false);
  },
  zzfRoomPanel_afterRefresh:function(){
	  jQuery("#zzfRoomPanel_filterColumn_rm\\.ruzhu_status option").each(function(){
		  
		  if(jQuery(this).val()!=0 && jQuery(this).val()!=1 && jQuery(this).val()!='' ){
			  jQuery(this).remove();
		  }
		  
	  });
	  
  },
  onClickShowDetail: function(){
	  
	  var row = this.zzfRoomPanel.rows[this.zzfRoomPanel.selectedRowIndex];
	  
	  var ruzhu_status = row["rm.ruzhu_status"];
	  if(ruzhu_status == '已入住'){
		  var bl_id = row["rm.bl_id"];
		  var fl_id = row["rm.fl_id"];
		  var rm_id = row["rm.rm_id"];
		  
		  var restriction = new Ab.view.Restriction();
	 	  restriction.addClause('sc_zzfcard.bl_id', bl_id, '=');
	 	  restriction.addClause('sc_zzfcard.fl_id', fl_id, '=');
	 	  restriction.addClause('sc_zzfcard.rm_id', rm_id, '=');
	 	  restriction.addClause('sc_zzfcard.card_status', "1", '=');
	 	  
	 	  var record = this.sc_zzfcard_dataSource.getRecord(restriction);
	 	  if (record){
	 		var card_id = record.getValue('sc_zzfcard.card_id');
	 		var pay_ment = record.getValue('sc_zzfcard.payment_to');
	 		
	 		 var res = new Ab.view.Restriction();
	 		res.addClause('sc_zzfrent_details.card_id', card_id, '=');
		     if(pay_ment == 'finance'){
		    	this.sc_zzfrent_details_Grid_Finance.refresh(res);
		    	this.sc_zzfrent_details_Grid_Finance.show(true);
		    	this.sc_zzfrent_details_Grid_Finance.showInWindow({
		    		 x: 100,
		    		 y: 100,
		    		 width: 800,
		             height: 600,
		             title:'财务处代扣记录:房间号[' + rm_id + ']'
		    	});
		     }else if(pay_ment == 'house'){
		    	this.sc_zzfrent_details_Grid_House.refresh(res);
		    	this.sc_zzfrent_details_Grid_House.show(true);
		    	this.sc_zzfrent_details_Grid_House.showInWindow({
		    		 x: 100,
		    		 y: 100,
		    		 width: 800,
		             height: 600,
		             title:'自主缴费交费记录:房间号[' + rm_id + ']'
		    	});
		     }
	 	  }
		  
	  }else if(ruzhu_status == '空置'){
		  View.showMessage("当前房屋空置，没有有效的交费记录!");
	  }
	   
  }

});


