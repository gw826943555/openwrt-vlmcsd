'use strict';
'require dom';
'require form';
'require fs';
'require poll';
'require rpc';
'require tools.widgets as widgets';
'require view';

var conf = 'vlmcsd';
var callServiceList = rpc.declare({
		object: 'service',
		method: 'list',
		params: ['name'],
		expect: { '': {} }
});

function getPidOfVlmcsd() {
		return L.resolveDefault(callServiceList(conf), {})
				.then(function (res) {
						var isrunning = false;
						try {
								isrunning = res[conf]['instances']['vlmcsd']['running'];
						} catch (e) { }
						return isrunning;
				});
}

function vlmcsdServiceStatus() {
		return Promise.all([
				getPidOfVlmcsd()
		]);
}

function vlmcsdRenderStatus(res) {
		var renderHTML = "";
		var isRunning = res[0];

		if (isRunning) {
				renderHTML += "<span style=\"color:green;font-weight:bold\">" + _("The KMS service is running.") + "</span>";
		} else {
				renderHTML += "<span style=\"color:red;font-weight:bold\">" + _("The KMS service is not running.") + "</span>";
		}

		return renderHTML;
}

return view.extend({
	render: function() {
		var m, s, o;
		m = new form.Map('vlmcsd', _('Vlmcsd'), _('Vlmcsd is a KMS emulator to activate your Windows or Office.'));

		s = m.section(form.NamedSection, '_status');
		s.anonymous = true;
		s.render = function (section_id) {
			L.Poll.add(function () {
				return L.resolveDefault(vlmcsdServiceStatus()).then(function (res) {
					var view = document.getElementById("service_status");
					view.innerHTML = vlmcsdRenderStatus(res);
				});
			});

			return E('div', { class: 'cbi-map' },
				E('div', { class: 'cbi-section' }, [
					E('div', { id: 'service_status' },
						_('Collecting data ...'))
				])
			);
		}

		s = m.section(form.NamedSection, 'config');
		s.addremove = false;
		
		s.tab('general',  _('General Settings'));
		s.tab('template', _('Edit Template'));

		o = s.taboption('general', form.Flag, 'enabled', _('Enable'));
		o.rmempty = false;
		
		s.taboption('general', widgets.NetworkSelect, 'interface', _('Interface'),
			_('Listen only on the given interface or, if unspecified, on all'));

		o = s.taboption('general', form.ListValue, 'family', _('Restrict to address family'));
		o.rmempty = true;
		o.value('', _('IPv4 and IPv6'));
		o.value('ipv4', _('IPv4 only'));
		o.value('ipv6', _('IPv6 only'));

		o = s.taboption('general', form.Value, 'port', _('Port'));
		o.rmempty = true;
		o.default = '1688';
		o.datatype = 'port';

		o = s.taboption("general", form.Flag, "use_syslog",
			_("Log to syslog"),
			_("Writes log messages to syslog."));
		o.rmempty = false;

		o = s.taboption('template', form.TextValue, '_tmpl',
			_('Edit the template that is used for generating the vlmcsd configuration.'),
			_("This is the content of the file '/etc/vlmcsd.ini' from which your vlmcsd configuration will be generated. \
			Values enclosed by pipe symbols ('|') should not be changed. They get their values from the 'General Settings' tab."));
		o.rows = 20;
		o.cfgvalue = function(section_id) {
			return fs.trimmed('/etc/vlmcsd.ini');
		};
		o.write = function(section_id, formvalue) {
			return fs.write('/etc/vlmcsd.ini', formvalue.trim().replace(/\r\n/g, '\n') + '\n');
		};

		return m.render();
	}
});
