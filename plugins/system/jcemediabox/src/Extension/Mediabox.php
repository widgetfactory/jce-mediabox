<?php

/**
 * @package     JCE MediaBox
 * @subpackage  System.JceMediabox
 *
 * @copyright   Copyright (C) 2023 - 2026 Ryan Demmer. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE
 */

namespace Joomla\Plugin\System\JceMediabox\Extension;

use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\Event\Event;
use Joomla\Event\SubscriberInterface;
use Joomla\Plugin\System\JceMediabox\PluginTraits\DetectTrait;
use Joomla\Plugin\System\JceMediabox\PluginTraits\MenuTrait;
use Joomla\Plugin\System\JceMediabox\PluginTraits\OptionsTrait;

// phpcs:disable PSR1.Files.SideEffects
\defined('_JEXEC') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * JCE MediaBox plugin for Joomla 4 and later.
 *
 * @since  3.0.0
 */
final class Mediabox extends CMSPlugin implements SubscriberInterface
{
    use MenuTrait;
    use OptionsTrait;
    use DetectTrait;

    /**
     * Affects constructor behavior. If true, language files will be loaded automatically.
     *
     * @var    boolean
     */
    protected $autoloadLanguage = true;

    /**
     * Returns the events this subscriber will listen to.
     *
     * @return  array
     */
    public static function getSubscribedEvents(): array
    {
        return array(
            'onBeforeCompileHead' => 'loadAssets',
        );
    }

    /**
     * Load the assets, unless the page has nothing for them to act on.
     *
     * @param   Event  $event
     *
     * @return  void
     */
    public function loadAssets(Event $event): void
    {
        $app = $this->getApplication();

        if (!$this->isPluginEnabled($app)) {
            return;
        }

        $document = $app->getDocument();

        // only in html pages
        if ($document->getType() != 'html') {
            return;
        }

        if (!$this->shouldLoadAssets($document)) {
            return;
        }

        $wa = $document->getWebAssetManager();

        $wa->useScript('plg_system_jcemediabox.script');
        $wa->useStyle('plg_system_jcemediabox.style');

        $document->addScriptOptions('plg_system_jcemediabox', $this->getOptions($app));
    }
}
