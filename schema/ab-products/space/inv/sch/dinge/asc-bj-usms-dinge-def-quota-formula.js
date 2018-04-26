var abDefineFormulaController = View.createController('abDefineFormulaController', {
	currentLevel:null,
    tabs:null,
	firstFormulaPanel:null,
	secondFormulaPanel:null,
	thirdFormulaPanel:null,
    afterViewLoad: function(){
		   this.defineFormulaTree.createRestrictionForLevel = createRestrictionForLevel;
    },
	afterInitialDataFetch: function(){
		this.firstFormulaPanel=this.parentFormulaForm;
		this.secondFormulaPanel=this.subFormulaForm;
		this.thirdFormulaPanel=this.thirdFormulaForm;
		this.tabs= View.getControl('','defineFormula');
        var tabs = View.panels.get("defineFormula");
        tabs.addEventListener('afterTabChange', this.afterTabChange.createDelegate(this));
	},	
	afterTabChange :function(tabPanel, selectedTabName, newTabName){
	},
	getRecord:function(panel,level){
		var parent=panel.getFieldValue('sc_dinge_formula.formula_parent');
	    var formulaId=panel.getFieldValue('sc_dinge_formula.formula_id');
		var formulaCode=panel.getFieldValue('sc_dinge_formula.formula_code');
		var formualDesc=panel.getFieldValue('sc_dinge_formula.formula_desc');
		var formualNote=panel.getFieldValue('sc_dinge_formula.formula_notes');
		var record = new Ab.data.Record(); 
		if(formulaId==''){
			 View.showMessage('公式编号不能为空');
			return false;
		}else{
			    if(parent!=''){
					record.setValue('sc_dinge_formula.formula_parent', parent);
				}
				if(typeof level != 'undefined'){
					   record.setValue('sc_dinge_formula.formula_level', level);
				}
			
			   record.setValue('sc_dinge_formula.formula_id', formulaId);
			   record.setValue('sc_dinge_formula.formula_code', formulaCode);
			   record.setValue('sc_dinge_formula.formula_desc', formualDesc);
			   record.setValue('sc_dinge_formula.formula_notes', formualNote);
		}
		return record;
	}, 
    parentFormulaForm_onSave: function(){
    	this.parentFormulaForm.save();
		this.defineFormulaTree.refresh();
    },
	subFormulaForm_onSave:function(){
		this.subFormulaForm.save();
	    this.defineFormulaTree.refresh();
	
	},
	thirdFormulaForm_onSave:function(){
		this.thirdFormulaForm.save();
		this.defineFormulaTree.refresh();
		
	},
	saveRecord:function(Obj){
		var ds= View.dataSources.get("defineDingEDs")
		if(Obj.isNew==true){
			ds.saveRecord(Obj.Record);
			 View.showMessage('保存成功');
		}
		
		if(Obj.isNew==false){
				var restriction={"sc_dinge_formula.formula_id":Obj.Record.formula_id};
				var record=ds.getRecord(restriction);
				ds.saveRecord(record);
				 View.showMessage('更新成功');
		}
	
	},
	afterSaveParentLevel:function(Obj){
		var re = /[@#\$%\^&\*\-\%]+/g ;
		if (!re.test(Obj.Record.getValue('sc_dinge_formula.formula_code'))) {
			var formulaCode = Obj.Record.getValue('sc_dinge_formula.formula_code');
			var parentNodeId = Obj.Record.getValue('sc_dinge_formula.formula_id');
			var arr = formulaCode.split("\+");
			for (var i = 0; i < arr.length; i++) {
				var record = new Ab.data.Record();
				record.setValue('sc_dinge_formula.formula_id', arr[i]);
				record.setValue('sc_dinge_formula.formula_parent', parentNodeId);
			    var obj={'Record':record,'isNew':true,'level':2}
				this.saveRecord(obj);
			}
		}
	},
	defineFormula_afterTabChange:function(tabPanel, currentTabName, newTabName){
	}
	
});

function onTreeClick(){
	   var curTreeNode = View.panels.get("defineFormulaTree").lastNodeClicked;
	   var formulaId=curTreeNode.data['sc_dinge_formula.formula_id']
   	   res={'sc_dinge_formula.formula_id':formulaId};
	      var tabs=abDefineFormulaController.tabs;
	   if(curTreeNode.level.levelIndex==0){
        var nextTab=tabs.findTab('parentFormula');
        nextTab.loadView();
        tabs.selectTab('parentFormula');
		abDefineFormulaController.firstFormulaPanel.refresh(res)	
	   }
	   if(curTreeNode.level.levelIndex==1){
	   	 var nextTab=tabs.findTab('subFormula');
        nextTab.loadView();
        tabs.selectTab('subFormula');
		abDefineFormulaController.secondFormulaPanel.refresh(res)
	   	
	   }
	   if(curTreeNode.level.levelIndex==2){
	   	 var nextTab=tabs.findTab('thirdFormula');
        nextTab.loadView();
        tabs.selectTab('thirdFormula');	
		abDefineFormulaController.thirdFormulaPanel.refresh(res)
	   	
	   }
}


function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        if (level == 0) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('sc_dinge_formula.formula_parent','','IS NULL');
        }
        if (level == 1||level==2) {
			 var formulaId = parentNode.data['sc_dinge_formula.formula_id'];
            if (formulaId) {
				restriction = new Ab.view.Restriction();
				restriction.addClause('sc_dinge_formula.formula_parent', formulaId, '=');
            }
        }
		
    }
    return restriction;
}
