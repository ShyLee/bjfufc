var zcjbController = View.createController('zcjbController',{
	zcjbPanel_onAdd:function(){
		this.zcjbAddForm.refresh('1<>1');
		this.zcjbAddForm.enableField('sc_zw_jb.zw_jb_id', true);
		this.zcjbAddForm.enableField('sc_zw_jb.zw_jb_name', true);
		this.zcjbAddForm.showInWindow({
		    x: 900, 
		    y: 600, 
		    width: 600, 
		    height: 300,
		    closeButton: false 
		});
	},
	edit:function(){
		var selectedIndex = this.zcjbPanel.selectedRowIndex;
		var zcjbId = this.zcjbPanel.gridRows.items[selectedIndex].getFieldValue('sc_zc_jb.zc_jb_id');
		var res = new Ab.view.Restriction(); 
		res.addClause("sc_zc_jb.zc_jb_id",zcjbId,"=");
		this.zcjbEditForm.refresh(res);
		this.zcjbEditForm.enableField('sc_zw_jb.zw_jb_id', false);
		this.zcjbEditForm.enableField('sc_zw_jb.zw_jb_name', false);
		this.zcjbEditForm.showInWindow({
			newRecord:false,
		    x: 900, 
		    y: 600, 
		    width: 600, 
		    height: 300,
		    closeButton: false 
		});
	},
	zcjbPanel_onDelete:function(){
		var rows = this.zcjbPanel.getSelectedRows();
 		var zcjbDs = this.zcjbDs;
 		controller=this;
		if(rows.length == 0){
			View.showMessage("请选择要删除的职务级别");
			return;
		}
			 	var confirmMessage = ("是否要将选中的职务级别删除？");
		        View.confirm(confirmMessage, function(button){
		            if (button == 'yes') {
   		            	for(var i=0;i<rows.length;i++){
	   		 	     		var row = rows[i];
	   		 	            var currentIndex=row.row.getIndex();
	   		 	            var record = row.row.getRecord();
	   		                var res = new Ab.view.Restriction();
	   		                res.addClause("sc_zc_jb.zc_jb_id",record.getValue('sc_zc_jb.zc_jb_id'),'=');
	   		                var delRecord = zcjbDs.getRecord(res);
	   		                zcjbDs.deleteRecord(delRecord);
   		            	}
		            	}
		            controller.zcjbPanel.refresh();
		        });
		
	},
	zcjbAddForm_onSave:function(){
		this.zcjbAddForm.newRecord = true;
		if(!this.zcjbAddForm.canSave()){
			return;
		}
		this.zcjbAddForm.save();
        this.zcjbPanel.refresh();
        this.zcjbAddForm.closeWindow();
	},
	zcjbEditForm_onSave:function(){
		this.zcjbEditForm.save();
		this.zcjbPanel.refresh();
	},
	zcjbEditForm_onClear: function(){
		this.zcjbEditForm.setFieldValue("sc_zc_jb.area_zf_std","");
		this.zcjbEditForm.setFieldValue("sc_zc_jb.amount_wf_std","");
	}
});