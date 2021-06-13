<?php
/**
 * Settings page
 *
 * @version       3.0.0
 *
 */
 // If someone try to called this file directly via URL, abort.
if ( ! defined( 'WPINC' ) ) { die( "Don't mess with us." ); }
if ( ! defined( 'ABSPATH' ) ) { exit; }

if(!class_exists('CFGP_Admin')) :
class CFGP_Admin extends CFGP_Global {
	function __construct(){
		$this->add_action( 'admin_bar_menu', 'admin_bar_menu', 90, 1 );
		$this->add_action( 'admin_enqueue_scripts', 'register_scripts' );
		$this->add_action( 'admin_enqueue_scripts', 'register_scripts_ctp' );
		$this->add_action( 'admin_enqueue_scripts', 'register_style' );
		$this->add_action( 'admin_init', 'admin_init' );
		
		$this->add_action('manage_edit-cf-geoplugin-country_columns', 'rename__cf_geoplugin_country__column');
		$this->add_action('manage_edit-cf-geoplugin-region_columns', 'rename__cf_geoplugin_region__column');
		$this->add_action('manage_edit-cf-geoplugin-city_columns', 'rename__cf_geoplugin_city__column');
		$this->add_action('manage_edit-cf-geoplugin-postcode_columns', 'rename__cf_geoplugin_postcode__column');
	}
	
	// Rename county table
	public function rename__cf_geoplugin_country__column ($theme_columns){
		$theme_columns['name'] = __('Country code', CFGP_NAME);
		$theme_columns['description'] = __('Country full name', CFGP_NAME);
		return $theme_columns;
	}
	
	// Rename region table
	public function rename__cf_geoplugin_region__column ($theme_columns){
		$theme_columns['name'] = __('Region code', CFGP_NAME);
		$theme_columns['description'] = __('Region full name', CFGP_NAME);
		return $theme_columns;
	}
	
	// Rename city table
	public function rename__cf_geoplugin_city__column ($theme_columns){
		$theme_columns['name'] = __('City name', CFGP_NAME);
		unset($theme_columns['description']);
		return $theme_columns;
	}
	
	// Rename postcode table
	public function rename__cf_geoplugin_postcode__column ($theme_columns){
		$theme_columns['name'] = __('Postcode', CFGP_NAME);
		unset($theme_columns['description']);
		return $theme_columns;
	}
	
	// Initialize plugin settings
	public function admin_init(){
		$this->plugin_custom_menu_class();
	}
	
	// Fix collapsing admin menu
	public function plugin_custom_menu_class()
	{
		global $menu;

		$show = false;
		if( isset( $_GET['post_type'] ) ) $show = $this->limit_scripts( $_GET['post_type'] ); // This will also check for taxonomies

		if( is_array( $menu ) && $show )
		{
			foreach( $menu as $key => $value )
			{
				if( $value[0] == 'Geo Plugin' )
				{
					$menu[$key][4] = 'wp-has-submenu wp-has-current-submenu wp-menu-open menu-top toplevel_page_cf-geoplugin menu-top-first wp-menu-open';
				}
			}
		}
	}
	
