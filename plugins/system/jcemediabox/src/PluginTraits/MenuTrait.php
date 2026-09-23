<?php

/**
 * @package     JCE MediaBox
 * @subpackage  System.JceMediabox
 *
 * @copyright   Copyright (C) 2023 - 2026 Ryan Demmer. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE
 */

namespace Joomla\Plugin\System\JceMediabox\PluginTraits;

// phpcs:disable PSR1.Files.SideEffects
\defined('_JEXEC') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * Request level checks that decide whether the plugin should run at all.
 *
 * The application is passed in rather than resolved here, so the Joomla 3 entry
 * point can hand over a Factory instance and the namespaced entry point can hand
 * over the one it was given by the container.
 *
 * @since  3.0.0
 */
trait MenuTrait
{
    use InputTrait;

    /**
     * Cached result of isPluginEnabled(). Null until first evaluated.
     *
     * @var boolean|null
     */
    private $enabled = null;

    /**
     * Check whether the plugin should run for this request. The result is cached
     * for the request, as it cannot change once the application has been routed.
     *
     * Note: this must not be called before routing, as the active menu item will
     * not yet be available.
     *
     * @param   object  $app  The application
     *
     * @return  boolean
     */
    protected function isPluginEnabled($app)
    {
        if ($this->enabled === null) {
            $this->enabled = $this->checkRequest($app) && $this->checkComponent($app) && $this->checkMenuAssignment($app);
        }

        return $this->enabled;
    }

    /**
     * Site only, and not on the pages MediaBox has never loaded on.
     *
     * @param   object  $app  The application
     *
     * @return  boolean
     */
    private function checkRequest($app)
    {
        if ($app->getClientId() !== 0) {
            return false;
        }

        $input = $this->getAppInput($app);

        $pop = $input->getInt('pop');
        $print = $input->getInt('print');
        $task = $input->getCmd('task');
        $tmpl = $input->getWord('tmpl');

        // don't load mediabox on certain pages
        if ($pop || $task == 'new' || $task == 'edit') {
            return false;
        }

        // load in print
        if ($tmpl == 'component' && !$print) {
            return false;
        }

        return true;
    }

    /**
     * Check the component exclusion list against the active component.
     *
     * @param   object  $app  The application
     *
     * @return  boolean
     */
    private function checkComponent($app)
    {
        $components = $this->params->get('components');

        if (empty($components)) {
            return true;
        }

        if (is_string($components)) {
            $components = explode(',', $components);
        }

        $option = $this->getAppInput($app)->get('option', '');

        foreach ($components as $component) {
            if ($option === 'com_' . $component || $option === $component) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check the menu assignment and exclusion parameters against the active menu item.
     *
     * @param   object  $app  The application
     *
     * @return  boolean
     */
    private function checkMenuAssignment($app)
    {
        $menu = $app->getMenu()->getActive();

        // get menu items from parameter
        $menuitems = (array) $this->params->get('menu');

        // is there a menu assignment?
        if (!empty($menuitems) && !empty($menuitems[0])) {
            if ($menu && !in_array($menu->id, (array) $menuitems)) {
                return false;
            }
        }

        // get excluded menu items from parameter
        $menuitems_exclude = (array) $this->params->get('menu_exclude');

        // is there a menu exclusion?
        if (!empty($menuitems_exclude) && !empty($menuitems_exclude[0])) {
            if ($menu && in_array($menu->id, (array) $menuitems_exclude)) {
                return false;
            }
        }

        return true;
    }
}
