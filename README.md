# coins-watcher

Clone into folder ~/.local/share/cinnamon/applets

$ git clone git@github.com:sock-osg/coins-watcher.git coins-watcher@oz.com

Reload new changes

dbus-send --session --dest=org.Cinnamon.LookingGlass --type=method_call /org/Cinnamon/LookingGlass org.Cinnamon.LookingGlass.ReloadExtension string:'coins-watcher@oz.com' string:'APPLET'
