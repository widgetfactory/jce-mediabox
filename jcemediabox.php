<?php

/**
 * @package JCE MediaBox
 * @copyright Copyright (C) 2006-2012 Ryan Demmer. All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see licence.txt
 * This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 *
 * Light Theme inspired by Slimbox by Christophe Beyls
 * @ http://www.digitalia.be
 *
 * Shadow Theme inspired by ShadowBox
 * @ http://mjijackson.com/shadowbox/
 *
 * Squeeze theme inspired by Squeezebox by Harald Kirschner
 * @ http://digitarald.de/project/squeezebox/
 *
 */
defined('_JEXEC') or die('Restricted access');

jimport('joomla.plugin.plugin');

/**
 * JCE MediaBox Plugin
 *
 * @package 		JCE MediaBox
 * @subpackage	System
 */
class plgSystemJCEMediabox extends JPlugin {

    private $version = '@@version@@';

    /**
     * Constructor
     */
    function plgSystemJCEMediabox(&$subject, $config) {
        parent::__construct($subject, $config);
    }

    function getPath() {
        return JPATH_PLUGINS . DS . 'system' . DS . 'jcemediabox';
    }

    function getURL() {
        return JURI::base(true) . '/plugins/system/jcemediabox';
    }

    /**
     * Returns $version.
     *
     * @see plgSystemJCEMediabox::$version
     */
    function getVersion() {
        return preg_replace('/[^\d]+/', '', $this->version);
    }

    /**
     * Sets $version.
     *
     * @param object $version
     * @see plgSystemJCEMediabox::$version
     */
    function setVersion($version) {
        $this->version = $version;
    }

    /**
     * Create JSON parameter object
     * @param String $name Object name
     * @param Array $params Parameter array
     * @param Boolean $end If end parameters
     * @return JSON Object String
     */
    function renderParams($name, $params, $end) {
        $html = '';
        if ($name) {
            $html .= $name . ":{";
        }
        $i = 0;
        foreach ($params as $k => $v) {
            // not objects or arrays or functions or numbers
            if (!preg_match('/(\[[^\]*]\]|\{[^\}]*\}|function\([^\}]*\})/', $v)) {
                if (!is_numeric($v)) {
                    $v = '"' . $v . '"';
                }
            }
            if ($i < count($params) - 1) {
                $v .= ',';
            }
            if (preg_match('/\s+/', $k)) {
                $html .= "'" . $k . "':" . $v;
            } else {
                $html .= $k . ":" . $v;
            }

            $i++;
        }
        if ($name) {
            $html .= "}";
        }
        if (!$end) {
            $html .= ",";
        }
        return $html;
    }

    /**
     * Load theme css files
     * @param object $vars Parameter variables
     * @return Boolean true
     */
    function getThemeCSS($vars) {
        jimport('joomla.environment.browser');
        jimport('joomla.filesystem.file');

        $document = JFactory::getDocument();
        $theme = $vars['theme'] == 'custom' ? $vars['themecustom'] : $vars['theme'];

        $version = $this->getVersion();

        if ($version) {
            $version = '?version=' . $version;
        }

        // Load template css file
        if (JFile::exists(JPATH_ROOT . DS . $vars['themepath'] . '/' . $theme . '/css/style.css')) {
            $document->addStyleSheet(JURI::base(true) . '/' . $vars['themepath'] . '/' . $theme . '/css/style.css' . $version);
        } else {
            $document->addStyleSheet(JURI::base(true) . '/' . $vars['themepath'] . '/standard/css/style.css' . $version);
        }
        // Load any ie6 variation
        jimport('joomla.environment.browser');
        $browser = &JBrowser::getInstance();

        if ($browser->getBrowser() == 'msie' && intval($browser->getMajor()) < 8) {
            if (JFile::exists(JPATH_ROOT . DS . $vars['themepath'] . '/' . $theme . '/css/style_ie6.css')) {
                $document->addStyleSheet(JURI::base(true) . '/' . $vars['themepath'] . '/' . $theme . '/css/style_ie6.css' . $version);
            }
            if (JFile::exists(JPATH_ROOT . DS . $vars['themepath'] . '/' . $theme . '/css/style_ie7.css')) {
                $document->addStyleSheet(JURI::base(true) . '/' . $vars['themepath'] . '/' . $theme . '/css/style_ie7.css' . $version);
            }
        }

        if (preg_match('#(ipad|iphone)#i', $browser->getAgentString())) {
            if (JFile::exists(JPATH_ROOT . DS . $vars['themepath'] . '/' . $theme . '/css/style_mobile.css')) {
                $document->addStyleSheet(JURI::base(true) . '/' . $vars['themepath'] . '/' . $theme . '/css/style_mobile.css' . $version);
            }
        }
        return true;
    }

