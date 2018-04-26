/**
 * Handles events generated by the Preferences View
 * <p>
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('AppLauncher.controller.Preferences', {
	extend : 'Ext.app.Controller',

	requires : ['Common.util.ConfigFileManager',
                'Common.util.Environment'],

	config : {
        refs: {
            preferencesView: 'preferencesPanel',
            changeUrlPanel: 'changeUrlPanel'
        },
		control : {
			'button[action=displayPreferences]' : {
				tap : 'onDisplayPreferences'
			},
			'button[action=cancelPreferences]' : {
				tap : 'onCancelPreferences'
			},
            'button[action=resetWebCentralUrl]' : {
                tap: 'onResetWebCentralUrl'
            },
            'button[action=changeWebCentralUrl]' : {
                tap: 'onChangeWebCentralUrl'
            },
            'button[action=resetSyncHistory]' : {
                tap: 'onResetSyncHistory'
            }
		},

        baseUrl: '/schema/ab-products/common/mobile/',

        applicationUrl: '/AppLauncher/index.html',

        changeUrlMessage: ['Please verify that the entered URL is for an operational Web Central',
                           ' instance. Entering an invalid URL may cause the application to stop ',
                           'responding.<br>If the applciation stops responding, stop and re-start the',
                           ' application. You will be given the option to reset the URL when the application',
                           ' re-starts.<br>Do you wish to continue?'].join(''),

        backgroundSyncResetMessage: ['The background data sync flag will be reset.<br>',
                                     'The background data will be downloaded during',
                                     ' the next application sync.',
                                     '<br>Do you wish to continue?'].join('')
	},

    /**
     * Displays the Preferences view. Populates the view field values.
     */
	onDisplayPreferences : function() {
        var me = this,
            profile = me.getApplication().getCurrentProfile().getNamespace(),
            isInSsoMode = AppLauncher.ui.Script.ssoModeEnabled,
            url;

        // TODO: Check network connection before checking SSO mode

		if (!me.preferencesPanel) {
			me.preferencesPanel = Ext.create('AppLauncher.view.' + profile + '.Preferences');
			Ext.Viewport.add(this.preferencesPanel);
        }

        me.preferencesPanel.setDisplay(Environment.getNativeMode(), isInSsoMode);

        url = me.getWebCentralUrl();
        me.getLastSyncTime(function(syncTime) {
            me.preferencesPanel.setValues(ConfigFileManager.username, url, syncTime);
            me.preferencesPanel.setZIndex(1);
            me.preferencesPanel.show();
        }, me);
	},

    /**
     * Activated by the Preferences view Cancel button.
     * Closes the Preferences view.
     */
	onCancelPreferences : function() {
		if (this.preferencesPanel) {
			this.preferencesPanel.hide();
		}
	},

    /**
     * Parses the URL saved in the ConfigFileManager instance. Parses the URL
     * and displays the Web Central URL in the URL field.
     * @returns {string} The parsed URL
     */
    getWebCentralUrl: function () {
        var webCentralUrl = ConfigFileManager.url,
            index = webCentralUrl.indexOf('/archibus/'),
            displayUrl = webCentralUrl.substring(index,0) + '/archibus';

        return displayUrl;
    },

    /**
     * Displays the Reset URL panel
     */
    onResetWebCentralUrl: function () {
        var urlLabel;

        if (!this.resetUrlPanel) {
            this.resetUrlPanel = Ext.create('AppLauncher.view.ChangeUrl');
            Ext.Viewport.add(this.resetUrlPanel);
        }

        urlLabel = this.getPreferencesView().query('textfield[name=url]')[0];
        this.resetUrlPanel.showBy(urlLabel);
    },

    /**
     * Processes the changed URL.
     * Validates the input URL string. Saves the new URL in the ConfigFileManager.
     * Launches the AppLauncher of the new URL.
     */
            // TODO: Prompt user to verify the URL or restart the app.
    onChangeWebCentralUrl: function () {
        var me = this,
            changeUrlPanel = this.getChangeUrlPanel(),
            urlValue = changeUrlPanel.getUrlValue(),
            httpRe = /[Hh][Tt][Tt][Pp]/,
            baseUrl = this.getBaseUrl(),
            platform = this.getPlatform(),
            appLauncherUrl,
            changeUrlMessage = me.getChangeUrlMessage();

        // Check for valid input
        if (urlValue.length === 0) {
            Ext.Msg.alert('URL Required','A Web Central URL is required.');
            return;
        }

        // Warn the user that an incorrect url could hang the program.
        Ext.Msg.confirm('Change URL', changeUrlMessage, function (response) {
            if (response === 'yes') {
                urlValue = urlValue.replace(httpRe,'http');

                baseUrl = urlValue + baseUrl + platform;
                appLauncherUrl = baseUrl + me.getApplicationUrl();

                // Save the new URL and un-register the device
                ConfigFileManager.url = baseUrl;
                ConfigFileManager.isRegistered = false;
                ConfigFileManager.employeeId = '';
                ConfigFileManager.username = '';
                ConfigFileManager.sync(function () {
                    document.location.href = appLauncherUrl;
                }, me);
            }
        });
    },

    /**
     * Detects the current environment and returns the correct path
     * to be used when generating the application URL.
     * @returns {string}
     */
    getPlatform: function () {
        if (Ext.os.is.Android) {
            return 'android';
        }
        if (Ext.os.is.iOS) {
            return 'ios';
        }
        return 'src';
    },

    /**
     * Gets the last background data sync time from the Download table
     * @param onCompleted {Function} called when the operation is complete
     * @param scope {Object} The scope to execute the onCompleted callback.
     */
    getLastSyncTime: function(onCompleted, scope) {
        var me = this,
            downLoadStore = Ext.getStore('downloadStore'),
            maxTime;

        downLoadStore.load(function() {
            if(downLoadStore.getCount() > 0) {
                maxTime = downLoadStore.max('downloadTime');
            }
            maxTime = maxTime ? maxTime: '';
            if (typeof onCompleted === 'function') {
                onCompleted.call(scope || me, maxTime);
            }
        }, me);
    },

    /**
     * Prompts the user to reset the Background Data synchronization history data.
     * If the user elects to reset the data the contents of the Download table are
     * deleted.
     * <p>
     * The next sync action from any of the users applications will cause the
     * background data to be downloaded for that application
     *
     */
    onResetSyncHistory: function() {
        var me = this,
            preferencesView = me.getPreferencesView(),
            resetMessage = me.getBackgroundSyncResetMessage();

        Ext.Msg.confirm('Reset Sync Flag', resetMessage, function(response) {
            if (response === 'yes') {
                me.deleteDownloadRecords(function() {
                    preferencesView.clearLastSyncField();
                }, me);
            }
        });
    },

    /**
     * Deletes the contents of the Download table
     * @param onCompleted {Function} Called when the delete operation is completed.
     * @param scope {Object} The scope to execute the callback function.
     */
    deleteDownloadRecords: function (onCompleted, scope) {
        var me = this,
            downloadStore = Ext.getStore('downloadStore');

        downloadStore.load(function() {
            downloadStore.removeAll();
            downloadStore.sync(function() {
                if (typeof onCompleted === 'function') {
                    onCompleted.call(scope || me);
                }
            });
        });
    }

});