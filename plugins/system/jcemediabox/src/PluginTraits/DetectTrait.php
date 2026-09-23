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
 * Detection of popup markup in the rendered page.
 *
 * The patterns mirror what the javascript selects, see the selector in Config.js
 * and the promotions in Convert.js. A word can appear in the page for any number
 * of unrelated reasons, eg: the word "lightbox" in an article, so a match must be
 * on the markup itself, not on the word.
 *
 * @since  3.0.0
 */
trait DetectTrait
{
    /**
     * Words that must be present before a pattern can match.
     *
     * Used as a cheap pre-filter, as a substring search over the buffer is far
     * less work than running the patterns against every string in it.
     *
     * @return  array
     */
    protected function getMarkers()
    {
        $markers = array('jcepopup', 'wfpopup', 'jcebox', 'data-mediabox');

        if ((int) $this->params->get('lightbox', 0) === 1) {
            $markers[] = 'lightbox';
        }

        if ((int) $this->params->get('shadowbox', 0) === 1) {
            $markers[] = 'shadowbox';
        }

        if ((int) $this->params->get('legacy', 0) === 1) {
            $markers[] = 'com_jce';
        }

        return $markers;
    }

    /**
     * Patterns that match the markup the javascript acts on.
     *
     * @return  array
     */
    protected function getPatterns()
    {
        $patterns = array(
            // class token, eg: class="wf_caption jcepopup" - Config.js selector
            '#\bclass\s*=\s*(["\'])[^"\']*(?<![\w-])(?:jcepopup|wfpopup|jcebox)(?![\w-])[^"\']*\1#i',
            // attribute, eg: data-mediabox="{...}" or data-mediabox-content="..." - Config.js selector
            '#\bdata-mediabox[\w-]*\s*=#i',
        );

        // Convert.lightbox() promotes a[rel*=lightbox]
        if ((int) $this->params->get('lightbox', 0) === 1) {
            $patterns[] = '#<a\b[^>]*\brel\s*=\s*(["\'])[^"\']*lightbox[^"\']*\1#i';
        }

        // Convert.shadowbox() promotes a[rel*=shadowbox]
        if ((int) $this->params->get('shadowbox', 0) === 1) {
            $patterns[] = '#<a\b[^>]*\brel\s*=\s*(["\'])[^"\']*shadowbox[^"\']*\1#i';
        }

        /*
         * Convert.legacy() promotes links to com_jce that carry an onclick, and
         * only when the onclick parameters include an img value. Attribute order
         * is not fixed, so both orders are matched.
         */
        if ((int) $this->params->get('legacy', 0) === 1) {
            $patterns[] = '#<a\b[^>]*\bhref\s*=\s*(["\'])[^"\']*com_jce[^"\']*\1[^>]*\bonclick\s*=#i';
            $patterns[] = '#<a\b[^>]*\bonclick\s*=\s*(["\'])[^>]*\bhref\s*=\s*(["\'])[^"\']*com_jce#i';
        }

        return $patterns;
    }

    /**
     * Check a single string for popup markup.
     *
     * @param   string  $html      The html to check
     * @param   array   $markers   The pre-filter words
     * @param   array   $patterns  The patterns to match
     *
     * @return  boolean
     */
    private function hasPopupMarkup($html, $markers, $patterns)
    {
        $matched = false;

        foreach ($markers as $marker) {
            if (stripos($html, $marker) !== false) {
                $matched = true;
                break;
            }
        }

        // no marker, so no pattern can match
        if (!$matched) {
            return false;
        }

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $html)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check the rendered document buffers for popup markup.
     *
     * The component buffer and all module buffers are rendered before the head,
     * so everything the javascript would act on is visible here. Markup added
     * after this point, eg: by ajax or javascript, is not, which is what the
     * Load Assets option exists for.
     *
     * @param   object  $document  The document to check
     *
     * @return  boolean
     */
    protected function bufferHasPopups($document)
    {
        $buffer = $document->getBuffer();

        if (empty($buffer) || !is_array($buffer)) {
            return false;
        }

        $markers = $this->getMarkers();
        $patterns = $this->getPatterns();
        $found = false;

        array_walk_recursive($buffer, function ($value) use (&$found, $markers, $patterns) {
            if ($found || !is_string($value) || $value === '') {
                return;
            }

            $found = $this->hasPopupMarkup($value, $markers, $patterns);
        });

        return $found;
    }

    /**
     * Check whether the assets should be loaded for this request.
     *
     * @param   object  $document  The document to check
     *
     * @return  boolean
     */
    protected function shouldLoadAssets($document)
    {
        if ($this->params->get('load_assets', 'always') === 'always') {
            return true;
        }

        return $this->bufferHasPopups($document);
    }
}
