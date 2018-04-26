var abPapersController = View.createController('abPapersController',{
	
	afterInitialDataFetch: function(){
		 this.onPapersClick(true);
	  },
	  
	  gridPanel_onNew:function(){
		this.formPanel.refresh(null,true);
		var restriction=new Ab.view.Restriction();
		restriction.addClause("ts_doc_center.target_id", '', 'IS NULL', 'AND', true);
		restriction.addClause("ts_doc_center.table_name", "ts_papers","=");
		this.fileupload.refresh(restriction);
	},
	
	onPapersClick:function(afterShow){
		if (this.gridPanel.rows.length == 0) {
			this.formPanel.show(false);
			this.fileupload.show(false);
			 return;
		}else{
		
			var panel=this.gridPanel;
			var selectedIndex = -1;
			if (afterShow) {
				selectedIndex = 0;
			} else {
				selectedIndex = panel.selectedRowIndex;
			}
		
			var id = panel.rows[selectedIndex]["ts_papers.papers_code"];
			var restriction=new Ab.view.Restriction();
			restriction.addClause("ts_papers.papers_code", id, "=");
			this.formPanel.refresh(restriction,false);
			
			var restriction=new Ab.view.Restriction();
			restriction.addClause("ts_doc_center.target_id", id,"=");
			restriction.addClause("ts_doc_center.table_name", "ts_papers","=");
			this.fileupload.refresh(restriction);
		
			var name = panel.rows[selectedIndex]["ts_papers.papers_name"];
			this.fileupload.setTitle("【"+name+"】附件");
		}
	},
	formPanel_onDelete:function(){
		var id=this.formPanel.getFieldValue("ts_papers.papers_code");
		
		//删除附件表中对应的数据(从表)
		var dateSource = View.dataSources.get("ts_doc_center_ds");
        var restriction = new Ab.view.Restriction();
        restriction.addClause("ts_doc_center.target_id", id, "=");
        restriction.addClause("ts_doc_center.table_name",'ts_papers', "=");
        var record = dateSource.getRecords(restriction);
        AUSC_deleteRecord(dateSource, record);
        
        //删除主表信息
        var dateSource1 = View.dataSources.get("ts_papers_ds");
        var restriction1 = new Ab.view.Restriction();
        restriction1.addClause("ts_papers.papers_code", id, "=");
        var record1 = dateSource1.getRecords(restriction1);
        AUSC_deleteRecord(dateSource1, record1);
        

	},
	fileupload_onUpload:function(){
		var primaryKey=this.formPanel.getFieldValue("ts_papers.papers_code");
		var restriction={'pk':primaryKey,'tbn':'ts_papers'};
		var thisController = this;
		var dialog=View.openDialog('asc_bj_ts_file_upload.axvw', restriction, false, {
    	    width: 630,
    	    height: 450,
    	    closeButton: false,
    	    afterViewLoad: function(dialogView) {
                var dialogController = dialogView.controllers.get('uploadFileController');
                dialogController.onClose = thisController.dialog_onClose.createDelegate(thisController);
            }
    	});
    	
	},
	
	dialog_onClose: function() {
		var id = this.formPanel.getFieldValue("ts_papers.papers_code");
    	var restriction=new Ab.view.Restriction();
		restriction.addClause("ts_doc_center.target_id", id,"=");
		restriction.addClause("ts_doc_center.table_name", "ts_papers","=");
		this.fileupload.refresh(restriction);
	},
	
	fileupload_afterRefresh:function(){
	        this.fileupload.gridRows.each(function(row){
	            var record = row.getRecord();
				var downLink=record.getValue('ts_doc_center.doc_download');
				var downName=record.getValue('ts_doc_center.doc_name');
				var docId=record.getValue('ts_doc_center.doc_id');
		    	var cellElement = document.createElement('td');
				var param={'downLink':downLink,'name':downName};
				var imgElement=document.createElement('img');
				imgElement.src="/archibus/schema/ab-products/space/inv/sch/fileDownLoad/img/ab-icon-download.png";
				addEventHandler(imgElement,'click',download,param);
				var imgElement2=document.createElement('img');
				imgElement2.src="/archibus/schema/ab-products/space/inv/sch/fileDownLoad/img/ab-icon-task-cancel.png";
				var param2={'downLink':downLink,'name':deleteFileOnServer,'docId':docId};
				addEventHandler(imgElement2,'click',deleteFileOnServer,param2);
				cellElement.appendChild(imgElement);
				cellElement.appendChild(imgElement2);
		        row.dom.appendChild(cellElement);
	        });
    },
    gridPanel_afterRefresh:function(){
    	this.updateRowNumberForRptBaopan(this.gridPanel);
    },
	/**
     * update the column of xu hao 
     */
    updateRowNumberForRptBaopan: function(panel){
		var rowNumber = 0;
		var rows = panel.rows;
		for (var i=0;i<rows.length;i++){
			var row =rows[i];
			rowNumber++;
			panel.gridRows.items[i].cells.items[0].dom.innerHTML =rowNumber;
		}	
     }
});