	// Add admin top bar menu pages
	public function admin_bar_menu($wp_admin_bar) {
		$wp_admin_bar->add_node(array(
			'id' => CFGP_NAME . '-admin-bar-link',
			'title' => __('Geo Plugin', CFGP_NAME), 
			'href' => esc_url(admin_url('admin.php?page=cf-geoplugin')), 
			'meta' => array(
				'class' => CFGP_NAME . ' ' . CFGP_NAME . '-admin-bar-link',
				'title' => __('Geo Plugin', CFGP_NAME),
			)
		));
		
		$wp_admin_bar->add_menu(array(
			'parent' => CFGP_NAME . '-admin-bar-link',
			'id' => CFGP_NAME . '-admin-bar-shortcodes-link',
			'title' => __('Shortcodes', CFGP_NAME), 
			'href' => esc_url(admin_url('admin.php?page=' . CFGP_NAME)), 
			'meta' => array(
				'class' => CFGP_NAME . ' ' . CFGP_NAME . '-admin-bar-shortcodes-link',
				'title' => __('Shortcodes', CFGP_NAME),
			)
		));
		if(CFGP_Options::get('enable_gmap', false))
		{
			$wp_admin_bar->add_menu(array(
				'parent' => CFGP_NAME . '-admin-bar-link',
				'id' => CFGP_NAME . '-admin-bar-google-map-link',
				'title' => __('Google Map', CFGP_NAME), 
				'href' => esc_url(admin_url('admin.php?page=' . CFGP_NAME . '-google-map')), 
				'meta' => array(
					'class' => CFGP_NAME . ' ' . CFGP_NAME . '-admin-bar-google-map-link',
					'title' => __('Google Map', CFGP_NAME),
				)
			));
		}
		if(CFGP_Options::get('enable_defender', 1))
		{
			$wp_admin_bar->add_menu(array(
				'parent' => CFGP_NAME . '-admin-bar-link',
				'id' => CFGP_NAME . '-admin-bar-defender-link',
				'title' => __('Site Protection', CFGP_NAME), 
				'href' => esc_url(admin_url('admin.php?page=' . CFGP_NAME . '-defender')), 
				'meta' => array(
					'class' => CFGP_NAME . ' ' . CFGP_NAME . '-admin-bar-defender-link',
					'title' => __('Site Protection', CFGP_NAME),
				)
			));
		}
		if(CFGP_Options::get('enable_banner', false)) {
			$wp_admin_bar->add_menu(array(
				'parent' => CFGP_NAME . '-admin-bar-link',
				'id' => CFGP_NAME . '-admin-bar-banner-link',
				'title' => __('Geo Banner', CFGP_NAME), 
				'href' => esc_url(admin_url('admin.php?page=' . CFGP_NAME . '-banner')), 
				'meta' => array(
					'class' => CFGP_NAME . ' ' . CFGP_NAME . '-admin-bar-banner-link',
					'title' => __('Geo Banner', CFGP_NAME),
				)
			));
		}
		if(CFGP_Options::get('enable_seo_redirection', 1))
		{
			$wp_admin_bar->add_menu(array(
				'parent' => CFGP_NAME . '-admin-bar-link',
				'id' => CFGP_NAME . '-admin-bar-seo-redirection-link',
				'title' => __('SEO Redirection', CFGP_NAME), 
				'href' => esc_url(admin_url('admin.php?page=' . CFGP_NAME . '-seo-redirection')), 
				'meta' => array(
					'class' => CFGP_NAME . ' ' . CFGP_NAME . '-admin-bar-seo-redirection-link',
					'title' => __('SEO Redirection', CFGP_NAME),
				)
			));
		}
		
		$wp_admin_bar->add_menu(array(
			'parent' => CFGP_NAME . '-admin-bar-link',
			'id' => CFGP_NAME . '-admin-bar-settings-link',
			'title' => __('Settings', CFGP_NAME), 
			'href' => esc_url(admin_url('admin.php?page=' . CFGP_NAME . '-settings')), 
			'meta' => array(
				'class' => CFGP_NAME . ' ' . CFGP_NAME . '-admin-bar-settings-link',
				'title' => __('Settings', CFGP_NAME),
			)
		));
		
		$wp_admin_bar->add_menu(array(
			'parent' => CFGP_NAME . '-admin-bar-link',
			'id' => CFGP_NAME . '-admin-bar-debug-link',
			'title' => __('Debug Mode', CFGP_NAME), 
			'href' => esc_url(admin_url('admin.php?page=' . CFGP_NAME . '-debug')), 
			'meta' => array(
				'class' => CFGP_NAME . ' ' . CFGP_NAME . '-admin-bar-debug-link',
				'title' => __('Debug Mode', CFGP_NAME),
			)
		));
		
		$wp_admin_bar->add_menu(array(
			'parent' => CFGP_NAME . '-admin-bar-link',
			'id' => CFGP_NAME . '-admin-bar-activate-link',
			'title' => __('License', CFGP_NAME), 
			'href' => esc_url(admin_url('admin.php?page=' . CFGP_NAME . '-activate')), 
			'meta' => array(
				'class' => CFGP_NAME . ' ' . CFGP_NAME . '-admin-bar-activate-link',
				'title' => __('License', CFGP_NAME),
			)
		));
	}
	
