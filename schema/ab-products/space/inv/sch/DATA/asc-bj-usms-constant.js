/**
 * @author kevenxi
 */
/*************************常量定义*****************************/
var ascBjUsmsConstantControl = View.createController('ascBjUsmsConstantControl', {

    /**单位类型**/
    
    BU_CLASS_JXKY: "2",//教学科研类
    BU_CLASS_DZGL: "1",//党政管理类
    BU_CLASS_GGZY: "4",//公共资源类
    BU_CLASS_QT: "6",//其他类
    
    
    
    AUSC_DvIsJXKY: function(buId){
		var parameters = {
			tableName: 'bu',
			fieldNames: toJSON(['bu.bu_class']),
			restriction: "bu.bu_id ='" + buId + "'"
		};
		
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		if (result.data.records.length > 0) {
			var bu_class = result.data.records[0]['bu.bu_class.raw'];
			if ((bu_class == this.BU_CLASS_JXKY)) {
				return true;
			}
			else {
				return false;
			}
		}else{
			return false;
		}
	}
    
})
