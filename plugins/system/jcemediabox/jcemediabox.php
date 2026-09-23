<?php

/**
 * @package JCE MediaBox
 * @copyright @@copyright@@
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL 3, see LICENCE
 *
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

JLoader::registerNamespace('Joomla\\Plugin\\System\\JceMediabox', JPATH_PLUGINS . '/system/jcemediabox/src', false, false, 'psr4');

use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Uri\Uri;
use Joomla\Plugin\System\JceMediabox\PluginTraits\DetectTrait;
use Joomla\Plugin\System\JceMediabox\PluginTraits\MenuTrait;
use Joomla\Plugin\System\JceMediabox\PluginTraits\OptionsTrait;

/**
 * JCE MediaBox plugin for Joomla 3.
 *
 * Joomla 4 and later boot the namespaced plugin through services/provider.php
 * and never load this file. It holds no logic of its own, so it can be deleted
 * with its manifest entry when Joomla 3 support ends.
 *
 * @package         JCE MediaBox
 * @subpackage    System
 */
class plgSystemJCEMediabox extends CMSPlugin
{
    use MenuTrait;
    use OptionsTrait;
    use DetectTrait;

    protected $version = '@@version@@';

    /**
     * Affects constructor behavior. If true, language files will be loaded automatically.
     *
     * @var    boolean
     */
    protected $autoloadLanguage = true;

    private function getAssetPath($relative)
    {
        $hash = '?' . md5($this->version);

        return Uri::base(true) . '/media/plg_system_jcemediabox/' . $relative . $hash;
    }

    /**
     * Load the assets, unless the page has nothing for them to act on.
     *
     * @return void
     */
    public function onBeforeCompileHead()
    {
        $app = Factory::getApplication();

        if (!$this->isPluginEnabled($app)) {
            return;
        }

        $document = Factory::getDocument();

        // only in html pages
        if ($document->getType() != 'html') {
            return;
        }

        if (!$this->shouldLoadAssets($document)) {
            return;
        }

        // Joomla.getOptions() comes from core.js
        HTMLHelper::_('behavior.core');

        // the modules in media/js/lib are bundled by rollup into a single classic script
        $document->addScript($this->getAssetPath('js/jcemediabox.min.js'));
        $document->addStyleSheet($this->getAssetPath('css/jcemediabox.min.css'));

        $document->addScriptOptions('plg_system_jcemediabox', $this->getOptions($app));
    }
}
