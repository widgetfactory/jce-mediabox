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
 * Input access across supported Joomla versions.
 *
 * @since  3.0.0
 */
trait InputTrait
{
    /**
     * Get the application input.
     *
     * Joomla 3 has a public $input property and no getInput() method. Joomla 6
     * has getInput() and no public property, so neither form works on its own.
     *
     * @param   object  $app  The application
     *
     * @return  object
     */
    protected function getAppInput($app)
    {
        if (method_exists($app, 'getInput')) {
            return $app->getInput();
        }

        return $app->input;
    }
}
