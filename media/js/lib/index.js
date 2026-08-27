// Mediabox.js must come first: it installs the window.WfMediabox global that the
// theme templates below call addTheme() on. Everything else (Env, Tools, Theme,
// Plugin, Svg, Mime, Parameter, Convert, Config, Storage, Entities) is pulled in
// transitively and must not be listed here.
import './Mediabox.js';
import './Plugins.js';

// themes
import '../../themes/bootstrap/js/template.js';
import '../../themes/light/js/template.js';
import '../../themes/shadow/js/template.js';
import '../../themes/squeeze/js/template.js';
import '../../themes/standard/js/template.js';