    /**
     * Create a list of translated labels for popup window
     * @return Key : Value labels string
     */
    function getLabels() {
        JPlugin::loadLanguage('plg_system_jcemediabox', JPATH_ADMINISTRATOR);

        $words = array('close', 'next', 'previous', 'cancel', 'numbers');
        $i = 0;
        $v = '';
        foreach ($words as $word) {
            $v .= "'" . $word . "':'" . htmlspecialchars(JText::_('JCEMEDIABOX_' . strtoupper($word))) . "'";
            if ($i < count($words) - 1) {
                $v .= ',';
            }
            $i++;
        }

        return $v;
    }

    /**
     * Load Addons
     * @return Boolean true
     */
    function getAddons() {
        jimport('joomla.filesystem.folder');
        jimport('joomla.filesystem.file');

        $document = JFactory::getDocument();

        $path = $this->getPath() . DS . 'addons';
        $filter = array('default-src.js');

        if ($this->getVersion()) {
            $filter[] = 'default.js';
        }

        $files = JFolder::files($path, '.js$', false, false, $filter);

        $scripts = array();

        if (is_array($files) && count($files)) {
            foreach ($files as $file) {
                $scripts[] = 'addons/' . $file;
            }
        }

        return $scripts;
    }

    /**
     * OnAfterRoute function
     * @return Boolean true
     */
    function onAfterDispatch() {
        $app = JFactory::getApplication();

        if ($app->isAdmin()) {
            return;
        }

        $document = JFactory::getDocument();
        $docType = $document->getType();

        // only in html pages
        if ($docType != 'html') {
            return;
        }

        // check for mediabox classes in content
        /* $buffer = JResponse::getBody();

          if (!preg_match('#<(a|area)([^>]+)class="([^"]+?)(jcepopup|jcebox|jcelightbox|jcetooltip|jce_tooltip)([^"]+?)"([^>]+)>#i', $buffer) || !preg_match('#<a([^>]+)rel="(lightbox|shadowbox)"([^>]+)>#i', $buffer)) {
          return;
          } */

        $dev = true;

        $db = JFactory::getDBO();

        // Causes issue in Safari??
        $pop = JRequest::getVar('pop', 0, 'int');
        $task = JRequest::getVar('task');
        $tmpl = JRequest::getVar('tmpl');

        if ($pop || ($task == 'new' || $task == 'edit') || $tmpl == 'component') {
            return;
        }
        $params = $this->params;

        $components = $params->get('components', '');
        if ($components) {
            $excluded = explode(',', $components);
            $option = JRequest::getVar('option', '');
            foreach ($excluded as $exclude) {
                if ($option == 'com_' . $exclude || $option == $exclude) {
                    return;
                }
            }
        }

        $theme = $params->get('theme', 'standard');

        if ($params->get('dynamic_themes', 0)) {
            $theme = JRequest::getWord('theme', $params->get('theme', 'standard'));
        }

        $popup = array(
            'width' => $params->get('width', ''),
            'height' => $params->get('height', ''),
            'legacy' => $params->get('legacy', 0),
            'lightbox' => $params->get('lightbox', 0),
            'shadowbox' => $params->get('shadowbox', 0),
            //'convert'			=>	$params->get('convert', 0),
            'resize' => $params->get('resize', 0),
            'icons' => $params->get('icons', 1),
            'overlay' => $params->get('overlay', 1),
            'overlayopacity' => $params->get('overlayopacity', 0.8),
            'overlaycolor' => $params->get('overlaycolor', '#000000'),
            'fadespeed' => $params->get('fadespeed', 500),
            'scalespeed' => $params->get('scalespeed', 500),
            'hideobjects' => $params->get('hideobjects', 1),
            'scrolling' => $params->get('scrolling', 'fixed'),
            //'protect'			=>	$params->get('protect', 1),
            'close' => $params->get('close', 2),
            'labels' => '{' . $this->getLabels() . '}'
        );

        $tooltip = array(
            'className' => $params->get('tipclass', 'tooltip'),
            'opacity' => $params->get('tipopacity', 0.8),
            'speed' => $params->get('tipspeed', 200),
            'position' => $params->get('tipposition', 'br'),
            'offsets' => "{x: " . $params->get('tipoffsets_x', 16) . ", y: " . $params->get('tipoffsets_y', 16) . "}",
        );

        $standard = array(
            'base' => JURI::base(true) . '/',
            'imgpath' => $params->get('imgpath', 'plugins/system/jcemediabox/img'),
            'theme' => $theme,
            'themecustom' => $params->get('themecustom', ''),
            'themepath' => $params->get('themepath', 'plugins/system/jcemediabox/themes')
        );

        $media_versions = array(
            'flash' => $params->get('flash', '10,0,22,87'),
            'windowmedia' => $params->get('windowmedia', '5,1,52,701'),
            'quicktime' => $params->get('quicktime', '6,0,2,0'),
            'realmedia' => $params->get('realmedia', '7,0,0,0'),
            'shockwave' => $params->get('shockwave', '8,5,1,0')
        );

        jimport('joomla.environment.browser');
        jimport('joomla.filesystem.file');

        // Mediaobject plugin loaded?
        $mediaobject = JPluginHelper::isEnabled('system', 'mediaobject');

        $version = $this->getVersion();
        $scripts = $this->getScripts();

        if ($version) {
            $version = '?version=' . $version;
        }

        $url = $this->getURL();

        foreach ($scripts as $script) {
            $document->addScript($url . '/' . $script . $version);
        }

        $document->addStyleSheet($url . '/css/jcemediabox.css' . $version);

        // Load any ie6 variation
        jimport('joomla.environment.browser');
        $browser = &JBrowser::getInstance();

        if ($browser->getBrowser() == 'msie' && intval($browser->getMajor()) < 7) {
            if (JFile::exists(dirname(__FILE__) . DS . 'jcemediabox' . DS . 'css' . DS . 'jcemediabox_ie6.css')) {
                $document->addStyleSheet($url . '/css/jcemediabox_ie6.css' . $version);
            }
        }
        $this->getThemeCss($standard);

        $html = "";

        if (!$mediaobject) {
            $html .= "JCEMediaObject.init('" . JURI::base(true) . "/', {";
            $html .= $this->renderParams('', $media_versions, true);
            $html .= "});";
        }

        $html .= 'JCEMediaBox.init({';
        $html .= $this->renderParams('popup', $popup, false);
        $html .= $this->renderParams('tooltip', $tooltip, false);
        $html .= $this->renderParams('', $standard, true);
        $html .= "});";

        $document->addScriptDeclaration($html);
        return true;
    }
    
