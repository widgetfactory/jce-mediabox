<?php
/**
 * @package     JCE MediaBox
 * @subpackage  System
 * @copyright   Copyright (C) 2023 - 2024 Ryan Demmer. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE
 */

defined('_JEXEC') or die;

use Joomla\CMS\Filesystem\File;
use Joomla\CMS\Filesystem\Folder;

class PlgSystemJcemediaboxInstallerScript
{
    /**
     * Method to run after an install/update method.
     *
     * @param   string  $type    The type of change (install, update or discover_install).
     * @param   object  $parent  The class calling this method.
     *
     * @return  void
     */
    public function postflight($type, $parent)
    {
        // Only run on install or update
        if ($type === 'install' || $type === 'update') {
            $this->cleanuInstall();
        }
    }

    /**
     * Deletes specified files and folders if they exist.
     *
     * @return  void
     */
    protected function cleanuInstall()
    {
        $root = JPATH_ROOT . '/plugins/system/jcemediabox';

        $folders = ['css', 'fonts', 'img', 'js', 'layouts', 'mediaplayer', 'themes'];
        $files = ['fields/menuitemchecklist.php'];

        foreach ($files as $file) {
            if (is_file($root . '/' . $file)) {
                File::delete($root . '/' . $file);
            }
        };

        foreach ($folders as $folder) {
            if (is_dir($root . '/' . $folder)) {
                Folder::delete($root . '/' . $folder);
            }
        }

        // delete old language files
        $languages = array(
            'administrator/language/en-GB/en-GB.plg_system_jcemediabox.ini',
            'administrator/language/en-GB/en-GB.plg_system_jcemediabox.sys.ini'
        );

        foreach ($languages as $file) {
            if (is_file(JPATH_SITE . '/' . $file)) {
                File::delete(JPATH_SITE . '/' . $file);
            }
        }
    }
}
