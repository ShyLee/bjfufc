
var caDefEq = View.createController('caDefEq', {  
	
    crtRow: null,  
    restriction: null, 
    isNew: true, 
    consoleRestriction: null,  
    
    afterViewLoad: function(){
    	
     var restriction=new Ab.view.Restriction();
	 var records = View.dataSources.get("RoomDs").getRecords();
	 var listCardId=[];
	 for (var i = 0; i < records.length; i++) {
		 var cardIdValue=records[i].getValue('sc_zzfcard.card_id');
		    var startPayDate=records[i].getValue('sc_zzfcard.date_checkin');
		    var endPayDate=records[i].getValue('sc_zzfcard.date_checkout_ought');
		    
		    var paymentTo=records[i].getValue('sc_zzfcard.payment_to');
		    var rentPeriod=records[i].getValue('sc_zzfcard.rent_period');
		    var datePayrentLast=records[i].getValue('sc_zzfcard.date_payrent_last');
		    
//		    var date=this.DateAdd("m",1,new Date());
		    var date=new Date();
		    var lastDate=datePayrentLast;
		    var nextDate="";
		    if(paymentTo="house"){
		    	if(rentPeriod=="Month"){
		    		nextDate=this.DateAdd("m",1,lastDate);
		    	}
		    	if(rentPeriod=="Quarter"){
		    		nextDate=this.DateAdd("m",3,lastDate);
		    	}
		    	if(rentPeriod=="Year"){
		    		nextDate=this.DateAdd("m",12,lastDate);
		    	}
		    }
		    if(nextDate!=""){
		    	if(nextDate>endPayDate){
		    		nextDate=endPayDate;
		    	}
		    	if(nextDate>date){
		    		var cardId="'"+cardIdValue+"'";
		    		listCardId.push(cardId);
		    	}
		    }
	 }
	 if(listCardId.length!=0){
		 this.detailsconsole.addParameter('cardId',"sc_zzfcard.card_id not in ("+listCardId+")");
	 }
    },
    afterInitialDataFetch: function(){
  	  this.detailsconsole.sortEnabled = false;
  	  if (this.detailsconsole.rows.length == 0) {
  	  	this.detailsconsole.refresh();
  	  }
  	  
  	this.abScDefDeAreaGrid.sortEnabled = false;
	  if (this.abScDefDeAreaGrid.rows.length == 0) {
	  	this.abScDefDeAreaGrid.refresh();
	  }
	  
	    document.getElementById("idd1").innerHTML="<font size='2'>30天内</font>";
		document.getElementById("idd2").innerHTML="<font size='2'>10天内</font>";
		document.getElementById("idd3").innerHTML="<font size='2'>到(超)期</font>";
		document.getElementById("idd4").innerHTML="<font size='2'>>60天</font>";
		document.getElementById("idd5").innerHTML="<font size='2'>60天内</font>";
		document.getElementById("idd6").innerHTML="<font size='2'>租期到(超)期</font>";
      },
      detailsconsole_afterRefresh: function(){
  		this.searchGridColor(this.detailsconsole.gridRows,this.detailsconsole.rows);
      },
	  searchGridColor: function(gridRows,rows) {
			var ininerThis = this;
			var i =0;
			var list=new Array();
			gridRows.each(function(row) { 
				var index=row.getIndex();
	    		var lastDate1=null;
	    		var nextDate=null;
	    		var date_checkin=rows[i]['sc_zzfcard.date_checkin'];
	    		var endPayDate=rows[i]['sc_zzfcard.date_checkout_ought'];
	    		if(date_checkin==""){
	    			date_checkin=new Date().toString();
	    		}
	    		var rent_period=rows[i]["sc_zzfcard.rent_period"];
	    		var date_payrent_last=rows[i]['sc_zzfcard.date_payrent_last'];
	    		if(date_payrent_last==""){
	    			lastDate1=date_checkin;
	    		}else{
	    			lastDate1=date_payrent_last;
	    		}
	    		var lastDate=new Date(lastDate1.replace(/-/g,"/"));
	    		if(rent_period=="按月"){
	    			nextDate=ininerThis.DateAdd("m",1,lastDate);
	    		}
	    		if(rent_period=="按季度"){
	    			nextDate=ininerThis.DateAdd("m",3,lastDate);
	    		}
	    		if(rent_period=="按年"){
	    			nextDate=ininerThis.DateAdd("m",12,lastDate);
	    		}
	    		var yellowDate=ininerThis.DateAdd("w",10,nextDate);
	    		var beginDate=ininerThis.DateAdd("w",30,nextDate);
	    	  	if(nextDate>endPayDate){
		    		nextDate=endPayDate;
		    	}
	    	  	var endDate=nextDate;			
	    		var now=new Date();
	    		var color = '#FFF';
				if (Date.parse(nextDate)<=Date.parse(now)) {
					color = '#FF3333';// red
				}else if(Date.parse(yellowDate)<=Date.parse(now)<Date.parse(nextDate)){
					color = '#FFFF00'; // yellow
	    		}else if(Date.parse(beginDate)<Date.parse(now)<Date.parse(yellowDate)){
	    			color = '#00CC66'; // green
	    		}
	            var cellEl = Ext.get(row.cells.items[1].dom);
	        	cellEl.setStyle('background-color', color);
	            i++;     
			});	 
	    },
  
	    detailsconsole_select_onClick: function(row){
	    	var cardId=row.getFieldValue('sc_zzfcard.card_id');
	    	this.formWindow.showInWindow({
	    		width: 780,
	    		height: 350,
	    		closeButton: false
	    	});
	    	this.formWindow.show();
	    	var dataDS=View.dataSources.get('ds_asc-bj-usms-house-alert-board1');
	    	var restriction=new Ab.view.Restriction();
    	    restriction.addClause("sc_zzfcard.card_id",cardId,"=");
//    	    var record=dataDS.getRecord(restriction);
    	    this.formWindow.refresh(restriction);
	    },
	    DateAdd: function(interval,number,date){
	    	var currentDay=new Date(date.toDateString());
	        switch(interval){
	          case "m" : currentDay.setMonth(currentDay.getMonth()+number); break;
	          case "w" : currentDay.setDate(currentDay.getDate()-number);  break;
	          case "d" : currentDay.setDate(date.getDate()+number);break;
	        }
	        return   currentDay;
	    },
//       DateAdd: function(interval,number,date){
//    
//    	 
//            switch(interval)
//            {
//                   
//                    case   "m"   :   {
//                            date.setMonth(date.getMonth()+number);
//                            return   date;
//                            break;
//                    }
//                    case   "d"   :   {
//                        date.setDate(date.getDate()+number);
//                        return   date;
//                        break;
//                }
//                    case   "w"   :   {
//                        date.setDate(date.getDate()-number);
//                        return   date;
//                        break;
//                }
//                   
//                    default   :   {
//                            date.setDate(date.getDate()+number);
//                            return   date;
//                            break;
//                    }
//            }
//    },
    
    searchGridColor2: function(gridRows,rows) {
		var i =0;
		var iday=0;
    	gridRows.each(function(row) 
		{    		
    		var color = '#FFF';
			var iday=rows[i]['sc_zzfcard.xiangchatianshu'];
			if(parseFloat(iday)>60){
				color = '#00CC66'; //green 
			}
			if (parseFloat(iday)>0 && parseFloat(iday) <= 60) {
    			color = '#FFFF00'; //Yellow 
    		}
			if(parseFloat(iday)<=0){
				color = '#FF3333'; //Red
			}
            var cellEl = Ext.get(row.cells.items[1].dom);
        	cellEl.setStyle('background-color', color);
            i++;     
		});	 
    },
	projectRoomGrid_afterRefresh: function(){
		var title = getMessage('roomTitle') +" " + this.projectName ;
		this.projectRoomGrid.setTitle(title);
    },
    
    abScDefDeAreaGrid_afterRefresh: function(){
		// after build color the grid for escalation values
		this.searchGridColor2(this.abScDefDeAreaGrid.gridRows,this.abScDefDeAreaGrid.rows);
    },
    filterFn : function(){
    	var grid = View.panels.get('abScDefDeAreaGrid');
    	var formwindowshow = View.panels.get('formwindowshow');
	    var index = grid.selectedRowIndex;
	    var record = grid.gridRows.get(index).getRecord();	   
	    var cardId = record.getValue('sc_zzfcard.card_id');	
	    formwindowshow.showInWindow({
	    width: 600,
        height: 180
       });
       var restriction=new Ab.view.Restriction();
	    restriction.addClause("sc_zzfcard.card_id",cardId,"=");
	    formwindowshow.refresh(restriction);
    },
    
    formwindowshow_onShowhistory: function(){
    	var cardId=this.formwindowshow.getFieldValue('sc_zzfcard.card_id');
    	var year=this.formwindowshow.getFieldValue('sc_zzfrent_details.year');
    	var month=this.formwindowshow.getFieldValue('sc_zzfrent_details.month');
    	  this.formwindow2.showInWindow({
    		    width: 500,
    	        height:270
    	       });
    	var restriction=new Ab.view.Restriction();
  	    restriction.addClause("sc_zzfrent_details.card_id",cardId,"=");
  	    restriction.addClause("sc_zzfrent_details.year",year,"=");
  	    restriction.addClause("sc_zzfrent_details.month",month,"=");
  	    this.formwindow2.refresh(restriction);
    },
    
    selfGzcPayForm_dkselect_onClick: function(row){
    	var grid = View.panels.get('selfGzcPayForm');
    	var formwindow3 = View.panels.get('formwindow3');
    	formwindow3.showInWindow({
    		width: 800,
    		height: 325
    	});
	    var cardId=row.getFieldValue('sc_zzfcard.card_id');	
	    var restriction=new Ab.view.Restriction();
	    restriction.addClause("sc_zzfcard.card_id",cardId,"=");
	    formwindow3.refresh(restriction);
    },
    
    formwindow3_onEdit :function(){
    	var grid = View.panels.get('selfGzcPayForm');
    	var formwindow4 = View.panels.get('formwindow4');
	    formwindow4.showInWindow({
	    width: 500,
        height: 260
        });
       var cardId = this.formwindow3.getFieldValue('sc_zzfcard.card_id');	
	   var restriction=new Ab.view.Restriction();
	   restriction.addClause("sc_zzfrent_details.card_id",cardId,"=");
	   formwindow4.refresh(restriction);
    },
    
    formwindow4_onSave: function(){
    	var formwindow4=this.formwindow4;
    	var date_payrent=this.formwindow4.getFieldValue('sc_zzfrent_details.date_payrent');
    	var actual_payoff=this.formwindow4.getFieldValue('sc_zzfrent_details.actual_payoff');
    	var note1=this.formwindow4.getFieldValue('sc_zzfrent_details.note1');
    	if(date_payrent==""){
    		View.showMessage("请填写缴费日期！");
    		return;
    	}
    	if(actual_payoff==""){
    		View.showMessage("请填写本月扣房租！");
    		return;
    	}
    	if(note1==""){
    		View.showMessage("请填写备注！");
    		return;
    	}

    	var seccess=this.formwindow4.save();
    	if(seccess){
    		View.showMessage("保存成功！");
    	}
    }
  

});

function onRefreshRoomGrid(){
	var projectGrid = View.panels.get("abScDefDeAreaGrid");
	var restriction = new Ab.view.Restriction;
	var projectId = projectGrid.rows[projectGrid.selectedRowIndex]["rm.project_id"];
	ascBjUsmsProjectAlertBoardController.projectName = projectGrid.rows[projectGrid.selectedRowIndex]["sc_project.name"];
	restriction.addClause("sc_project.project_id",projectId,'=');
	var roomGrid = View.panels.get("projectRoomGrid");
	roomGrid.refresh(restriction);
};

function filterFn(){
	 var grid = View.panels.get('abScDefDeAreaGrid');
	    var index = grid.selectedRowIndex;
	    var record = grid.gridRows.get(index).getRecord();	   
	    var cardId = record.getValue('sc_zzfcard.card_id');
   var restriction=new Ab.view.Restriction();
   restriction.addClause("sc_zzfcard.card_id",this.cardId,"=");
   this.formwindow2.showInWindow({
       width: 800,
       height: 300
   })
}

