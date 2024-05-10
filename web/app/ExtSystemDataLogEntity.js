/**
 * ExtSystemDataLogEntity实体类【系统数据日志管理】
 */
function ExtSystemDataLogEntity() {

	this.getList = function(where, config) {
		if (Ext.isEmpty(config)) {
			config = {};
		}
		let me = this;
		let dataStore = FastExt.Store.getEntityDataStore(me, where);

		//可根据where或config条件控制显示列
		let gridColumns = [];
		gridColumns.push({
			text: "编号",
			dataIndex: "dataLogId",
			columnName: "dataLogId",
			align: "center",
			width: 88,
			editable: false
		});
		gridColumns.push({
			text: "操作人",
			dataIndex: "dataUser",
			columnName: "dataUser",
			align: "center",
			width: 132,
			editable: true
		});
		gridColumns.push({
			text: "日志内容",
			dataIndex: "dataLogContent",
			columnName: "dataLogContent",
			align: "center",
			width: 146,
			editable: true
		});
		gridColumns.push({
			text: "IP地址",
			dataIndex: "dataLogIp",
			columnName: "dataLogIp",
			align: "center",
			width: 146,
			editable: true
		});
		gridColumns.push({
			text: "客户端信息",
			dataIndex: "dataLogClient",
			columnName: "dataLogClient",
			align: "center",
			width: 160,
			editable: true
		});
		gridColumns.push({
			text: "日志类型",
			dataIndex: "dataLogType",
			columnName: "dataLogType",
			align: "center",
			width: 146,
			editable: true
		});
		gridColumns.push({
			text: "录入时间",
			dataIndex: "dataLogDateTime",
			columnName: "dataLogDateTime",
			align: "center",
			width: 156,
			sortDirection: "desc",
			editable: true,
			excelHeader: false
		});

		//可根据where或config条件控制显示的按钮
		let grid = Ext.create('Ext.grid.Panel', {
			entityList: true,
			tabPanelList: false,
			mainEntityList: true,
			selModel: FastExt.Base.toBool(config['multi'], true) ? FastExt.Grid.getGridSelModel() : null,
			region: 'center',
			multiColumnSort: true,
			border: 0,
			columnLines: true,
			contextMenu: true,
			power: false,
			columnContextMenu: true,
			defaultToolBar: FastExt.Base.toBool(config['defaultToolBar'], true),
			columnSearch: true,
			store: dataStore,
			enableLocking: true,
			reserveScrollbar: true,
			operate: new FastExt.GridOperate({
				alertDelete: true,
				alertUpdate: true,
				autoUpdate: false,
				autoDetails: true,
				hoverTip: false,
				excelOut: true,
				excelIn: true,
			}),
			filter: new FastExt.ExtCreateFilter({
				enable: true,
				key: me.entityCode,
				method: "getList"
			}),
			//请求后台list接口where前缀的参数
			where: {},
			//请求后台list接口的参数
			listParams: {},
			columns: FastExt.Entity.wrapConfigs(me, gridColumns),
			tbar: null,
			onBeforeLoad: function(obj, store, params) {
				//此处可追加额外参数
				return true;
			},
			bbar: FastExt.Grid.getPageToolBar(dataStore),
			plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
				clicksToEdit: 2
			})],
			viewConfig: {
				loadingText: '正在为您在加载数据…'
			}
		});
		return Ext.create('Ext.container.Container', {
			layout: 'border',
			region: 'center',
			border: 0,
			items: [grid, FastExt.Grid.getDetailsPanel(grid)]
		});
	};

	this.showWinList = function(obj, title, where, modal, config) {
		let me = this;
		me.menu = {
			id: $.md5(title),
			text: title
		};
		let gridList = me.getList(where, config);
		let entityOwner = gridList.down("[entityList=true]");
		if (entityOwner) {
			entityOwner.code = $.md5(title);
			entityOwner.operate.autoDetails = false;
		}
		if (!modal) {
			modal = false;
		}
		let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
		let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));

		let win = Ext.create('Ext.window.Window', {
			title: title,
			height: winHeight,
			width: winWidth,
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
		} else {
			win.setIconCls("extIcon extSee");
		}
		win.show();
	};

	this.showDetails = function(obj, where) {
		let me = this;
		let dataStore = FastExt.Store.getEntityDataStore(me, where);
		FastExt.Dialog.showWait("请稍后……");
		dataStore.load(function(records, operation, success) {
			FastExt.Dialog.hideWait();
			if (records.length === 0) {
				Ext.Msg.alert("系统提醒", "未获得到详情数据！");
				return;
			}
			let record = records[0];
			//此处可以设置record的columnEntityCode属性值 区别查找同表格不同列的情况
			FastExt.Grid.showDetailsWindow(obj, "系统数据日志详情", me, record);
		});
	};

	this.getRecords = function(where) {
		let me = this;
		return new Ext.Promise(function(resolve, reject) {
			let dataStore = FastExt.Store.getEntityDataStore(me, where);
			dataStore.load(function(records, operation, success) {
				resolve(records);
			});
		});
	};

	this.getEditorField = function(attrName) {

		//编号
		if (attrName === "dataLogId") {
			return {
				xtype: "numberfield",
				decimalPrecision: 3
			};
		}

		//操作人ID
		if (attrName === "dataUserId") {
			return {
				xtype: "numberfield",
				decimalPrecision: 3,
				minValue: 0
			};
		}

		//被操作数据
		if (attrName === "dataId") {
			return {
				xtype: "numberfield",
				decimalPrecision: 3,
				minValue: 0
			};
		}

		//录入时间
		if (attrName === "dataLogDateTime") {
			return {
				xtype: "datefield",
				format: "Y-m-d H:i:s"
			};
		}
		return {
			xtype: "textfield",
			multiSplit: null
		};
	};

	this.getColumnRender = function(attrName) {

		if (attrName === "dataLogIp") {
			return function (val) {
				return FastExt.Renders.toLinkUrlText(val, "https://www.ipuu.net/query/ip?search=" + val);
			};
		}


		//录入时间
		if (attrName === "dataLogDateTime") {
			return FastExt.Renders.dateFormat('Y-m-d H:i:s');
		}
		return FastExt.Renders.normal();
	};

}