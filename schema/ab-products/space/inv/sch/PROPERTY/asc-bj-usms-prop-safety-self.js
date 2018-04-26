var TsingHouseRelicOneselfController = View.createController('TsingHouseRelicOneselfController' , {
	afterInitialDataFetch: function()
	{
		if(this.ts_relic_oneself_grid.rows.length!=0)
		{
			var sf_id = this.ts_relic_oneself_grid.rows[0]["ts_relic_oneself.sf_id"];
			var restriction = new Ab.view.Restriction();
			restriction.addClause('ts_relic_oneself.sf_id',sf_id,'=');
			this.ts_relic_oneself_form.refresh(restriction);
			//判断是否为物业公司
			change();
			//显示openhtml
			document.getElementById("td1").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che1' name='checkname' onclick='changecolor(this);'/><font size='2'>(1)消防安全责任制和逐级岗位责任制的建立和落实情况；</font>";
			document.getElementById("td2").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che2' name='checkname' onclick='changecolor(this);'/><font size='2'>(2)消防安全制度和消防安全操作规程的建立情况；</font>";
			document.getElementById("td3").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che3' name='checkname' onclick='changecolor(this);'/><font size='2'>(3)安保方案、应急预案、灭火和应急疏散预案的制定情况；<font size='2'>";
			document.getElementById("td4").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che4' name='checkname' onclick='changecolor(this);'/><font size='2'>(4)消防安全教育、消防培训演练以及员工消防安全知识掌握情况；</font>";
			document.getElementById("td5").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che5' name='checkname' onclick='changecolor(this);'/><font size='2'>(5)火灾隐患、防范措施以及整改落实情况；</font>";
			document.getElementById("td6").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che6' name='checkname' onclick='changecolor(this);'/><font size='2'>(6)消防车通道、疏散通道、疏散指示标志、应急照明和安全出口情况；</font>";
			document.getElementById("td7").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che7' name='checkname' onclick='changecolor(this);'/><font size='2'>(7)消防水源、消防设施器材配置、消防安全标志设置及完好有效情况；</font>";
			document.getElementById("td8").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che8' name='checkname' onclick='changecolor(this);'/><font size='2'>(8)安全监控室和消防控制室设施设备运行、维护保养及记录情况；</font>";
			document.getElementById("td9").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che9' name='checkname' onclick='changecolor(this);'/><font size='2'>(9)文明建筑安全检查落实、问题整改及记录情况；</font>";
			document.getElementById("td10").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che10' name='checkname' onclick='changecolor(this);'/><font size='2'>(10)用火 、 用电有无违章情况；</font>";
			document.getElementById("td11").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che11' name='checkname' onclick='changecolor(this);'/><font size='2'>(11)易燃易爆物品和场所防火防爆措施落实情况；</font>";
			document.getElementById("td12").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che12' name='checkname' onclick='changecolor(this);'/><font size='2'>(12)重要物资防火安全情况；</font>";
			document.getElementById("td13").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che13' name='checkname' onclick='changecolor(this);'/><font size='2'>(13)重点工种（消防控制室等） 人员是否持证上岗；</font>";
			document.getElementById("td14").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che14' name='checkname' onclick='changecolor(this);'/><font size='2'>(14)安保人员在岗情况、安全巡查及工作记录情况；</font>";
			document.getElementById("td15").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che15' name='checkname' onclick='changecolor(this);'/><font size='2'>(15)其他需要检查的内容；</font>";
			
			var ts_content = this.ts_relic_oneself_grid.rows[0]["ts_relic_oneself.ts_content"];
			if(ts_content=="")
			{
				var checkname = document.getElementsByName("checkname");
				for(var a=0;a<15;a++)
				{
					checkname[a].checked=false;
					document.getElementById("td"+(a+1)).style.backgroundColor="";
				}
				return false;
			}
			var checkname = document.getElementsByName("checkname");
			for(var a=0;a<15;a++)
			{
				checkname[a].checked=false;
				document.getElementById("td"+(a+1)).style.backgroundColor="";
			}
			var array = new Array();
			array = ts_content.split(",");
			
			for(var i=0;i<array.length;i++)
			{
				document.getElementById("che"+array[i]).checked=true;
				document.getElementById("td"+array[i]).style.backgroundColor="#84C1FF";
			}
			
		}
		else
		{
			document.getElementById("td1").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che1' name='checkname' onclick='changecolor(this);'/><font size='2'>(1)消防安全责任制和逐级岗位责任制的建立和落实情况；</font>";
			document.getElementById("td2").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che2' name='checkname' onclick='changecolor(this);'/><font size='2'>(2)消防安全制度和消防安全操作规程的建立情况；</font>";
			document.getElementById("td3").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che3' name='checkname' onclick='changecolor(this);'/><font size='2'>(3)安保方案、应急预案、灭火和应急疏散预案的制定情况；<font size='2'>";
			document.getElementById("td4").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che4' name='checkname' onclick='changecolor(this);'/><font size='2'>(4)消防安全教育、消防培训演练以及员工消防安全知识掌握情况；</font>";
			document.getElementById("td5").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che5' name='checkname' onclick='changecolor(this);'/><font size='2'>(5)火灾隐患、防范措施以及整改落实情况；</font>";
			document.getElementById("td6").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che6' name='checkname' onclick='changecolor(this);'/><font size='2'>(6)消防车通道、疏散通道、疏散指示标志、应急照明和安全出口情况；</font>";
			document.getElementById("td7").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che7' name='checkname' onclick='changecolor(this);'/><font size='2'>(7)消防水源、消防设施器材配置、消防安全标志设置及完好有效情况；</font>";
			document.getElementById("td8").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che8' name='checkname' onclick='changecolor(this);'/><font size='2'>(8)安全监控室和消防控制室设施设备运行、维护保养及记录情况；</font>";
			document.getElementById("td9").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che9' name='checkname' onclick='changecolor(this);'/><font size='2'>(9)文明建筑安全检查落实、问题整改及记录情况；</font>";
			document.getElementById("td10").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che10' name='checkname' onclick='changecolor(this);'/><font size='2'>(10)用火 、 用电有无违章情况；</font>";
			document.getElementById("td11").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che11' name='checkname' onclick='changecolor(this);'/><font size='2'>(11)易燃易爆物品和场所防火防爆措施落实情况；</font>";
			document.getElementById("td12").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che12' name='checkname' onclick='changecolor(this);'/><font size='2'>(12)重要物资防火安全情况；</font>";
			document.getElementById("td13").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che13' name='checkname' onclick='changecolor(this);'/><font size='2'>(13)重点工种（消防控制室等） 人员是否持证上岗；</font>";
			document.getElementById("td14").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che14' name='checkname' onclick='changecolor(this);'/><font size='2'>(14)安保人员在岗情况、安全巡查及工作记录情况；</font>";
			document.getElementById("td15").innerHTML="&nbsp;&nbsp;<input type='checkbox' id='che15' name='checkname' onclick='changecolor(this);'/><font size='2'>(15)其他需要检查的内容；</font>";
			
			this.openhtml.show(false);
			this.ts_relic_oneself_form.show(false);
			}
	},
	ts_relic_oneself_grid_onNew:function()
	{
		var checkname = document.getElementsByName("checkname");
		for(var a=0;a<15;a++){
			checkname[a].checked=false;
			document.getElementById("td"+(a+1)).style.backgroundColor="";
		}
		this.openhtml.show(true);
		this.ts_relic_oneself_form.show(true);
		var arcRec = new Ab.data.Record({
			'ts_relic_oneself.sf_tx_people':View.user.name,
		} , true);
		try{
			var ds = this.tsRelicOneselfDs;
			var result = ds.saveRecord(arcRec);
			
			var pkeyId = result.getValue('ts_relic_oneself.sf_id');
	    	this.ts_relic_oneself_form_refresh(pkeyId);
		}catch(e){
			View.showMessage('error' , message , e.message , e.data);
		}
	},
	ts_relic_oneself_console_onShow:function()
	{
		
		/*
		 * 时间段查询设计，运用别名，在界面上获取开始时间和结束时间，再运用js加   restriction
		 * */
		var panel = View.panels.get('ts_relic_oneself_console');
		var restriction = panel.getFieldRestriction();
		var startDate = panel.getFieldValue("ts_relic_oneself.sf_review_date");
		var endDate = panel.getFieldValue("date_to");
		
		
		// delete twice for ts_relic_oneself.sf_review_date 
		restriction.removeClause("ts_relic_oneself.sf_review_date");
		restriction.removeClause("ts_relic_oneself.sf_review_date");
		
		if (startDate != '') {
			restriction.addClause("ts_relic_oneself.sf_review_date", startDate, "&gt;=");
		}
		
		if (endDate != '') {
			restriction.addClause("ts_relic_oneself.sf_review_date", endDate, "&lt;=");
		}
		
		var panel2 = View.panels.get('ts_relic_oneself_grid');
		
		panel2.refresh(restriction);
		
		this.afterConsoleShow();
		
	},
	//生成序列号
	ts_relic_oneself_grid_afterRefresh: function(){
	        var rows = this.ts_relic_oneself_grid.rows;
	        for (var i = 0; i < rows.length; i++) {
	            this.ts_relic_oneself_grid.gridRows.items[i].cells.items[0].dom.innerHTML = i + 1;
	        }
	 },
	    
	getCheckId:function()
	{
		var checkname = document.getElementsByName("checkname");
		var number = "";
		for(var i=0;i<15;i++)
		{
			if(checkname[i].checked)
			{
				number = number+(i+1)+",";
			}
		}
		if(number!="")
			number=number.substring(0,number.length-1)
		return number;
	},
	showCheck:function()
	{
		var index = this.ts_relic_oneself_grid.selectedRowIndex;
		var gridRowRecord = this.ts_relic_oneself_grid.gridRows.get(index).getRecord();
		var ts_content = gridRowRecord.getValue('ts_relic_oneself.ts_content');
		//判断是否为物业公司
		change();
		if(ts_content=="")
		{
			var checkname = document.getElementsByName("checkname");
			for(var a=0;a<15;a++)
			{
				checkname[a].checked=false;
				document.getElementById("td"+(a+1)).style.backgroundColor="";
			}
			return false;
		}
		var checkname = document.getElementsByName("checkname");
		for(var a=0;a<15;a++)
		{
			checkname[a].checked=false;
			document.getElementById("td"+(a+1)).style.backgroundColor="";
		}
		var array = new Array();
		array = ts_content.split(",");
		
		for(var i=0;i<array.length;i++)
		{
			document.getElementById("che"+array[i]).checked=true;
			document.getElementById("td"+array[i]).style.backgroundColor="#84C1FF";
		}
		
	},
	formRefresh:function(){
		this.ts_relic_oneself_grid.refresh();
		this.ts_relic_oneself_form.show(false);
	},
	

	afterConsoleShow:function(){
		var index = 0;
		var records = this.ts_relic_oneself_grid.gridRows;
		if(records.length <= 0){
			this.openhtml.show(false);
			this.ts_relic_oneself_form.show(false);
			return;
		}
		else{
			var gridRowRecord = this.ts_relic_oneself_grid.gridRows.get(index).getRecord();
			var ts_content = gridRowRecord.getValue('ts_relic_oneself.ts_content');
			var sf_id = gridRowRecord.getValue('ts_relic_oneself.sf_id');
			
			
			var restriction = new Ab.view.Restriction();
			/*
			 * 刷新form
			 * */
			if(sf_id != ""){
				restriction.addClause('ts_relic_oneself.sf_id' ,sf_id , '=');
				this.ts_relic_oneself_form.refresh(restriction);
			}else{
				return;
			}
				
			/*
			 * 刷新"检查内容"
			 * */
			if(ts_content=="")
			{
				var checkname = document.getElementsByName("checkname");
				for(var a=0;a<15;a++)
				{
					checkname[a].checked=false;
					document.getElementById("td"+(a+1)).style.backgroundColor="";
				}
				return false;
			}
			var checkname = document.getElementsByName("checkname");
			for(var a=0;a<15;a++)
			{
				checkname[a].checked=false;
				document.getElementById("td"+(a+1)).style.backgroundColor="";
			}
			var array = new Array();
			array = ts_content.split(",");
			
			for(var i=0;i<array.length;i++)
			{
				document.getElementById("che"+array[i]).checked=true;
				document.getElementById("td"+array[i]).style.backgroundColor="#84C1FF";
			}
			this.openhtml.show(true);
			this.ts_relic_oneself_form.show(true);
		
		}
	}
	
});
function changecolor(obj){
	var id=obj.parentElement;
	var check=obj.checked;
	if(check==true){
		
		id.style.backgroundColor='#84C1FF';
	}
	 if(check==false){

		id.style.backgroundColor='transparent';
	}
}

//是否为物业公司
function change(){
	var index=Ext.get('ts_relic_oneself_form_ts_relic_oneself.sf_sfwy').getValue();
	if(index=='1'){
		$('ts_relic_oneself_form_ts_relic_oneself.sf_wy_people').disabled = true;
		$('ts_relic_oneself_form_ts_relic_oneself.sf_wy_mode').disabled = true;
	}
	if(index=='0'){
		$('ts_relic_oneself_form_ts_relic_oneself.sf_wy_people').disabled = false;
		$('ts_relic_oneself_form_ts_relic_oneself.sf_wy_mode').disabled = false;
	}
}