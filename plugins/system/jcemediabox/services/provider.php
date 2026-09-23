<?php

/**
 * @package     JCE MediaBox
 * @subpackage  System.JceMediabox
 *
 * @copyright   Copyright (C) 2023 - 2026 Ryan Demmer. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE
 */

defined('_JEXEC') or die;

use Joomla\CMS\Extension\PluginInterface;
use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\CMS\WebAsset\WebAssetRegistry;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;
use Joomla\Event\DispatcherInterface;
use Joomla\Plugin\System\JceMediabox\Extension\Mediabox;

return new class () implements ServiceProviderInterface {
    /**
     * Registers the service provider with a DI container.
     *
     * @param   Container  $container  The DI container.
     *
     * @return  void
     */
    public function register(Container $container)
    {
        $container->set(
            PluginInterface::class,
            function (Container $container) {
                $plugin = new Mediabox(
                    $container->get(DispatcherInterface::class),
                    (array) PluginHelper::getPlugin('system', 'jcemediabox')
                );

                $plugin->setApplication(Factory::getApplication());

                $wa = $container->get(WebAssetRegistry::class);
                $wa->addRegistryFile('media/plg_system_jcemediabox/joomla.asset.json');

                return $plugin;
            }
        );
    }
};