	public function register_style($page){
		if(!$this->limit_scripts($page)) return;
		
		wp_enqueue_style( CFGP_NAME . '-fontawesome', CFGP_ASSETS . '/css/font-awesome.min.css', array(), (string)CFGP_VERSION );
		wp_enqueue_style( CFGP_NAME . '-admin', CFGP_ASSETS . '/css/style-admin.css', array(CFGP_NAME . '-fontawesome'), (string)CFGP_VERSION );
	}
	
	// Register CPT and taxonomies scripts
	public function register_scripts_ctp( $page )
	{
		$post = '';
		$url = '';
		
		if( isset( $_GET['taxonomy'] ) ) $post = $_GET['taxonomy'];
		elseif( isset( $_GET['post'] ) )
		{
			$post = get_post( absint( $_GET['post'] ) );
			$post = isset( $post->post_type ) ? $post->post_type : '';
		}
		elseif( isset( $_GET['post_type'] ) ) $post = $_GET['post_type'];

		if( !$this->limit_scripts( $post ) ) return false;

		if( $post === '' . CFGP_NAME . '-banner' ) $url = sprintf( 'edit.php?post_type=%s', $post );
		else $url = sprintf( 'edit-tags.php?taxonomy=%s&post_type=%s-banner', $post, CFGP_NAME );
		
		wp_enqueue_style( CFGP_NAME . '-cpt', CFGP_ASSETS . '/css/style-cpt.css', 1, (string)CFGP_VERSION, false );
		wp_enqueue_script( CFGP_NAME . '-cpt', CFGP_ASSETS . '/js/script-cpt.js', array('jquery'), (string)CFGP_VERSION, true );
		wp_localize_script(CFGP_NAME . '-cpt', 'CFGP', array(
			'ajaxurl' => admin_url('admin-ajax.php'),
			'label' => array(
				'loading' => esc_attr__('Loading...',CFGP_NAME),
				'not_found' => esc_attr__('Not Found!',CFGP_NAME),
				'placeholder' => esc_attr__('Search',CFGP_NAME),
				'taxonomy' => array(
					'country' => array(
						'name' => esc_attr__('Country code',CFGP_NAME),
						'name_info' => esc_attr__('Country codes are short (2 letters) alphabetic or numeric geographical codes developed to represent countries and dependent areas, for use in data processing and communications.',CFGP_NAME),
						'description' => esc_attr__('Country full name',CFGP_NAME),
						'description_info' => esc_attr__('The name of the country must be written in English without spelling errors.',CFGP_NAME),
					),
					'region' => array(
						'name' => esc_attr__('Region code',CFGP_NAME),
						'name_info' => esc_attr__('Region codes are short (2 letters) alphabetic or numeric geographical codes developed to represent countries and dependent areas, for use in data processing and communications.',CFGP_NAME),
						'description' => esc_attr__('Region full name',CFGP_NAME),
						'description_info' => esc_attr__('The name of the region must be written in English without spelling errors.',CFGP_NAME),
					),
					'city' => array(
						'name' => esc_attr__('City name',CFGP_NAME),
						'name_info' => esc_attr__('The city name must be written in the original city name.',CFGP_NAME),
					),
					'postcode' => array(
						'name' => esc_attr__('Postcode',CFGP_NAME),
						'name_info' => esc_attr__('The postcode name must be written in the original international format.',CFGP_NAME),
					)
				)
			),
			'current_url'	=> $url
		));
	}
	
