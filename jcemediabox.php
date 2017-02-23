<?php

/**
 * @package JCE MediaBox
 * @copyright Copyright (C) 2006-2017 Ryan Demmer. All rights reserved.
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
 * @package         JCE MediaBox
 * @subpackage    System
 */
class plgSystemJCEMediabox extends JPlugin
{
    private $version = '@@version@@';

    private static $theme;

    protected function getPath()
    {
        return JPATH_PLUGINS . '/system/jcemediabox';
    }

    protected function getURL()
    {
        return JURI::base(true) . '/plugins/system/jcemediabox';
    }

    protected function getEtag($file)
    {
        return md5_file($this->getPath() . '/' . $file);
    }

    /**
     * Create a list of translated labels for popup window
     * @return Key : Value labels string
     */
    protected function getLabels()
    {
        JPlugin::loadLanguage('plg_system_jcemediabox', JPATH_ADMINISTRATOR);

        $words = array('close', 'next', 'previous', 'cancel', 'numbers_count');

        $v = array();

        foreach ($words as $word) {
            $v[$word] = htmlspecialchars(JText::_('PLG_SYSTEM_JCEMEDIABOX_LABEL_' . strtoupper($word)));
        }

        return $v;
    }

    /**
     * OnAfterRoute function
     * @return Boolean true
     */
    public function onAfterDispatch()
    {
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

        $db = JFactory::getDBO();

        // Causes issue in Safari??
        $pop = JRequest::getInt('pop');
        $print = JRequest::getInt('print');
        $task = JRequest::getCmd('task');
        $tmpl = JRequest::getWord('tmpl');

        // don't load mediabox on certain pages
        if ($pop || $print || $tmpl == 'component' || $task == 'new' || $task == 'edit') {
            return;
        }

        $params = $this->params;

        $components = $params->get('components');

        if (!empty($components)) {
            if (is_string($components)) {
                $components = explode(',', $components);
            }

            $option = $app->input->get('option', '');

            foreach ($components as $component) {
                if ($option === 'com_' . $component || $option === $component) {
                    return;
                }
            }
        }
        
        // get active menu
        $menus = $app->getMenu();
        $menu = $menus->getActive();

        // get menu items from parameter
        $menuitems = (array) $params->get('menu');

        // is there a menu assignment?
        if (!empty($menuitems) && !empty($menuitems[0])) {
            if ($menu && !in_array($menu->id, (array) $menuitems)) {
                return;
            }
        }

        // get excluded menu items from parameter
        $menuitems_exclude = (array) $params->get('menu_exclude');

        // is there a menu exclusion?
        if (!empty($menuitems_exclude) && !empty($menuitems_exclude[0])) {            
            if ($menu && in_array($menu->id, (array) $menuitems_exclude)) {
                return;
            }
        }

        self::$theme = $params->get('theme', 'standard');

        if ($params->get('dynamic_themes', 0)) {
            self::$theme = JRequest::getWord('theme', $params->get('theme', 'standard'));
        }

        $config = array(
            'base' => JURI::base(true) . '/',
            'theme' => self::$theme,
            'mediafallback' => (int) $params->get('mediafallback', 0),
            'mediaselector' => $params->get('mediaselector', 'audio,video'),
            'width' => $params->get('width', ''),
            'height' => $params->get('height', ''),
            'legacy' => (int) $params->get('legacy', 0),
            'lightbox' => (int) $params->get('lightbox', 0),
            'shadowbox' => (int) $params->get('shadowbox', 0),
            'icons' => (int) $params->get('icons', 1),
            'overlay' => (int) $params->get('overlay', 1),
            'overlayopacity' => (float) $params->get('overlayopacity'),
            'overlaycolor' => $params->get('overlaycolor', ''),
            'fadespeed' => (int) $params->get('fadespeed', 500),
            'scalespeed' => (int) $params->get('scalespeed', 500),
            'hideobjects' => (int) $params->get('hideobjects', 1),
            'scrolling' => $params->get('scrolling', 'fixed'),
            'close' => (int) $params->get('close', 2),
            'labels' => $this->getLabels(),
        );

        if ($this->params->get('jquery', 1)) {
            $version = new JVersion;

            if ($version->isCompatible('3.0')) {
                // Include jQuery
                JHtml::_('jquery.framework');
            } else {
                // check if loaded
                if (!$app->get('jquery')) {
                    $document->addScript('https://code.jquery.com/jquery-1.12.4.min.js');
                    $document->addScriptDeclaration('jQuery.noConflict();');
                    // flag as loaded
                    $app->set('jquery', true);
                }
            }
        }

        $document->addScript($this->getURL() . '/js/jcemediabox.min.js?' . $this->getEtag('js/jcemediabox.min.js'));
        $document->addStyleSheet($this->getURL() . '/css/jcemediabox.min.css?' . $this->getEtag('css/jcemediabox.min.css'));

        $document->addScriptDeclaration('jQuery(document).on("ready",function(){WFMediaBox.init(' . json_encode($config) . ');});');

        return true;
    }
}
