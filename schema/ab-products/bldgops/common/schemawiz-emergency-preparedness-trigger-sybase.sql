--partialJobStatus=Emergency Preparedness Triggers

IF EXISTS(SELECT 1 FROM SYS.SYSTRIGGER WHERE trigger_name = 'system_status_t') DROP TRIGGER AFM.system_status_t;

CREATE TRIGGER AFM.system_status_t AFTER UPDATE OF recovery_status  ORDER 1 ON AFM.system_bl    REFERENCING NEW AS newsystem FOR EACH ROW BEGIN    DECLARE v_new_recovery_status CHAR(12);    IF newsystem.recovery_status = 'UNFIT-TEMP' OR newsystem.recovery_status = 'UNFIT-PERM' then        SET v_new_recovery_status='FIT-OFFLINE'    ELSE        SET v_new_recovery_status=newsystem.recovery_status    END IF;     UPDATE system_bl SET system_bl.recovery_status = v_new_recovery_status    WHERE system_bl.system_id = ANY (SELECT system_id_depend FROM system_dep                                  WHERE system_dep.system_id_master = newsystem.system_id                                  AND system_dep.propagate_status = 1)    AND system_bl.recovery_status NOT IN ('UNFIT-TEMP', 'UNFIT-PERM', v_new_recovery_status) END;
