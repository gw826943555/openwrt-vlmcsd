'use strict';
'require dom';
'require form';
'require fs';
'require poll';
'require rpc';
'require tools.widgets as widgets';
'require view';

var callServiceList, CBIVlmcsdStatus;

callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

CBIVlmcsdStatus = form.DummyValue.extend({
	renderWidget: function() {
		var node = E('div', {}, E('p', {}, E('em', {}, _('Collecting data...'))));
		poll.add(function() {
			Promise.all([
				callServiceList('vlmcsd', {}).then(function(res) {
					var stat = "";
					var isrunning = false;

					try {
						isrunning = res['vlmcsd']['instances']['vlmcsd']['running'];
					} catch (e) { };

					if (isrunning) {
						stat = "<span style=\"color:green;font-weight:bold\">" + _("The KMS service is running.") + "</span>";
					} else {
						stat = "<span style=\"color:red;font-weight:bold\">" + _("The KMS service is not running.") + "</span>";
					};

					return E('p', {}, E('em', {}, stat));
				})
			]).then(function(res) {
				res = res.filter(function(r) { return r ? 1 : 0 });
				dom.content(node, res);
			});
		});
		return node;
	}
});

return view.extend({
	render: function() {
		var m, s, o;
		m = new form.Map('vlmcsd', _('Vlmcsd'), _('Vlmcsd is a KMS emulator to activate your Windows or Office.'));

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.cfgsections = function() { return [ 'status' ] };

		o = s.option(CBIVlmcsdStatus);

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
