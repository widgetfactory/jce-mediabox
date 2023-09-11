<?php

/**
 * @package     JCE MediaBox
 *
 * @copyright   Copyright (C) 2005 - 2014 Open Source Matters, Inc. All rights reserved.
 * @copyright   Copyright (C) 2023 Ryan Demmer. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE
 */

namespace Joomla\CMS\Form\Field;

defined('JPATH_PLATFORM') or die;

/**
 * Form Field class for the Joomla Framework.
 *
 * @package     Joomla.Platform
 * @subpackage  Form
 * @since       11.4
 */
class MenuItemCheckListField extends MenuitemField {

    /**
     * The field type.
     *
     * @var    string
     * @since  11.4
     */
    public $type = 'menuitemchecklist';

    /**
	 * Name of the layout being used to render the field
	 *
	 * @var    string
	 * @since  3.5
	 */
	protected $layout = 'form.field.checkboxes';

    /**
     * Allow to override renderer include paths in child fields
     *
     * @return  array
     *
     * @since   3.5
     */
    protected function getLayoutPaths()
    {
        return array(JPATH_PLUGINS . '/system/jcemediabox/layouts', JPATH_SITE . '/layouts');
    }

    /**
	 * Method to get the data to be passed to the layout for rendering.
	 *
	 * @return  array
	 *
	 * @since   3.5
	 */
	protected function getLayoutData()
	{
		$data = parent::getLayoutData();

		// True if the field has 'value' set. In other words, it has been stored, don't use the default values.
		$hasValue = (isset($this->value) && !empty($this->value));

		// If a value has been stored, use it. Otherwise, use the defaults.
		$checkedOptions = $hasValue ? $this->value : $this->checkedOptions;

		$extraData = array(
			'checkedOptions' => is_array($checkedOptions) ? $checkedOptions : explode(',', (string) $checkedOptions),
			'hasValue'       => $hasValue
		);

		return array_merge($data, $extraData);
	}
}
