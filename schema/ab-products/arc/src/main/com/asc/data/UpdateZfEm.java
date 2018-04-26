package com.asc.data;


public class UpdateZfEm {
    
    public void doUpdate() {
        final ZfEmIdManager manager = new ZfEmIdManager();
        // 插入新增员工
        // manager.generateZfArchiveFromEm();
        // 更新已有员工信息
        manager.updateZfEmInfoFromEm();
    }
    
    public void doInsert() {
        /*
         * for (int i = 0; i < dataRecords.length(); i++) { final DataRecord msdsDataRecord =
         * DataRecord.createRecordFromJSON(dataRecords.getJSONObject(i)); final String emId =
         * msdsDataRecord.getValue("em_minus_sczfem.em_id").toString();
         * 
         * final String sql =
         * "INSERT into sc_zf_em (em_id,xm, gzbm,sfzh, dv_id, zw_id, zc_id, em_type, email,date_come_sch) "
         * +
         * "SELECT em_id,name, gzbm,identi_code,dv_id,zw_id,zc_id,zaigangzhuangtai_id,email,date_work_begin FROM em WHERE em_id = '"
         * + emId + "'"; SqlUtils.executeUpdate("sc_zf_em", sql); SqlUtils.commit(); }
         */
        final ZfEmIdManager manager = new ZfEmIdManager();
        // 插入新增员工
        manager.generateZfArchiveFromEm();
    }
    
    /**
     * 从员工表中批量更新数据到住房档案表中 TODO batchUpdateZfEmFromEm.
     */
    public void batchUpdateZfEmFromEm() {
        final ZfEmIdManager manager = new ZfEmIdManager();
        // 插入新增员工
        manager.generateZfArchiveFromEm();
        // 更新已有员工信息
        manager.updateZfEmInfoFromEm();
    }
}
