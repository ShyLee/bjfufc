function AUSC_AddRowNum(panel){
    var rowNumber = 0;
    var rows = panel.rows;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        rowNumber++;
        panel.gridRows.items[i].cells.items[0].dom.innerHTML = rowNumber;
    }
}

function AUSC_deleteRecord(dataSource, record){
    for (var i = 0; i<record.length; i++) {
        dataSource.deleteRecord(record[i]);
    }
    
}
