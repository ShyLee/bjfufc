/**
 * 
 */
var abScDefPostController = View.createController('abScDefPost', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    //Operation Type // "INSERT", "UPDATE", "DELETE"
    operType: "",
    
    //Operaton Data Type //'BUSINESSUNIT', 'DIVISION','DEPARTMENT'
    operDataType: "",
    
    businessUnitChanged: false,
	
	
	
	abScDefPostLevelForm_onSave: function(){
		this.operDataType = "POST";
        var panel = View.panels.get('abScDefPostLevelForm');
		panel.save();
		var parentNode = getParentNode('abScDefPostTree',getMessage("selectTreeNode"),this.operDataType,this);
		commonRefresh(panel,'abScDefPostTree',parentNode);
    },
	abScDefPostLevelForm_onDelete: function(){
        this.operDataType = "POST";
		var formPanel = View.panels.get('abScDefPostLevelForm');
		var parentNode = getParentNode('abScDefPostTree',getMessage("selectTreeNode"),this.operDataType,this);
        AUSC_commonDelete("abScDefPostLevelDs", "abScDefPostLevelForm", "sc_zw_jb.zw_jb_id","abScDefPostTree",parentNode);
    },
	abScDefPostionForm_onSave: function(){
		this.operDataType = "POSTLEVEL";
        var panel = View.panels.get('abScDefPostionForm');
       
		panel.save();
		
		var parentNode = getParentNode('abScDefPostTree',getMessage("selectTreeNode"),this.operDataType,this);
		commonRefresh(panel,'abScDefPostTree',parentNode);
    },
	abScDefPostionForm_onDelete: function(){
        this.operDataType = "POSTLEVEL";
		var formPanel = View.panels.get('abScDefPostionForm');
		var parentNode = getParentNode('abScDefPostTree',getMessage("selectTreeNode"),this.operDataType,this);
        AUSC_commonDelete("abScDefPostionDs", "abScDefPostionForm", "sc_zw.zw_id","abScDefPostTree",parentNode);
        this.AUSC_commonDelete("abScDefPostionDs", "abScDefPostionForm", "sc_zw.zw_id");
    },

	afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        this.treeview = View.panels.get('abScDefPostTree');
    },
	
	showMenu: function(e, item){
        var menuItems = [];
       
		var menutitle_newPostion = getMessage("Postion");
        var menutitle_newPostLevel = getMessage("PostLevel");
       
        menuItems.push({
            text: menutitle_newPostLevel,
            handler: this.onAddNewButtonPush.createDelegate(this, ['POSTLEVEL'])
        });
		menuItems.push({
            text: menutitle_newPostion,
            handler: this.onAddNewButtonPush.createDelegate(this, ['POSTION'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },

	onAddNewButtonPush: function(menuItemId){
        var gangweijibie_id = "";
//        var gangweijibie_name = "";
        var nodeLevelIndex = -1;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    gangweijibie_id = this.curTreeNode.data["sc_zw_jb.zw_jb_id"];
//                    gangweijibie_name = this.curTreeNode.data["sc_zw_jb.zc_jb_name"];
                    break;
                case 1:
                    gangweijibie_id = this.curTreeNode.data["sc_zw.zw_jb_id"];
                    break;
            }
        }
        
        this.operDataType = menuItemId;
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "POSTLEVEL":
                this.postDetailTabs.selectTab("postLevelTab", null, true, false, false);
                break;
			case "POSTION":
				 if (nodeLevelIndex == -1) {
	                    View.showMessage('请选择职务级别');
	                    return;
	                }
                restriction.addClause("sc_zw.zw_jb_id", gangweijibie_id, '=');
                this.postDetailTabs.selectTab("postionTab", restriction, true, false, false);
                break;
        }
    }
    
    //----------------event handle--------------------
   
})


/*
 * set the global variable 'curTreeNode' in controller 'defDvDp'
 */

function onBusinessUnitClick(){
    var curTreeNode = View.panels.get("abScDefPostTree").lastNodeClicked;
    var zhic_bz_id = curTreeNode.data['sc_zw_jb.zw_jb_id'];
    View.controllers.get('abScDefPost').curTreeNode = curTreeNode;
    if (!zhic_bz_id) {
        View.panels.get("abScDefPostLevelForm").show(false);
        View.panels.get("abScDefPostionForm").show(false);
    }
    else {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_zw_jb.zw_jb_id", zhic_bz_id, '=');
        View.panels.get('postDetailTabs').selectTab("postLevelTab", restriction, false, false, false);
    }
}

function onTreeviewClick(){
    View.controllers.get('abScDefPost').curTreeNode = View.panels.get("abScDefPostTree").lastNodeClicked;
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScDefPostTree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
    	var scGangweijibieCode = treeNode.data['sc_zw_jb.zw_jb_id'];
         var scGangweijibieName = treeNode.data['sc_zw_jb.zw_jb_name'];
        if(!scGangweijibieCode){
	        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + getMessage("noStanderZhic") + "</span> ";
	        treeNode.setUpLabel(labelText1);
        }
    }
    
    if (treeNode.level.levelIndex == 1) {
        var sc_zhiwuCode = treeNode.data['sc_zw.zw_id'];
        var sc_zhiwuName = treeNode.data['sc_zw.zw_name'];
        
//        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + sc_zhiwuCode + "</span> ";
//        treeNode.setUpLabel(labelText1);
    }
}