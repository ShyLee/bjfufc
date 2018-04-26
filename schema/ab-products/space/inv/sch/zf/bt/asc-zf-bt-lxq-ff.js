var ascZfbtLXQFFController = View.createController('ascZfbtLXQFFController', {
	tabs:null,
	wfrId: 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport',
    xmlName: "",
    parameters:{},
	
	afterInitialDataFetch:function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
        
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_ha.em_id", this.tabs.em_id, "=");
        this.zfBtAList.refresh(res);
        
        var res2 = new Ab.view.Restriction();
        res2.addClause("sc_zfbt_hb.em_id", this.tabs.em_id, "=");
        this.zfBtBList.refresh(res2);
        
        var res3 = new Ab.view.Restriction();
        res3.addClause("sc_zfbt_lxq.em_id", this.tabs.em_id, "=");
        this.ffForm.refresh(res3,false);
        
        jQuery("#ffForm input").each(function(){
			jQuery(this).attr("disabled","disabled");
		});
        
        this.ffForm.getFieldElement("sc_zfbt_lxq.money_h").disabled = false;
        this.ffForm.getFieldElement("sc_zfbt_lxq.month_h").disabled = false;
        this.ffForm.getFieldElement("sc_zfbt_lxq.money_yf").disabled = false;
	},
	ffForm_onReport: function(){
		var em_id = this.ffForm.getFieldValue("sc_zfbt_lxq.em_id");
		xmlName= "sc_zfbt_lxq";
        parameters= {
          'Pem_id': em_id,
          'subReports':"sc_zfbt_lxq_sub_xl,sc_zfbt_lxq_sub_gzjl,sc_zfbt_lxq_sub_sala"
        };
		
		try {
            var result = Workflow.callMethod(this.wfrId, xmlName, 0, parameters);
            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
                result.data = eval('(' + result.jsonExpression + ')');
                this.jobId = result.data.jobId;
                var url = 'ab-ireport-example.axvw?jobId=' + this.jobId;
                window.open(url);
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
	},
	zfBtAList_onAdd: function(){
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_ha.em_id", this.tabs.em_id, "=");
		this.zfBtAForm.refresh(res,true);
		this.zfBtAForm.showInWindow({
			closeButton: false,
			x:100,
			y:100,
	        width: 350,
	        height: 200
	    });
	},
	zfBtAList_onDelete: function(){
		var selectedRecordList = this.zfBtAList.getSelectedRecords();
		if(selectedRecordList.length == 0){
			View.alert('请选择要操作的数据');
			return;
		}
		var controller = this;
		View.confirm("您确定要删除此记录?", function(button){
			if(button == "yes"){
				for(var i = 0; i < selectedRecordList.length; i++){
					var record = selectedRecordList[i];
					controller.scZfBtHaDs.deleteRecord(record);
					controller.zfBtAList.refresh();
				}
			}
		});
	},
	zfBtAForm_onSave: function(){
		if(this.zfBtAForm.canSave()){
			this.zfBtAForm.save();
			this.zfBtAForm.closeWindow();
			this.zfBtAList.refresh();
		}
	},
	zfBtAForm_onReturn: function(){
		this.zfBtAForm.closeWindow();
	},
	
	zfBtBList_onAdd: function(){
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_hb.em_id", this.tabs.em_id, "=");
		this.zfBtBForm.refresh(res,true);
		this.zfBtBForm.showInWindow({
			closeButton: false,
			x:100,
			y:100,
	        width: 350,
	        height: 200
	    });
	},
	zfBtBList_onDelete: function(){
		var selectedRecordList = this.zfBtBList.getSelectedRecords();
		if(selectedRecordList.length == 0){
			View.alert('请选择要操作的数据');
			return;
		}
		var controller = this;
		View.confirm("您确定要删除此记录?", function(button){
			if(button == "yes"){
				for(var i = 0; i < selectedRecordList.length; i++){
					var record = selectedRecordList[i];
					controller.scZfBtHbDs.deleteRecord(record);
					controller.zfBtBList.refresh();
				}
			}
		});
	},
	zfBtBForm_onSave: function(){
		if(this.zfBtBForm.canSave()){
			this.zfBtBForm.save();
			this.zfBtBForm.closeWindow();
			this.zfBtBList.refresh();
		}
	},
	zfBtBForm_onReturn: function(){
		this.zfBtBForm.closeWindow();
	},
	
	ffForm_onReturn: function(){
		this.tabs.selectTab('applyInfoTab');
	},
	ffForm_onCalculate: function(){
		//来校前无房一次性=(98年月均工资×月补贴系数×98前工作月之和)+（年度工龄补贴额×建立公积金前工龄×98年补贴标准）
		var money_h = this.ffForm.getFieldValue("sc_zfbt_lxq.money_h");
		var btxs = this.ffForm.getFieldValue("sc_zfbt_lxq.btxs");
		var month_h = this.ffForm.getFieldValue("sc_zfbt_lxq.month_h");
		var gl_h = this.ffForm.getFieldValue("sc_zfbt_lxq.gl_h");
		var btbz_h = this.ffForm.getFieldValue("sc_zfbt_lxq.btbz_h");
		var money_glbt = this.ffForm.getFieldValue("sc_zfbt_lxq.money_glbt");
		
		var money_a = (money_h * btxs * month_h) + (gl_h * btbz_h * money_glbt);
		this.ffForm.setFieldValue("sc_zfbt_lxq.money_a",money_a.toFixed(2));
		
		//来校前无房月补贴1=（∑月基本工资*对应工作月数）*月补贴系数
		var recordNum = this.zfBtAList.gridRows.items.length;
		var salary_hj = 0;//来校前无房月补贴1
		for(var i=0; i<recordNum; i++){
			var money = this.zfBtAList.gridRows.items[i].getFieldValue("sc_zfbt_ha.money");
			var month = this.zfBtAList.gridRows.items[i].getFieldValue("sc_zfbt_ha.month");
			salary_hj += parseFloat(money) * parseFloat(month);
		}
		this.ffForm.setFieldValue("sc_zfbt_lxq.salary_hj",salary_hj);
		
		var money_b = salary_hj * btxs / 0.7;
		this.ffForm.setFieldValue("sc_zfbt_lxq.salary_hj",salary_hj);
		this.ffForm.setFieldValue("sc_zfbt_lxq.money_b",money_b.toFixed(2));
		
		//来校前无房月补贴2=∑月补贴标准*对应工作月数
		var recordNum = this.zfBtBList.gridRows.items.length;
		var money_c = 0;//来校前无房月补贴2
		for(var i=0; i<recordNum; i++){
			var money = this.zfBtBList.gridRows.items[i].getFieldValue("sc_zfbt_hb.money");
			var month = this.zfBtBList.gridRows.items[i].getFieldValue("sc_zfbt_hb.month");
			money_c += parseFloat(money) * parseFloat(month);
		}
		this.ffForm.setFieldValue("sc_zfbt_lxq.money_c",money_c.toFixed(2));
		
		var money_yf = this.ffForm.getFieldValue("sc_zfbt_lxq.money_yf");
		
		var money_hj = money_a + money_b + money_c - parseFloat(money_yf);
		this.ffForm.setFieldValue("sc_zfbt_lxq.money_hj",money_hj.toFixed(2));
	},
	ffForm_onSave: function(){
		this.ffForm.save();
		View.showMessage("保存成功！");
	}
	
	

});


