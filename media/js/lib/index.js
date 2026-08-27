/**
 * Rollup entry point.
 *
 * These files are not ES modules - each is a self contained IIFE that hangs itself off
 * the window.WfMediabox global, so the import order below is load order and matters:
 *
 *   Mediabox   creates window.WfMediabox
 *   Entities   before Parameter, which is invoked with WfMediabox.Entities
 *   Parameter  before Convert, which is invoked with WfMediabox.Parameter
 *   Addons     before Plugins and the themes, which call Plugin.add / Theme.add
 *
 * The order mirrors the file list the uglify task used previously.
 */
import './Mediabox.js';
import './Env.js';
import './Mime.js';
import './Entities.js';
import './Parameter.js';
import './Storage.js';
import './Base64.js';
import './Convert.js';
import './Addons.js';
import './Svg.js';
import './Tools.js';
import './Plugins.js';

// themes
import '../../themes/bootstrap/js/template.js';
import '../../themes/light/js/template.js';
import '../../themes/shadow/js/template.js';
import '../../themes/squeeze/js/template.js';
import '../../themes/standard/js/template.js';
