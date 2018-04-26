var abPaymentController = View.createController('abPaymentController', {  
	blName:null,
	propName:null,
  
  afterInitialDataFetch: function(){
	 document.getElementById("idd1").innerHTML="<font size='2'>大于30天</font>";
	 document.getElementById("idd2").innerHTML="<font size='2'>10到30天</font>";
	 document.getElementById("idd3").innerHTML="<font size='2'>10天内</font>";
	 document.getElementById("idd4").innerHTML="<font size='2'>到(超)期</font>";
	 this.onPaymentClick(true);
  },
      
  consolePanel_onShow:function(){
	 var propCode=this.consolePanel.getFieldValue("ts_prop_bl.prop_code");
	 var propName=this.consolePanel.getFieldValue("ts_prop_bl.prop_name");
	 var blId=this.consolePanel.getFieldValue("ts_prop_bl.bl_id");
	 
	 var restriction = new Ab.view.Restriction();
     if (valueExistsNotEmpty(propCode)) {
        restriction.addClause("ts_prop_bl.prop_code", propCode+"%", "like");
     }
     if (valueExistsNotEmpty(propName)) {
        restriction.addClause("ts_prop_bl.prop_name", propName+"%", "like");
     }
     if (valueExistsNotEmpty(blId)) {
        restriction.addClause("ts_prop_bl.bl_id", blId+"%", "like");
     }
     this.propertyListInfoPanel.refresh(restriction);
     this.onPaymentClick(true);
  },    
	      
  propertyListInfoPanel_afterRefresh: function(){
	  var rows=this.propertyListInfoPanel.rows;
	   for(var i=0;i<rows.length;i++){
		   var blId=this.propertyListInfoPanel.rows[i].row.getFieldValue("ts_prop_bl.bl_id");
		   var blName=this.getBlName(blId);
		   this.propertyListInfoPanel.rows[i].row.setFieldValue("ts_prop_bl.blName",blName);
	   }
	  
	this.searchGridColor(this.propertyListInfoPanel.gridRows,this.propertyListInfoPanel.rows);
	
  },
  paymentLogPanel_afterRefresh: function(){
	  var rows=this.paymentLogPanel.rows;
	  for(var i=0;i<rows.length;i++){
		  var propId=this.paymentLogPanel.rows[i].row.getFieldValue("ts_prop_payment_log.prop_code");
		  var propName=this.getPropName(propId);
		  this.paymentLogPanel.rows[i].row.setFieldValue("ts_prop_payment_log.prop_code",propName);
	  }
	  AUSC_AddRowNum(this.paymentLogPanel);
  },
  getBlName:function(blId){
	  var parameters = {
	 			tableName: 'bl',
	 			fieldNames: toJSON(['bl.name']),
	 			restriction: "bl.bl_id ='" + blId + "'"
	 		};
	  var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		var blName="";
		if (result.data.records.length > 0) {
			blName = result.data.records[0]['bl.name'];
			return blName;
		}else{
			return null;
		}
  },
  getPropName:function(propId){
	  var parameters = {
			  tableName: 'ts_prop_company',
			  fieldNames: toJSON(['ts_prop_company.prop_name']),
			  restriction: "ts_prop_company.prop_code ='" + propId + "'"
	  };
	  var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	  var propName="";
	  if (result.data.records.length > 0) {
		  propName = result.data.records[0]['ts_prop_company.prop_name'];
		  return propName;
	  }else{
		  return null;
	  }
  },
  searchGridColor: function(gridRows,rows) {
	
	var ininerThis = this;
	var i =0;
	var list=new Array();
	gridRows.each(function(row) { 
		var index=row.getIndex();
		var lastDate1=null;
		var nextDate=null;
		var dateSign=rows[i]['ts_prop_bl.date_sign'];
		var payPeriod=rows[i]["ts_prop_bl.pay_period"];
		var datePayrentLast=rows[i]['ts_prop_bl.date_payrent_last'];
		var dateValid=rows[i]['ts_prop_bl.date_valid_to'];
		var lastDate=new Date(datePayrentLast.replace(/-/g,"/"));
		
		if(payPeriod=="季度"){
			nextDate=ininerThis.DateAdd("m",3,lastDate);
		}
		if(payPeriod=="半年"){
			nextDate=ininerThis.DateAdd("m",5,lastDate);
		}
		if(payPeriod=="一年"){
			nextDate=ininerThis.DateAdd("m",12,lastDate);
		}
		var beginDate=ininerThis.DateAdd("w",30,nextDate);
		var yellowDate=ininerThis.DateAdd("w",10,nextDate);
		var endDate;
		if(Date.parse(nextDate)>=new Date(dateValid.replace(/-/g,"/"))){
			endDate=dateValid;
		}else{
			endDate=nextDate;
		}
		var now=new Date();
	   		
		var color = '#FFF';
		if(Date.parse(now)<Date.parse(beginDate)){
			color = '#00FFFF'; //blue
		}else if(Date.parse(beginDate)<=Date.parse(now) &&　Date.parse(now)<Date.parse(yellowDate)){
			color = '#00CC66'; //green
		}else if(Date.parse(yellowDate)<=Date.parse(now)　&&　Date.parse(now)<Date.parse(endDate)){
			color = '#FFFF00'; //yellow
		}else if(Date.parse(endDate)<=Date.parse(now)){
			color = '#FF3333';//red
		}
        var cellEl = Ext.get(row.cells.items[1].dom);
    	cellEl.setStyle('background-color', color);
        i++;     
	});	
    },
    
    DateAdd: function(interval,number,date){
    	var currentDay=new Date(date.toDateString());
        switch(interval){
          case "m" : currentDay.setMonth(currentDay.getMonth()+number); break;
          case "d" : currentDay.setDate(currentDay.getDate()+number);  break;
          case "w" : currentDay.setDate(currentDay.getDate()-number);  break;
        }
        return   currentDay;
    },
    
    propertyListInfoPanel_onDeal:function(){
       this.onPaymentClick(false);
       this.dealPaymentPanel.showInWindow({
        	closeButton: false,
            width: 800,
            height: 500
        });
       
	    var propCode=this.propertyInfoPanel.getFieldValue("ts_prop_bl.prop_code");
	    var blId=this.propertyInfoPanel.getFieldValue("ts_prop_bl.bl_id");
	    
	   	this.dealPaymentPanel.refresh(null,true);
	   	this.dealPaymentPanel.setFieldValue("ts_prop_payment_log.prop_code",propCode)
	   	this.dealPaymentPanel.setFieldValue("ts_prop_payment_log.bl_id",blId)
	    this.blName=this.getBlName(blId);
	   	this.propName=this.getPropName(propCode);
	   	this.dealPaymentPanel.setTitle("【"+this.blName+"】物业费支付——"+this.propName);
    },
    
    dealPaymentPanel_onSave:function(){
    	
    	if (!this.dealPaymentPanel.canSave()) {
            return false;
        }else{
        	var payment=this.dealPaymentPanel.getFieldValue("ts_prop_payment_log.pay_amount");
        	var controller=this;
    		var confirmMessage = ("确定要保存【"+this.blName+"】支付-"+payment+"-给【"+this.propName+"】吗？");
    		 View.confirm(confirmMessage, function(button){
    	            if (button == 'yes') {
    	            	try { 
    	            		controller.dealPaymentPanel.save();
    	                	controller.dealPaymentPanel.closeWindow();
    	                	//更新ts_prop_bl(物业公司与建筑物关系表)中的date_payrent_last(缴费日期至),date_payrent_last=date_payrent_last+缴费周期
    	                	var propId=controller.propertyInfoPanel.getFieldValue("ts_prop_bl.prop_code");
    	                	var blId=controller.propertyInfoPanel.getFieldValue("ts_prop_bl.bl_id");
    	                	var payPeriod=controller.propertyInfoPanel.getFieldValue("ts_prop_bl.pay_period");
    	                	var datePayrentLast=controller.propertyInfoPanel.getFieldValue("ts_prop_bl.date_payrent_last");
    	                	var dateValid=controller.propertyInfoPanel.getFieldValue("ts_prop_bl.date_valid_to");
    	                	
    	                	var restriction=new Ab.view.Restriction();
    	                	restriction.addClause("ts_prop_bl.prop_code",propId,"=" );
    	                	restriction.addClause("ts_prop_bl.bl_id",blId,"=" );
    	                	
    	                	var lastDate=new Date(datePayrentLast.replace(/-/g,"/"));
    	                	var nextDate=null;
    	                	if(payPeriod=="1"){//季度
    	                		nextDate=controller.DateAdd("m",3,lastDate);
    	                	}
    	                	if(payPeriod=="2"){//半年
    	                		nextDate=controller.DateAdd("m",5,lastDate);
    	                	}
    	                	if(payPeriod=="3"){//一年
    	                		nextDate=controller.DateAdd("m",12,lastDate);
    	                	}
    	                	var account = View.dataSources.get("ts_prop_bl_ds");
    	                	var record=account.getRecord(restriction);
    	                	
    	                	var endDate;
    	            		if(Date.parse(nextDate)>=new Date(dateValid.replace(/-/g,"/"))){
    	            			endDate=dateValid;
    	            		}else{
    	            			endDate=nextDate;
    	            		}
    	                	record.setValue("ts_prop_bl.date_payrent_last",endDate);
    	                	account.saveRecord(record);
    	                	
    	                	var restriction=new Ab.view.Restriction();
    	                	restriction.addClause("ts_prop_bl.prop_code", propId, "=");
    	                	restriction.addClause("ts_prop_bl.bl_id", blId,"=");
    	                	controller.propertyInfoPanel.refresh(restriction);
    	                	
    	                	var restriction=new Ab.view.Restriction();
    	                	restriction.addClause("ts_prop_payment_log.prop_code", propId,"=");
    	                	restriction.addClause("ts_prop_payment_log.bl_id", blId,"=");
    	                	controller.paymentLogPanel.refresh(restriction);
    	                	
    	                	controller.propertyListInfoPanel.refresh();
    	            	}catch(e){
    	            		Workflow.handleError(e);
    	            		return ;
	                    }
    	             }
    	           });
        }
    },
    
	onPaymentClick:function(afterShow){
		if (this.propertyListInfoPanel.rows.length == 0) {
			this.propertyInfoPanel.show(false);
			this.paymentLogPanel.show(false);
			 return;
		}else{
			var panel=this.propertyListInfoPanel;
			
			var selectedIndex = -1;
			if (afterShow) {
				selectedIndex = 0;
			} else {
				selectedIndex = panel.selectedRowIndex;
			}
			
			var propId = panel.rows[selectedIndex]["ts_prop_bl.prop_code"];
			var blId = panel.rows[selectedIndex]["ts_prop_bl.bl_id"];
			
			var restriction=new Ab.view.Restriction();
			restriction.addClause("ts_prop_bl.prop_code", propId, "=");
			restriction.addClause("ts_prop_bl.bl_id", blId,"=");
			this.propertyInfoPanel.refresh(restriction);
			
			var restriction=new Ab.view.Restriction();
			restriction.addClause("ts_prop_payment_log.prop_code", propId,"=");
			restriction.addClause("ts_prop_payment_log.bl_id", blId,"=");
			this.paymentLogPanel.refresh(restriction);
			
			var blName=this.getBlName(blId);
			this.paymentLogPanel.setTitle("【"+blName+"】物业费支付历史记录");
		}
	}
});