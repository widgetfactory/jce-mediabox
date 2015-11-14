<?php

/**
 * @package JCE MediaBox
 * @copyright Copyright (C) 2006-2014 Ryan Demmer. All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL 3, see LICENCE
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
    
    private static $theme;

    /**
     * Constructor
     */
    public function plgSystemJCEMediabox(&$subject, $config) {
        parent::__construct($subject, $config);
    }

    protected function getPath() {
        return JPATH_PLUGINS . '/system/jcemediabox';
    }

    protected function getURL() {
        return JURI::base(true) . '/plugins/system/jcemediabox';
    }

    /**
     * Returns $version.
     *
     * @see plgSystemJCEMediabox::$version
     */
    protected function getVersion() {
        return preg_replace('/[^\d]+/', '', $this->version);
    }
    
    protected function getEtag($file) {
        return md5($file . $this->getVersion());
    }

    /**
     * Sets $version.
     *
     * @param object $version
     * @see plgSystemJCEMediabox::$version
     */
    protected function setVersion($version) {
        $this->version = $version;
    }

    /**
     * Create JSON parameter object
     * @param String $name Object name
     * @param Array $params Parameter array
     * @param Boolean $end If end parameters
     * @return JSON Object String
     */
    protected function renderParams($name, $params, $end) {
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
    protected function getThemeCSS($vars) {
        jimport('joomla.filesystem.file');

        $document = JFactory::getDocument();

        // Load template css file
        if (JFile::exists(JPATH_ROOT . '/' . $vars['theme'] . '/css/styles.css')) {
            $document->addStyleSheet(JURI::base(true) . '/' . $vars['theme'] . '/css/styles.css?' . $this->getEtag($vars['theme'] . '/styles.css'));
        } else {
            $document->addStyleSheet($this->getURL() . '/themes/' . self::$theme . '/css/styles.css?' . $this->getEtag(self::$theme . '/styles.css'));
        }
        return true;
    }

    /**
     * Create a list of translated labels for popup window
     * @return Key : Value labels string
     */
    protected function getLabels() {
        JPlugin::loadLanguage('plg_system_jcemediabox', JPATH_ADMINISTRATOR);

        $words = array('close', 'next', 'previous', 'cancel', 'numbers_count');

        $v = [];

        foreach ($words as $word) {
            $v[$word] = htmlspecialchars(JText::_('PLG_SYSTEM_JCEMEDIABOX_' . strtoupper($word)));
        }

        return $v;
    }

    /**
     * Load Addons
     * @return Boolean true
     */
    protected function getAddons() {
        jimport('joomla.filesystem.folder');
        jimport('joomla.filesystem.file');

        $document = JFactory::getDocument();

        $path = $this->getPath() . '/addons';
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
    public function onAfterDispatch() {
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

        $dev = true;

        $db = JFactory::getDBO();

        // Causes issue in Safari??
        $pop    = JRequest::getInt('pop');
        $print  = JRequest::getInt('print');
        $task   = JRequest::getVar('task');
        $tmpl   = JRequest::getWord('tmpl');
        
        // don't load mediabox on certain pages
        if ($pop || $print || $tmpl == 'component' || $task == 'new' || $task == 'edit') {
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
        // get menu items from parameter
        $menuitems = (array) $params->get('menu');
        
        // is there a menu assignment?
        if (!empty($menuitems) && !empty($menuitems[0])) {
            // get active menu
            $menus = JSite::getMenu();
            $menu = $menus->getActive();

            if (is_string($menuitems)) {
                $menuitems = explode(',', $menuitems);
            }

            if ($menu) {
                if (!in_array($menu->id, (array) $menuitems)) {
                    return;
                }
            }
        }

        self::$theme = $params->get('theme', 'light');

        if ($params->get('dynamic_themes', 0)) {
            self::$theme = JRequest::getWord('theme', $params->get('theme', 'standard'));
        }

        $popup = array(
            'width' => $params->get('width', ''),
            'height' => $params->get('height', ''),
            'legacy' => $params->get('legacy', 0),
            'lightbox' => $params->get('lightbox', 0),
            'shadowbox' => $params->get('shadowbox', 0),
            //'convert'			=>	$params->get('convert', 0),
            'resize' => $params->get('resize', 0),
            'icons' => (int) $params->get('icons', 1),
            'overlay' => (int) $params->get('overlay', 1),
            'overlayopacity' => $params->get('overlayopacity', 0.8),
            'overlaycolor' => $params->get('overlaycolor', '#000000'),
            'fadespeed' => $params->get('fadespeed', 500),
            'scalespeed' => $params->get('scalespeed', 500),
            'hideobjects' => $params->get('hideobjects', 1),
            'scrolling' => $params->get('scrolling', 'fixed'),
            //'protect'			=>	$params->get('protect', 1),
            'close' => $params->get('close', 2),
            'labels' => $this->getLabels()
        );

        $standard = array(
            'base' => JURI::base(true) . '/',
            'theme' => self::$theme,
            'themecustom' => $params->get('themecustom', ''),
            'mediaelement' => $params->get('mediaelement', 1),
            'popup' => $popup
        );
        
        if ($this->params->get('jquery', 1)) {
            $version = new JVersion;
        
            if ($version->isCompatible('3.0')) {
                // Include jQuery
                JHtml::_('jquery.framework');
            } else {
                // check if loaded
                if (!$app->get('jquery')) {
                    $document->addScript(JURI::root() . 'plugins/system/jcemediabox/vendor/jquery/jquery-1.11.1.min.js');
                    $document->addScriptDeclaration('jQuery.noConflict();');
                    // flag as loaded
                    $app->set('jquery', true);
                }
            }
        }

        $scripts = $this->getScripts();

        $url = $this->getURL();

        foreach ($scripts as $script) {            
            $document->addScript($url . '/' . $script . '?' . $this->getEtag(basename($script)));
        }
        
        $document->addStyleSheet($url . '/css/styles.css?' . $this->getEtag('styles.css'));

        $this->getThemeCss($standard);
        
        // mediaelement
        if ($params->get('mediaelement', 1)) {
            $document->addStyleSheet($url . '/vendor/mediaelement/css/mediaelementplayer.min.css');
        }
        
        $document->addScriptDeclaration('WFMediaBox.init(' . json_encode($standard) . ');');
        
        return true;
    }

    protected function getScripts() {
        $scripts = array('js/mediabox.js');

        // development
        if (is_dir(__DIR__ . '/js/lib')) {
            $scripts = array('js/mediabox.dev.js');
        }
        
        if (is_dir(__DIR__ . 'themes/' . self::$theme)) {
            //$scripts = array('themes/' . self::$theme . '/js/popup.js');
        }

        return $scripts;
    }
}