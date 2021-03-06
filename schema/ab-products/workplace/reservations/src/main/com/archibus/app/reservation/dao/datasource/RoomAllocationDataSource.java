package com.archibus.app.reservation.dao.datasource;

import java.sql.Time;
import java.util.*;

import com.archibus.app.reservation.dao.*;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.util.DataSourceUtils;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.LocalDateTimeUtil;

/**
 * The Class RoomAllocationDataSource.
 * 
 * @author Bart Vanderschoot
 */
public class RoomAllocationDataSource extends AbstractAllocationDataSource<RoomAllocation>
        implements IRoomAllocationDataSource {
    
    /** roomArrangementDataSource roomArrangementDataSource. */
    private IRoomArrangementDataSource roomArrangementDataSource;
    
    /**
     * Instantiates a new room allocation data source.
     */
    public RoomAllocationDataSource() {
        this("roomAllocation", "reserve_rm");
    }
    
    /**
     * Instantiates a new room allocation data source.
     * 
     * @param beanName the bean name
     * @param tableName the table name
     */
    protected RoomAllocationDataSource(final String beanName, final String tableName) {
        super(beanName, tableName);
    }
    
    /**
     * {@inheritDoc}
     * <p>
     * Suppress warning "PMD.UselessOverridingMethod" in this method.
     * <p>
     * Justification: required to prevent runtime exception (java.lang.AbstractMethodError) with
     * specific Java 5 class files on a Java 6 runtime.
     */
    @SuppressWarnings("PMD.UselessOverridingMethod")
    @Override
    public void cancel(final RoomAllocation allocation) throws ReservationException {
        super.cancel(allocation);
    }
    
    /**
     * {@inheritDoc}
     */
    public final void checkCancelling(final RoomAllocation allocation) throws ReservationException {
        // get the roomArrangement
        final RoomArrangement roomArrangement =
                this.roomArrangementDataSource.get(allocation.getBlId(), allocation.getFlId(),
                    allocation.getRmId(), allocation.getConfigId(), allocation.getArrangeTypeId());
        
        final Integer cancelDays = roomArrangement.getCancelDays();
        final Time cancelTime = roomArrangement.getCancelTime();
        
        // @translatable
        checkStatusAndTimeAhead(allocation, cancelDays, cancelTime,
            "The reservation cannot be cancelled.");
    }
    
    /** {@inheritDoc} */
    public void calculateCancellationCost(final RoomAllocation allocation) {
        calculateCancellationCost(allocation, this.roomArrangementDataSource.get(
            allocation.getBlId(), allocation.getFlId(), allocation.getRmId(),
            allocation.getConfigId(), allocation.getArrangeTypeId()));
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomAvailability> getRoomAvailabilities(
            final List<RoomArrangement> roomArrangements, final Date startDate, final Date endDate) {
        final List<RoomAvailability> roomAvailibilities = new ArrayList<RoomAvailability>();
        
        for (final RoomArrangement roomArrangement : roomArrangements) {
            final RoomAvailability roomAvailibility =
                    new RoomAvailability(roomArrangement.getRoom(), startDate, endDate);
            // get allocations for this roomArrangement
            roomAvailibility.setRoomAllocations(getRoomAllocations(roomArrangement.getBlId(),
                roomArrangement.getFlId(), roomArrangement.getRmId(), startDate, endDate));
            roomAvailibilities.add(roomAvailibility);
        }
        
        return roomAvailibilities;
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomAllocation> getRoomAllocations(final IReservation reservation) {
        return this.find(reservation);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomAllocation> getRoomAllocations(final String blId, final String flId,
            final String rmId, final Date startDate) {
        return getRoomAllocations(blId, flId, rmId, startDate, null);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomAllocation> getRoomAllocations(final String blId, final String flId,
            final String rmId, final Date startDate, final Date endDate) {
        final List<DataRecord> records = getAllocationRecords(startDate, endDate, blId, flId, rmId);
        
        return convertRecordsToObjects(records);
    }
    
    /**
     * Calculate the total cost for the allocation.
     * 
     * @param allocation room allocation
     */
    public void calculateCost(final RoomAllocation allocation) {
        
        final IReservable reservable =
                this.roomArrangementDataSource.get(allocation.getBlId(), allocation.getFlId(),
                    allocation.getRmId(), allocation.getConfigId(), allocation.getArrangeTypeId());
        
        final double units = getCostUnits(allocation, reservable);
        
        // TODO: check on external
        final double costPerUnit = reservable.getCostPerUnit();
        // calculate cost and round to 2 decimals
        final double cost = DataSourceUtils.round2(costPerUnit * units);
        
        allocation.setCost(cost);
    }
    
    /**
     * Check editing.
     * 
     * @param allocation the allocation
     * @throws ReservationException the reservation exception
     *             <p>
     *             Suppress warning avoid final local variable
     *             <p>
     *             Justification: Turning local variable into field is not usefull
     */
    @SuppressWarnings({ "PMD.AvoidFinalLocalVariable" })
    public final void checkEditing(final RoomAllocation allocation) throws ReservationException {
        
        // get the roomArrangement
        final RoomArrangement roomArrangement =
                this.roomArrangementDataSource.get(allocation.getBlId(), allocation.getFlId(),
                    allocation.getRmId(), allocation.getConfigId(), allocation.getArrangeTypeId());
        
        final Integer announceDays = roomArrangement.getAnnounceDays();
        final Time announceTime = roomArrangement.getAnnounceTime();
        
        // @translatable
        final String errorMessage = "The reservation cannot be modified.";
        checkStatusAndTimeAhead(allocation, announceDays, announceTime, errorMessage);
    }
    
    /**
     * Check the room allocation status and time ahead (i.e. the difference between the current time
     * and the time of the allocation) to determine whether the allocation can be modified or
     * cancelled.
     * 
     * @param allocation the room allocation to check
     * @param aheadDays minimum number of days before the allocation to allow changes
     * @param aheadTime minimum time before the allocation to allow changes
     * @param errorMessage the error message to use when generating an exception
     * @throws ReservationException when the status or time ahead is not OK
     */
    private void checkStatusAndTimeAhead(final RoomAllocation allocation, final Integer aheadDays,
            final Time aheadTime, final String errorMessage) throws ReservationException {
        final DataSource dataSource = this.createCopy();
        // get local time using the building location
        final Date localCurrentDate =
                TimePeriod.clearTime(LocalDateTimeUtil.currentLocalDate(null, null, null,
                    allocation.getBlId()));
        final Time localCurrentTime =
                LocalDateTimeUtil.currentLocalTime(null, null, null, allocation.getBlId());
        
        // check if room can be modified status
        dataSource.addRestriction(Restrictions.eq(this.tableName, Constants.RMRES_ID_FIELD_NAME,
            allocation.getId()));
        dataSource.addRestriction(Restrictions
            .sql(Constants.STATUS_AWAITING_APP_OR_STATUS_CONFIRMED));
        // make sure the date is before start date
        dataSource.addRestriction(Restrictions.gt(this.tableName, Constants.DATE_START_FIELD_NAME,
            localCurrentDate));
        
        final DataRecord record = dataSource.getRecord();
        
        if (record == null) {
            throw new ReservationException(errorMessage, RoomAllocationDataSource.class);
        }
        
        final long daysDifference = DataSourceUtils.getDaysDifference(allocation, localCurrentDate);
        
        // make sure the days before announcing / cancelling is respected
        if (aheadDays != null && daysDifference < aheadDays) {
            throw new ReservationException(errorMessage, RoomAllocationDataSource.class);
        }
        
        // make sure the announce / cancel time is respected
        if (aheadDays != null && aheadTime != null && daysDifference == aheadDays.longValue()
                && localCurrentTime.after(aheadTime)) {
            throw new ReservationException(errorMessage, RoomAllocationDataSource.class);
        }
    }
    
    /**
     * Create fields to properties mapping. To be compatible with version 19.
     * 
     * @return mapping
     */
    @Override
    protected final Map<String, String> createFieldToPropertyMapping() {
        // get super class mapping
        final Map<String, String> mapping = super.createFieldToPropertyMapping();
        
        mapping.put(this.tableName + ".rmres_id", "id");
        mapping.put(this.tableName + ".cost_rmres", "cost");
        mapping.put(this.tableName + ".config_id", "configId");
        mapping.put(this.tableName + ".rm_arrange_type_id", "arrangeTypeId");
        mapping.put(this.tableName + ".guests_external", "externalGuests");
        mapping.put(this.tableName + ".guests_internal", "internalGuests");
        
        return mapping;
    }
    
    /**
     * Setter for roomArrangementDataSource.
     * 
     * @param roomArrangementDataSource roomArrangementDataSource to set
     */
    public final void setRoomArrangementDataSource(
            final IRoomArrangementDataSource roomArrangementDataSource) {
        this.roomArrangementDataSource = roomArrangementDataSource;
    }
    
}
