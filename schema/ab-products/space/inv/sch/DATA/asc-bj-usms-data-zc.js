var zcController = View.createController('zcController',{
	edit:function(){
		var selectedIndex = this.zcPanel.selectedRowIndex;
		var id = this.zcPanel.rows[selectedIndex]["sc_zc.zc_id"];
		var name = this.zcPanel.rows[selectedIndex]["sc_zc.zc_name"];
		var res = new  Ab.view.Restriction();
		res.addClause("sc_zc.zc_id",id,"=");
		this.zcForm.refresh(res);
		this.zcForm.showInWindow({
		    x: 600, 
		    y: 600, 
		    width: 600, 
		    height: 300,
		    closeButton: false 
		});
	},
	zcForm_onSave:function(){
		if(!this.zcForm.canSave()){
			return;
		}
		this.zcForm.save();
        this.zcPanel.refresh();
        this.zcForm.closeWindow();
	},
	zcForm_onClear:function(){
		this.zcForm.setFieldValue("sc_zc.zc_jb_id","");
		this.zcForm.setFieldValue("sc_zc_jb.zc_jb_name","");
		this.zcForm.setFieldValue("sc_zc_jb.area_zf_std","");
		this.zcForm.setFieldValue("sc_zc_jb.amount_wf_std","");
	}
});