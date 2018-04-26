var zwjbController = View.createController('zwjbController',{
	zwjbPanel_onAdd:function(){
		this.zwjbAddForm.refresh('1<>1');
		this.zwjbAddForm.enableField('sc_zw_jb.zw_jb_id', true);
		this.zwjbAddForm.enableField('sc_zw_jb.zw_jb_name', true);
		this.zwjbAddForm.showInWindow({
		    x: 900, 
		    y: 600, 
		    width: 600, 
		    height: 300,
		    closeButton: false 
		});
	},
	edit:function(){
		var selectedIndex = this.zwjbPanel.selectedRowIndex;
		var zwjbId = this.zwjbPanel.gridRows.items[selectedIndex].getFieldValue('sc_zw_jb.zw_jb_id');
		var res = new Ab.view.Restriction(); 
		res.addClause("sc_zw_jb.zw_jb_id",zwjbId,"=");
		this.zwjbEditForm.refresh(res);
		this.zwjbEditForm.enableField('sc_zw_jb.zw_jb_id', false);
		this.zwjbEditForm.enableField('sc_zw_jb.zw_jb_name', false);
		this.zwjbEditForm.showInWindow({
			newRecord:false,
		    x: 900, 
		    y: 600, 
		    width: 600, 
		    height: 300,
		    closeButton: false 
		});
	},
	zwjbPanel_onDelete:function(){
		var rows = this.zwjbPanel.getSelectedRows();
 		var zwjbDs = this.zwjbDs;
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
	   		                res.addClause("sc_zw_jb.zw_jb_id",record.getValue('sc_zw_jb.zw_jb_id'),'=');
	   		                var delRecord = zwjbDs.getRecord(res);
	   		                zwjbDs.deleteRecord(delRecord);
   		            	}
		            	}
		            controller.zwjbPanel.refresh();
		        });
		
	},
	zwjbAddForm_onSave:function(){
		this.zwjbAddForm.newRecord = true;
		if(!this.zwjbAddForm.canSave()){
			return;
		}
		this.zwjbAddForm.save();
		this.zwjbPanel.refresh();
		this.zwjbAddForm.closeWindow();
	},
	zwjbEditForm_onSave:function(){
		this.zwjbEditForm.save();
		this.zwjbPanel.refresh();
	},
	zwjbEditForm_onClear:function(){
		this.zwjbEditForm.setFieldValue("sc_zw_jb.area_zf_std","");
		this.zwjbEditForm.setFieldValue("sc_zw_jb.amount_wf_std","");
	}
});