<?php

/**
 * @package     JCE MediaBox
 * @subpackage  System.JceMediabox
 *
 * @copyright   Copyright (C) 2023 - 2026 Ryan Demmer. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE
 */

namespace Joomla\Plugin\System\JceMediabox\PluginTraits;

use Joomla\CMS\Language\Text;
use Joomla\CMS\Uri\Uri;

// phpcs:disable PSR1.Files.SideEffects
\defined('_JEXEC') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * The configuration passed to WfMediabox.init().
 *
 * @since  3.0.0
 */
trait OptionsTrait
{
    use InputTrait;

    /**
     * Create a list of translated labels for the popup window.
     *
     * @return  array  Key : Value labels
     */
    protected function getLabels()
    {
        $this->loadLanguage('plg_system_jcemediabox', JPATH_ADMINISTRATOR);
        $this->loadLanguage('plg_system_jcemediabox', dirname(__DIR__, 2));

        $words = array('close', 'next', 'previous', 'cancel', 'numbers', 'numbers_count', 'download');

        $v = array();

        foreach ($words as $word) {
            $v[$word] = htmlspecialchars(Text::_('PLG_SYSTEM_JCEMEDIABOX_LABEL_' . strtoupper($word)));
        }

        return $v;
    }

    /**
     * Get the theme, which can be set per request when dynamic themes are enabled.
     *
     * @param   object  $app  The application
     *
     * @return  string
     */
    protected function getTheme($app)
    {
        $theme = $this->params->get('theme', 'standard');

        if ($this->params->get('dynamic_themes', 0)) {
            $theme = $this->getAppInput($app)->getWord('theme', $theme);
        }

        return $theme;
    }

    /**
     * Build the javascript configuration.
     *
     * @param   object  $app  The application
     *
     * @return  array
     */
    protected function getOptions($app)
    {
        $params = $this->params;

        // transition speed in milliseconds, 0 disables transitions. An empty value falls back to the default
        $transitionSpeed = $params->get('transitionspeed', $params->get('scalespeed', 300));

        if ($transitionSpeed === '' || $transitionSpeed === null) {
            $transitionSpeed = 300;
        }

        return array(
            'base' => Uri::base(true) . '/',
            'theme' => $this->getTheme($app),
            'width' => $params->get('width', ''),
            'height' => $params->get('height', ''),
            'lightbox' => (int) $params->get('lightbox', 0),
            'shadowbox' => (int) $params->get('shadowbox', 0),
            'icons' => (int) $params->get('icons', 1),
            'overlay' => (int) $params->get('overlay', 1),
            'overlay_opacity' => (float) $params->get('overlayopacity'),
            'overlay_color' => $params->get('overlaycolor', ''),
            'transition_speed' => max(0, (int) $transitionSpeed),
            'close' => (int) $params->get('close', 2),
            'labels' => $this->getLabels(),
            'swipe' => (bool) $params->get('swipe', 1),
            'expand_on_click' => (bool) $params->get('expand_on_click', 1),
            'display_mode' => $params->get('display_mode', 'fit'),
        );
    }
}
