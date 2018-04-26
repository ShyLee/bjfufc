/**
 * 
 */
var abScDefUnitController = View.createController('abScDefUnit', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    //Operation Type // "INSERT", "UPDATE", "DELETE"
    operType: "",
    
    //Operaton Data Type //'BUSINESSUNIT', 'DIVISION','DEPARTMENT'
    operDataType: "",
    
    businessUnitChanged: false,
	
	afterViewLoad: function(){
        this.bu_tree.addParameter('dvId', "IS NOT NULL");
        this.bu_tree.addParameter('dpId', "IS NOT NULL");
        this.bu_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
	
	sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
        this.bu_detail.show(false);
        this.dv_detail.show(false);
        this.dp_detail.show(false);
    },
	
	bu_detail_onSave: function(){
		this.operDataType = "POST";
		var panel = View.panels.get('bu_detail');
		panel.save();
		var parentNode = getParentNode('bu_tree',getMessage("selectTreeNode"),this.operDataType,this);
		commonRefresh(panel,'bu_tree',parentNode);
    },
	bu_detail_onDelete: function(){
        this.operDataType = "POST";
		var parentNode = getParentNode('bu_tree',getMessage("selectTreeNode"),this.operDataType,this);
        AUSC_commonDelete("abScDefUnitFormDs", "bu_detail", "bu.bu_id","bu_tree",parentNode);
    },
	dv_detail_onSave: function(){
		this.operDataType = "POSTLEVEL";
        var panel = View.panels.get('dv_detail');
		panel.save();
		var parentNode = getParentNode('bu_tree',getMessage("selectTreeNode"),this.operDataType,this);
		commonRefresh(panel,'bu_tree',parentNode);
    },
	dv_detail_onDelete: function(){
        this.operDataType = "POSTLEVEL";
		var formPanel = View.panels.get('dv_detail');
		var parentNode = getParentNode('bu_tree',getMessage("selectTreeNode"),this.operDataType,this);
        AUSC_commonDelete("abScDefDivisionFormDs", "dv_detail", "dv.dv_id","bu_tree",parentNode);
    },
	dp_detail_onSave: function(){
		this.operDataType = "POSTION";
        var panel = View.panels.get('dp_detail');
		panel.save();
		var parentNode = getParentNode('bu_tree',getMessage("selectTreeNode"),this.operDataType,this);
		commonRefresh(panel,'bu_tree',parentNode);
    },
	dp_detail_onDelete: function(){
        this.operDataType = "POSTION";
		var formPanel = View.panels.get('dp_detail');
		var parentNode = getParentNode('abScDefUnitTree',getMessage("selectTreeNode"),this.operDataType,this);
			AUSC_commonDelete("abScDefDepartmenFormtDs", "dp_detail", "dp.dp_id", "bu_tree", parentNode);
	},
	
	afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        this.treeview = View.panels.get('bu_tree');
    },
	
	dv_detail_onUpdate: function(){
       updateStaticFieldAboutEmOrRm();
        
    },
    
	showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newUnit = getMessage("Unit");
		var menutitle_newDivision = getMessage("Division");
        var menutitle_newDepartment = getMessage("Department");
        
        menuItems.push({
            text: menutitle_newUnit,
            handler: this.onAddNewButtonPush.createDelegate(this, ['UNIT'])
        });
        menuItems.push({
            text: menutitle_newDivision,
            handler: this.onAddNewButtonPush.createDelegate(this, ['DIVISION'])
        });
		menuItems.push({
            text: menutitle_newDepartment,
            handler: this.onAddNewButtonPush.createDelegate(this, ['DEPARTMENT'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },

	onAddNewButtonPush: function(menuItemId){
        var bu_id = "";
        var dv_id = "";
        var nodeLevelIndex = -1;
        if (valueExists(this.curTreeNode)) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    bu_id = this.curTreeNode.data["bu.bu_id"];
                    break;
                case 1:
                    bu_id = this.curTreeNode.data["dv.bu_id"];
                    dv_id = this.curTreeNode.data["dv.dv_id"];
                    break;
				case 2:
                    bu_id = this.curTreeNode.data["dv.bu_id"];
                    dv_id = this.curTreeNode.data["dp.dv_id"];
                    break;
            }
        }
        
        this.operDataType = menuItemId;
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "UNIT":
                this.unitDetailTabs.selectTab("buTab", null, true, false, false);
                break;
            case "DIVISION":
			    if (nodeLevelIndex == -1) {
                    View.showMessage('请选择单位类型');
                    return;
                }
                restriction.addClause("dv.bu_id", bu_id, '=');
                this.unitDetailTabs.selectTab("dvTab", restriction, true, false, false);
                break;
			case "DEPARTMENT":
			    if (nodeLevelIndex == 0 || nodeLevelIndex == -1) {
                    View.showMessage('请选择使用单位');
                    return;
                }
                restriction.addClause("dp.dv_id", dv_id, '=');
                this.unitDetailTabs.selectTab("dpTab", restriction, true, false, false);
                break;
        }
    },
	
	refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        
        var buId = consolePanel.getFieldValue('dv.bu_id');
        if (buId) {
            this.bu_tree.addParameter('buId', " bu.bu_id ='" + buId + "'");
            this.bu_tree.addParameter('buOfNullDv', " bu.bu_id ='" + buId + "'");
            this.bu_tree.addParameter('buOfNullDp', " bu.bu_id ='" + buId + "'");
        }
        else {
            this.bu_tree.addParameter('buId', " 1=1 ");
            this.bu_tree.addParameter('buOfNullDv', " 1=1 ");
            this.bu_tree.addParameter('buOfNullDp', " 1=1 ");
        }
        
        
        var dvId = consolePanel.getFieldValue('dv.dv_id');
        if (dvId) {
            this.bu_tree.addParameter('dvId', " = '" + dvId + "'");
            this.bu_tree.addParameter('dvOfNullDp', " dv.dv_id ='" + dvId + "'");
            this.bu_tree.addParameter('buOfNullDv', " 1=0 ");
        }
        else {
            this.bu_tree.addParameter('dvId', "IS NOT NULL");
            this.bu_tree.addParameter('dvOfNullDp', " 1=1 ");
        }
        
        var dpId = consolePanel.getFieldValue('dp.dp_id');
        if (dpId) {
            this.bu_tree.addParameter('dpId', " = '" + dpId + "'");
            this.bu_tree.addParameter('buOfNullDv', " 1=0 ");
            this.bu_tree.addParameter('dvOfNullDp', " 1=0 ");
        }
        else {
            this.bu_tree.addParameter('dpId', "IS NOT NULL");
        }
        
        
        this.bu_tree.refresh();
        this.curTreeNode = null;
    }
	
   
})


