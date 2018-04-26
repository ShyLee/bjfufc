package com.asc.data;

import java.sql.*;

import com.archibus.eventhandler.EventHandlerBase;

public class SyncHRDataPub extends EventHandlerBase {
    public SyncHRDataPub() {
        
    }
    
    public static void sync() {
        syncFetchHRInfo();
        syncUpdateHRInfo();
        // 同步职工住房档案数据
        final ZfEmIdManager manager = new ZfEmIdManager();
        // 插入新增员工
        manager.generateZfArchiveFromEm();
        // 更新已有员工信息
        manager.updateZfEmInfoFromEm();
        
    }
    
    public static void syncFetchHRInfo() {
        Connection conn = null;
        final Statement stat = null;
        try {
            conn = DbUtils.getConnection();
            final CallableStatement st = conn.prepareCall("{call update_em_from_hr}");
            st.execute();
            conn.commit();
        } catch (final Exception e) {
            e.printStackTrace();
        } finally {
            
            try {
                
                if (stat != null) {
                    stat.close();
                }
                if (conn != null) {
                    conn.close();
                }
            } catch (final SQLException e) {
                e.printStackTrace();
                throw new RuntimeException("更新不成功");
            }
        }
    }
    
    public static void syncUpdateHRInfo() {
        Connection conn = null;
        final Statement stat = null;
        try {
            conn = DbUtils.getConnection();
            final CallableStatement st = conn.prepareCall("{call FETCH_EM_TX_FROM_HR}");
            st.execute();
            conn.commit();
        } catch (final Exception e) {
            e.printStackTrace();
        } finally {
            
            try {
                
                if (stat != null) {
                    stat.close();
                }
                if (conn != null) {
                    conn.close();
                }
            } catch (final SQLException e) {
                e.printStackTrace();
                throw new RuntimeException("更新不成功");
            }
        }
    }
    
    public static void syncZCJL() {
        Connection conn = null;
        final Statement stat = null;
        try {
            conn = DbUtils.getConnection();
            final CallableStatement st = conn.prepareCall("{call FETCH_ZCJL_FROM_HR}");
            st.execute();
            conn.commit();
        } catch (final Exception e) {
            e.printStackTrace();
            throw new RuntimeException("更新不成功");
        } finally {
            
            try {
                
                if (stat != null) {
                    stat.close();
                }
                if (conn != null) {
                    conn.close();
                }
            } catch (final SQLException e) {
                e.printStackTrace();
            }
        }
        
    }
    
    public static void syncZWJL() {
        Connection conn = null;
        final Statement stat = null;
        try {
            conn = DbUtils.getConnection();
            final CallableStatement st = conn.prepareCall("{call FETCH_ZWJL_FROM_HR}");
            st.execute();
            conn.commit();
        } catch (final Exception e) {
            e.printStackTrace();
        } finally {
            
            try {
                
                if (stat != null) {
                    stat.close();
                }
                if (conn != null) {
                    conn.close();
                }
            } catch (final SQLException e) {
                e.printStackTrace();
                throw new RuntimeException("更新不成功");
            }
        }
    }
}
