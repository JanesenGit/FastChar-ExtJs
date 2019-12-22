/**
 * ExtSystemNoticeEntity实体类【系统待办】
 */
function ExtSystemNoticeEntity() {
	this.getList = function(where) {
		let me = this;
		let dataStore = getEntityDataStore(me, where);
		let grid = Ext.create('Ext.grid.Panel', {
			entityList: true,
			selModel: getGridSelModel(),
			region: 'center',
			multiColumnSort: true,
			border: 0,
			columnLines: true,
			contextMenu: true,
			columnContextMenu: true,
			columnSearch: true,
			store: dataStore,
			enableLocking: true,
			reserveScrollbar: false,
			operate: {
				alertDelete: true,
				alertUpdate: true,
				autoUpdate: false,
				autoDetails: true,
				hoverTip: false,
				excelOut: true,
				excelIn: true
			},
			columns: [{
				text: "编号",
				dataIndex: "noticeId",
				align: "center",
				width: 220,
				renderer: renders.normal(),
				editable: false
			},
			{
				text: "管理员",
				dataIndex: "a__managerLoginName",
				align: "center",
				width: 220,
				rendererFunction: "renders.link('managerId','ExtManagerEntity', 'managerId')",
				field: {
					xtype: 'linkfield',
					name: 'managerId',
					entityCode: 'ExtManagerEntity',
					entityId: 'managerId',
					entityText: 'managerLoginName'
				}
			},
			{
				text: "待办标题",
				dataIndex: "noticeTitle",
				align: "center",
				width: 220,
				renderer: renders.normal(),
				field: "textfield"
			},
			{
				text: "待办内容",
				dataIndex: "noticeContent",
				align: "center",
				width: 220,
                renderer: renders.normal(),
				field: "contentfield"
			},
			{
				text: "功能路径",
				dataIndex: "noticeAction",
				align: "center",
				width: 220,
				renderer: renders.normal(),
				field: "textfield"
			},
			{
				text: "待办状态",
				dataIndex: "noticeState",
				align: "center",
				width: 220,
				rendererFunction: "renders.enum('NoticeStateEnum')",
				field: {
					xtype: 'enumcombo',
					enumName: 'NoticeStateEnum'
				}
			},
			{
				text: "录入时间",
				dataIndex: "noticeDateTime",
				align: "center",
				flex: 1,
				minWidth: 220,
				renderer: renders.normal(),
				field: {
					xtype: 'datefield',
					format: 'Y-m-d H:i:s'
				}
			}],
			tbar: {
				xtype: 'toolbar',
				overflowHandler: 'menu',
				items: [{
					xtype: 'button',
					text: '删除系统待办',
					iconCls: 'extIcon extDelete',
					tipText: '删除系统待办！',
					checkSelect: 2,
					handler: function() {
						deleteGridData(grid);
					}
				},
				{
					xtype: 'button',
					text: '添加系统待办',
					iconCls: 'extIcon extAdd',
					handler: function() {
						me.showAdd(this, where).then(function(result) {
							if (result.success) {
								dataStore.loadPage(1);
							}
						});
					}
				},
				{
					xtype: 'button',
					text: '提交修改',
					subtext: '系统待办',
					checkUpdate: true,
					iconCls: 'extIcon extSave',
					handler: function() {
						updateGridData(grid);
					}
				}]
			},
			bbar: getPageToolBar(dataStore),
			plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
				clicksToEdit: 2
			})],
			viewConfig: {
				loadingText: '正在为您在加载数据…'
			}
		});
		let panel = Ext.create('Ext.panel.Panel', {
			layout: 'border',
			region: 'center',
			border: 0,
			items: [grid, getDetailsPanel(grid)]
		});
		return panel;
	};

	this.showAdd = function(obj, where) {
		let me = this;
		if (!where) {
			where = {};
		}
		return new Ext.Promise(function(resolve, reject) {
			let formPanel = Ext.create('Ext.form.FormPanel', {
				url: 'entity/save',
				cacheKey: me.entityCode,
				bodyPadding: 5,
				method: 'POST',
				region: 'center',
				fileUpload: true,
				autoScroll: true,
				defaults: {
					labelWidth: 60,
					margin: '5 5 5 5',
					labelAlign: 'right',
					emptyText: '请填写'
				},
				layout: "column",
				listeners: {
					render: function(obj, eOpts) {
						new Ext.util.KeyMap({
							target: obj.getEl(),
							key: 13,
							fn: function(keyCode, e) {
								formPanel.submitForm(me).then(function(result) {
									if (result.success) {
										resolve(result);
										formPanel.deleteCache();
										addWin.close();
									}
								});
							},
							scope: this
						});
					}
				},
				items: [{
					name: "data.managerId",
					xtype: "linkfield",
					fieldLabel: "管理员",
					columnWidth: 1,
					multiSelect: true,
					entityCode: "ExtManagerEntity",
					entityId: "managerId",
					entityText: "managerLoginName",
					linkValue: {
						managerId: where['managerId'],
						managerLoginName: where['^managerLoginName']
					}
				},
				{
					name: "data.noticeTitle",
					xtype: "textfield",
					fieldLabel: "待办标题",
					columnWidth: 1,
					allowBlank: false
				},
				{
					name: "data.noticeContent",
					xtype: "contentfield",
					allowBlank: false,
					fieldLabel: "待办内容",
					columnWidth: 1
				},
				{
					name: "data.noticeAction",
					xtype: "textfield",
					fieldLabel: "功能路径",
					columnWidth: 1,
					allowBlank: false
				},
				{
					name: "data.noticeState",
					xtype: "enumcombo",
					fieldLabel: "待办状态",
					columnWidth: 1,
					value: 0,
					allowBlank: false,
					enumName: "NoticeStateEnum"
				},
				{
					name: "data.noticeDateTime",
					xtype: "datefield",
					format: "Y-m-d H:i:s",
					fieldLabel: "录入时间",
					columnWidth: 1
				}]
			});

			let addWin = Ext.create('Ext.window.Window', {
				title: '添加系统待办',
				height: 400,
				icon: obj.icon,
				iconCls: obj.iconCls,
				width: 520,
				layout: 'border',
				resizable: true,
				maximizable: true,
				constrain: true,
				animateTarget: obj,
				items: [formPanel],
				modal: true,
				listeners: {
					show: function(obj) {
						formPanel.restoreCache();
						obj.focus();
					}
				},
				buttons: [{
					text: '暂存',
					iconCls: 'extIcon extSave whiteColor',
					handler: function() {
						formPanel.saveCache();
					}
				},
				{
					text: '重置',
					iconCls: 'extIcon extReset',
					handler: function() {
						formPanel.form.reset();
						formPanel.deleteCache();
					}
				},
				{
					text: '添加',
					iconCls: 'extIcon extOk',
					handler: function() {
						formPanel.submitForm(me).then(function(result) {
							if (result.success) {
								resolve(result);
								formPanel.deleteCache();
								addWin.close();
							}
						});
					}
				}]
			});
			addWin.show();
		});
	};

	this.showWinList = function(obj, title, where, modal) {
		let me = this;
		me.menu = {
			id: $.md5(title),
			text: title
		};
		let gridList = me.getList(where);
		let entityOwner = gridList.down("[entityList=true]");
		if (entityOwner) {
			entityOwner.code = $.md5(title);
		}
		if (!modal) {
			modal = false;
		}
		let win = Ext.create('Ext.window.Window', {
			title: title,
			height: 550,
			width: 700,
			layout: 'border',
			resizable: true,
			constrain: true,
			maximizable: true,
			animateTarget: obj,
			modal: modal,
			listeners: {
				show: function(obj) {
					obj.focus();
				}
			},
			items: [gridList]
		});
		if (obj != null) {
			win.setIcon(obj.icon);
			win.setIconCls(obj.iconCls);
		}
		win.show();
	};

	this.showSelect = function(obj, title, where, multi) {
		let me = this;
		return new Ext.Promise(function(resolve, reject) {
			me.menu = {
				id: $.md5(title),
				text: title
			};
			let dataStore = getEntityDataStore(me, where);
			let selModel = null;
			if (multi) {
				selModel = getGridSelModel();
			}
			let grid = Ext.create('Ext.grid.Panel', {
				entityList: true,
				code: $.md5(title),
				selModel: selModel,
				region: 'center',
				multiColumnSort: true,
				border: 0,
				columnLines: true,
				contextMenu: false,
				columnMenu: false,
				store: dataStore,
				enableLocking: true,
				columns: [{
					text: "管理员",
					dataIndex: "a__managerLoginName",
					align: "center",
					width: 220,
					rendererFunction: "renders.link('managerId','ExtManagerEntity', 'managerId')",
					field: {
						xtype: 'linkfield',
						name: 'managerId',
						entityCode: 'ExtManagerEntity',
						entityId: 'managerId',
						entityText: 'managerLoginName'
					},
					editable: false
				},
				{
					text: "待办标题",
					dataIndex: "noticeTitle",
					align: "center",
					width: 220,
					renderer: renders.normal(),
					field: "textfield",
					editable: false
				},
				{
					text: "功能路径",
					dataIndex: "noticeAction",
					align: "center",
					width: 220,
					renderer: renders.normal(),
					field: "textfield",
					editable: false
				},
				{
					text: "待办状态",
					dataIndex: "noticeState",
					align: "center",
					width: 220,
					rendererFunction: "renders.enum('NoticeStateEnum')",
					field: {
						xtype: 'enumcombo',
						enumName: 'NoticeStateEnum'
					},
					editable: false
				},
				{
					text: "录入时间",
					dataIndex: "noticeDateTime",
					align: "center",
					flex: 1,
					minWidth: 220,
					renderer: renders.normal(),
					field: {
						xtype: 'datefield',
						format: 'Y-m-d H:i:s'
					},
					editable: false
				}],
				bbar: getPageToolBar(dataStore),
				viewConfig: {
					loadingText: '正在为您在加载数据…'
				}
			});

			let win = Ext.create('Ext.window.Window', {
				title: title,
				height: 550,
				width: 700,
				iconCls: 'extIcon extSelect',
				layout: 'border',
				resizable: true,
				constrain: true,
				maximizable: true,
				animateTarget: obj,
				items: [grid],
				modal: true,
				listeners: {
					close: function(winObj, eOpts) {
						if (!resolve.called) {
							resolve.called = true;
							resolve();
						}
					},
					show: function(obj) {
						obj.focus();
					}
				},
				buttons: [{
					text: '取消',
					iconCls: 'extIcon extClose',
					handler: function() {
						win.close();
					}
				},
				{
					text: '确定',
					iconCls: 'extIcon extOk',
					handler: function() {
						let data = grid.getSelectionModel().getSelection();
						if (data.length > 0) {
							if (!resolve.called) {
								resolve.called = true;
								resolve(data);
							}
						}
						win.close();
					}
				}]
			});
			win.show();
		});
	};

	this.showDetails = function(obj, where) {
		let me = this;
		let dataStore = getEntityDataStore(me, where);
		showWait("请稍后……");
		dataStore.load(function(records, operation, success) {
			hideWait();
			if (records.length == 0) {
				Ext.Msg.alert("系统提醒", "未获得到详情数据！");
				return;
			}
			let record = records[0];
			showDetailsWindow(obj, "系统待办详情", me, record);
		});
	};
}