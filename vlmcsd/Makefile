include $(TOPDIR)/rules.mk

PKG_NAME:=vlmcsd
PKG_VERSION:=2023.07.28
PKG_RELEASE:=0

PKG_MAINTAINER:=william <gw826943555@qq.com>
PKG_LICENSE:=WTFPL

PKG_SOURCE_URL:=https://github.com/Wind4/vlmcsd.git
PKG_MIRROR_HASH:=a5ed94c008a5941b7e7c03d243784b8f7a22fb57f36671f87ffb072c186f0ff0
PKG_SOURCE_PROTO:=git
PKG_SOURCE_VERSION:=70e03572b254688b8c3557f898e7ebd765d29ae1

PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk

define Package/vlmcsd
	SECTION:=net
	CATEGORY:=Network
	TITLE:=vlmcsd for OpenWRT
	URL:=http://forums.mydigitallife.info/threads/50234
	DEPENDS:=+libpthread
endef

define Package/vlmcsd/description
	vlmcsd is a KMS Emulator in C.
endef

define Package/vlmcsd/postrm
#!/bin/sh
. /lib/functions.sh

remove_srvhost() {
    local section=$1
    [ "${section%%_*}" = "vlmcsd" ] && uci_remove dhcp "$section"
}

config_load dhcp
config_foreach remove_srvhost srvhost
uci_commit dhcp
/etc/init.d/dnsmasq reload
exit 0
endef

define Package/vlmcsd/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/bin/vlmcsd $(1)/usr/bin/vlmcsd

	$(INSTALL_DIR) $(1)/etc
	$(INSTALL_DATA) ./files/vlmcsd.ini $(1)/etc/vlmcsd.ini

	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./files/vlmcsd.config $(1)/etc/config/vlmcsd

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/vlmcsd.init $(1)/etc/init.d/vlmcsd
endef

$(eval $(call BuildPackage,vlmcsd))
