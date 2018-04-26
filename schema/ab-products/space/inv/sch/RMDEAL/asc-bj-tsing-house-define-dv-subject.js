var ascBjUsmsProcAsgnApproveReqApproveTabController = View.createController("ascBjUsmsProcAsgnApproveReqApproveTabController", {

  
  
	
    afterInitialDataFetch: function(){
		//this.onStart();
      
    },
 
    kemuEditForm_onSave : function(){   	    	
    	var panel=View.panels.get('kemuEditForm');
    	var subjectid=panel.getFieldValue('dv.subject_id');
    	var dvid=panel.getFieldValue('dv.dv_id');
    	var subjectname=panel.getFieldValue('dv.subject_name');
    	var account=View.dataSources.get('subjectDs');
    	var record=account.getRecord();   	    	
    	if(subjectid==''){
    		View.alert('请先填入【科目编码】再保存');
    		return;
    	}
    	if(subjectname==''){
    		View.alert('请先填入【科目名称】再保存');
    		return;
    	}
        
    		var res=new Ab.view.Restriction();
    		res.addClause('dv.subject_id',subjectid,'=');
    		var datasource=View.dataSources.get('dv_kemuDs');
    		var record=datasource.getRecord(res);
    		if(!record.isNew){
    			View.alert('此科目编码已经存在!');
    			return;
    		}else{
    			this.kemuEditForm.save();
    			this.ts_subject_Gridkemu.refresh();
    		}
    
         
         record.setValue('ts_subject.subject_id',subjectid);
 		record.setValue('ts_subject.subject_name',subjectname);
 		record.setValue('ts_subject.dv_id',dvid);   		
 		account.saveRecord(record);
    	
    },
    
    ts_subject_Gridkemu_onFind : function(){
    	var panel=View.panels.get('ts_subject_Gridkemu');
    	//panel.addParameter('isNull',' and subject_id is null');
    	var res=new Ab.view.Restriction();
    	res.addClause('dv.subject_id','','=');
    	panel.refresh(res);
    },
    
    ts_subject_Gridkemu_onRefresh : function(){
    	var panel=View.panels.get('ts_subject_Gridkemu');
    	var res=new Ab.view.Restriction();
    	panel.refresh(res);
    }
});