	public function register_scripts($page){
		if(!$this->limit_scripts($page)) return;
		
		wp_enqueue_style( CFGP_NAME . '-choosen', CFGP_ASSETS . '/js/chosen_v1.8.7/chosen.min.css', 1,  '1.8.7' );
		wp_enqueue_script( CFGP_NAME . '-choosen', CFGP_ASSETS . '/js/chosen_v1.8.7/chosen.jquery.min.js', array('jquery'), '1.8.7', true );
		
		wp_enqueue_script( CFGP_NAME . '-admin', CFGP_ASSETS . '/js/script-admin.js', array('jquery', CFGP_NAME . '-choosen'), (string)CFGP_VERSION, true );
		wp_localize_script(CFGP_NAME . '-admin', 'CFGP', array(
			'ajaxurl' => admin_url('admin-ajax.php'),
			'adminurl' => self_admin_url('/'),
			'label' => array(
				'upload_csv' => esc_attr__('Select or Upload CSV file',CFGP_NAME),
				'unload' => esc_attr__('Data will lost , Do you wish to continue?',CFGP_NAME),
				'loading' => esc_attr__('Loading...',CFGP_NAME),
				'not_found' => esc_attr__('Not Found!',CFGP_NAME),
				'alert' => array(
					'close' => esc_attr__('Close',CFGP_NAME)
				),
				'rss' => array(
					'no_news' => esc_attr__('There are no news at the moment.',CFGP_NAME),
					'error' => esc_attr__("ERROR! Can't load news feed.",CFGP_NAME)
				),
				'chosen' => array(
					'not_found' => esc_attr__('Nothing found!',CFGP_NAME)
				),
				'settings' => array(
					'saved' => esc_attr__('Option saved successfuly!',CFGP_NAME),
					'fail' => esc_attr__('There was some unexpected system error. Changes not saved!',CFGP_NAME),
					'false' => esc_attr__('Changes not saved for unexpected reasons. Try again!',CFGP_NAME),
					'error' => esc_attr__('Option you provide not match to global variables. Permission denied!',CFGP_NAME)
				),
				'csv' => array(
					'saved' => esc_attr__('Successfuly saved %d records.',CFGP_NAME),
					'fail' => esc_attr__('Failed to add %d rows.',CFGP_NAME),
					'upload' =>	esc_attr__('Upload CSV file.',CFGP_NAME),
					'filetype' => esc_attr__('The file must be comma separated CSV type',CFGP_NAME),
					'exit' => esc_attr__('Are you sure, you want to exit?\nChanges wont be saved!',CFGP_NAME),
					'delete' =>	esc_attr__('Are you sure, you want to delete this redirection?',CFGP_NAME),
					'missing_url' => esc_attr__('URL Missing. Please insert URL from your CSV file or choose file from the library.',CFGP_NAME),
				),
				'rest' => array(
					'delete' => esc_attr__("Are you sure, you want to delete this access token?",CFGP_NAME),
					'error' => esc_attr__("Can't delete access token because unexpected reasons.",CFGP_NAME),
				),
				'footer_menu' => array(
					'documentation' =>	esc_attr__('Documentation',CFGP_NAME),
					'contact' => esc_attr__('Contact',CFGP_NAME),
					'blog' => esc_attr__('Blog',CFGP_NAME),
					'faq' => esc_attr__('FAQ',CFGP_NAME),
					'thank_you' => esc_attr__('Thank you for using',CFGP_NAME)
				)
			)
		));
	}
	
	/*
	 * Limit scripts
	 */
	public function limit_scripts($page){
		if(strpos($page, CFGP_NAME) !== false) return true;
		return false;
	}
	
	/* 
	 * Instance
	 * @verson    1.0.0
	 */
	public static function instance() {
		global $cfgp_cache;
		$class = self::class;
		$instance = $cfgp_cache->get($class);
		if ( !$instance ) {
			$instance = $cfgp_cache->set($class, new self());
		}
		return $instance;
	}
}
endif;