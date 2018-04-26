var zwController = View.createController('zwController',{
	edit:function(){
		var selectedIndex = this.zwPanel.selectedRowIndex;
		var id = this.zwPanel.rows[selectedIndex]["sc_zw.zw_id"];
		var name = this.zwPanel.rows[selectedIndex]["sc_zw.zw_name"];
		var res = new  Ab.view.Restriction();
		res.addClause("sc_zw.zw_id",id,"=");
		this.zwForm.refresh(res);
		this.zwForm.showInWindow({
		    x: 600, 
		    y: 600, 
		    width: 600, 
		    height: 300,
		    closeButton: false 
		});
	},
	zwForm_onSave:function(){
		if(!this.zwForm.canSave()){
			return;
		}
		this.zwForm.save();
		this.zwForm.closeWindow();
        this.zwPanel.refresh();
	},
	zwForm_onClear:function(){
		this.zwForm.setFieldValue("sc_zw.zw_jb_id","");
		this.zwForm.setFieldValue("sc_zw_jb.zw_jb_name","");
		this.zwForm.setFieldValue("sc_zw_jb.area_zf_std","");
		this.zwForm.setFieldValue("sc_zw_jb.amount_wf_std","");
	}
});