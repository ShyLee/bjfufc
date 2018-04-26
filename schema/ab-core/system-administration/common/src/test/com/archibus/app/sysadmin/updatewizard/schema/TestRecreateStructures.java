package com.archibus.app.sysadmin.updatewizard.schema;

import java.io.File;
import java.util.List;

import com.archibus.app.sysadmin.updatewizard.schema.job.RecreateStructuresJob;
import com.archibus.app.sysadmin.updatewizard.schema.sqlfile.SqlFileSearch;
import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;

/**
 * 
 * @author Catalin Purice
 * 
 */
public class TestRecreateStructures extends DataSourceTestBase {
    
    /**
     * Sybase.
     */
    private static final String SYBASE = "sybase";
    
    /**
     * Oracle.
     */
    private static final String ORACLE = "oracle";
    
    /**
     * Sql Server.
     */
    private static final String MSSQL = "sqlserver";
    
    /**
     * Schema.
     */
    private static final String SCHEMA = "schema";
    
    /**
     * Test sql file finder.
     */
    public void testFindOracleSqlFiles() {
        final SqlFileSearch fileSearch = new SqlFileSearch(ORACLE);
        final String rootPath =
                ContextStore.get().getWebAppPath().toString() + File.separator + SCHEMA;
        final File dir = new File(rootPath);
        final List<File> sqlFiles = fileSearch.search(dir).getFindedFiles();
        assertEquals(false, sqlFiles.isEmpty());
        for (final File sqlFile : sqlFiles) {
            assertEquals(true, sqlFile.getName().contains(ORACLE));
        }
    }
    
    /**
     * Test sql file finder.
     */
    public void testFindMsSqlSqlFiles() {
        final SqlFileSearch fileSearch = new SqlFileSearch(MSSQL);
        final String rootPath =
                ContextStore.get().getWebAppPath().toString() + File.separator + SCHEMA;
        final File dir = new File(rootPath);
        final List<File> sqlFiles = fileSearch.search(dir).getFindedFiles();
        assertEquals(false, sqlFiles.isEmpty());
        for (final File sqlFile : sqlFiles) {
            assertEquals(true, sqlFile.getName().contains(MSSQL));
        }
    }
    
    /**
     * Test sql file finder.
     */
    public void testFindSybaseSqlFiles() {
        final SqlFileSearch fileSearch = new SqlFileSearch(SYBASE);
        final String rootPath =
                ContextStore.get().getWebAppPath().toString() + File.separator + SCHEMA;
        final File dir = new File(rootPath);
        final List<File> sqlFiles = fileSearch.search(dir).getFindedFiles();
        assertEquals(false, sqlFiles.isEmpty());
        for (final File sqlFile : sqlFiles) {
            assertEquals(true, sqlFile.getName().contains(SYBASE));
        }
    }
    
    /**
     * Runs recreate structures job.
     */
    public void testRecreateStructures() {
        final RecreateStructuresJob job = new RecreateStructuresJob();
        job.run();
    }
}
