'use strict';
'require view';
'require fs';
'require form';
'require tools.widgets as widgets';

return view.extend({
	render: function() {
		var m, s, o;
		m = new form.Map('vlmcsd', _('Vlmcsd'), _('Vlmcsd is a KMS emulator to active your Windows or Office.'));

		s = m.section(form.TypedSection, 'vlmcsd');
		s.anonymous = true;
		s.addremove = false;
		
		s.tab('general',  _('General Settings'));
		s.tab('template', _('Edit Template'));

		o = s.taboption('general', form.Flag, 'enabled', _('Enable'));
		o.rmempty = false;
		
		s.taboption('general', widgets.NetworkSelect, 'interface', _('Interface'),
			_('Listen only on the given interface or, if unspecified, on lan'));

		o = s.taboption('general', form.ListValue, 'family', _('Restrict to address family'));
		o.modalonly = true;
		o.rmempty = true;
		o.value('', _('IPv4 and IPv6'));
		o.value('ipv4', _('IPv4 only'));
		o.value('ipv6', _('IPv6 only'));

		o = s.taboption('general', form.Value, 'port', _('Port'));
		o.default = '1688';
		o.datatype = 'port';

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
