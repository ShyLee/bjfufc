function showFundsPanel(grid){
	var zdbh=grid.restriction["sc_parcelland.land_code"];
	var panel=View.panels.get('assetGrid');
	var restriction = new Ab.view.Restriction();
	restriction.addClause("asset_source.bl_id",zdbh,'=');
	panel.refresh(restriction);
}
	
function setPattern(){
    View.hpatternPanel = View.panels.get('ascBjUsmsDefDataLandCatForm');
    View.hpatternField = 'sc_parcelland.hpattern_acad';
    View.patternString = View.hpatternPanel.getFieldValue('sc_parcelland.hpattern_acad');
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}
 