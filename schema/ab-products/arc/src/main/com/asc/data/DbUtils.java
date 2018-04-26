package com.asc.data;

import java.sql.Connection;

import javax.sql.DataSource;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class DbUtils extends EventHandlerBase {
    private static final EventHandlerContext context;
    
    private static Connection connection;
    static {
        context = ContextStore.get().getEventHandlerContext();
    }
    
    public static Connection getConnection() throws Exception {
        final com.archibus.config.Database.Immutable db = getDatabase(context);
        if (null == connection || connection.isClosed()) {
            connection = db.getDataSource().getConnection();
            return connection;
        } else {
            return connection;
        }
        
    }
    
    public static DataSource getDataSource() {
        final com.archibus.config.Database.Immutable db = getDatabase(context);
        return db.getDataSource();
    }
}