    function onAfterRender() {
        $params = $this->params;
        $theme  = $params->get('theme', 'standard');

        if ($params->get('dynamic_themes', 0)) {
            $theme = JRequest::getWord('theme', $params->get('theme', 'standard'));
        }
        
        $path   = $params->get('themepath', 'plugins/system/jcemediabox/themes');
        $file   = $path . DS . $theme;
        
        $custom = $params->get('themecustom', '');
        
        if ($custom) {
            $file = $path . DS . $custom;
        }
        
        // get input filter
        $filter = new JFilterInput(array('div', 'span', 'a', ''), array('id', 'class', 'href', 'title'), 0, 0);
        
        $html = '';
        
        if (JFile::exists($file . DS . 'tooltip.html')) {
            $data = JFile::read($file . DS . 'tooltip.html');
            
            preg_match('#<body>([\s\S]+)<\/body>#', $data, $matches);
            
            if ($matches) {
                $data = $matches[1];
            }
            
            $data = $filter->clean($data);
            
            $html .= '<div id="jcemediabox-tooltip-html" class="jcemediabox-tooltip">' . $data . '</div>';
        }
        
        if (JFile::exists($file . DS . 'popup.html')) {
            $data = JFile::read($file . DS . 'popup.html');
            
            preg_match('#<body>([\s\S]+)<\/body>#', $data, $matches);
            
            if ($matches) {
                $data = $matches[1];
            }
            
            $data = $filter->clean($data);
            
            // translate
            $data = preg_replace_callback('/\{#(\w+?)\}/', array($this, 'translate'), $data);
            
            $html .= '<div id="jcemediabox-popup-html"><div id="jcemediabox-popup-overlay"></div><div id="jcemediabox-popup-frame"><div id="jcemediabox-popup-body">' . $data . '</div></div></div>';
        }

        $buffer     = JResponse::getBody();      
        $buffer     = str_replace('</body>', preg_replace("#\r\s+#", "", $html) . "\n</body>", $buffer); 
        
        JResponse::setBody($buffer);
	return true;
    }
    
    function translate($matches) {
        return htmlspecialchars(JText::_('JCEMEDIABOX_' . strtoupper($matches[1])));
    }

    function getScripts() {
        $scripts = array('js/jcemediabox.js');

        // only for development
        if (!$this->getVersion() && is_file($this->getPath() . DS . 'js' . DS . 'mediaobject.js')) {
            $scripts[] = 'js/mediaobject.js';
        }

        $scripts = array_merge($scripts, $this->getAddons());

        return $scripts;
    }

}

?>