/*
 * 
 */

function onBusinessUnitClick(){
    var curTreeNode = View.panels.get("bu_tree").lastNodeClicked;
    var bu_id = curTreeNode.data['bu.bu_id'];
    View.controllers.get('abScDefUnit').curTreeNode = curTreeNode;
    if (!bu_id) {
        View.panels.get("bu_detail").show(false);
        View.panels.get("dv_detail").show(false);
		View.panels.get("dp_detail").show(false);
    }
    else {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("bu.bu_id", bu_id, '=');
        View.panels.get('unitDetailTabs').selectTab("buTab", restriction, false, false, false);
    }
}

function onTreeviewClick(){
    View.controllers.get('abScDefUnit').curTreeNode = View.panels.get("bu_tree").lastNodeClicked;
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'bu_tree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var buName = treeNode.data['bu.name'];
        var buCode = treeNode.data['bu.bu_id'];
        
        if (!buCode) {
            labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + getMessage("noBusinessUnit") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var dvName = treeNode.data['dv.name'];
        var dvCode = treeNode.data['dv.dv_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + dvCode + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + dvName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var deptName = treeNode.data['dp.name'];
        var deptCode = treeNode.data['dp.dp_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + deptCode + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + deptName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        if (level == 1) {
            var buId = parentNode.data['bu.bu_id'];
            if (!buId) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('dv.bu_id', '', 'IS NULL', 'AND', true);
            }
            else {
                restriction = new Ab.view.Restriction();
                restriction.addClause('dv.bu_id', buId, '=', 'AND', true);
            }
        }
        
    }
    return restriction;
}
function setPattern(){
	View.hpatternPanel = View.panels.get('dv_detail');
	View.hpatternField = 'dv.hpattern_acad';
    View.patternString = View.hpatternPanel.getFieldValue('dv.hpattern_acad');
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}
