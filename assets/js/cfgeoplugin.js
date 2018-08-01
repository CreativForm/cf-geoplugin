/**
* Javascript Popup Plugin
*
* @author     Ivijan-Stefan Stipic <creativform@gmail.com>
* @version    1.0.8
*/
function cf_geoplugin_popup(url, title, w, h) {
	// Fixes dual-screen position Most browsers Firefox
	var dualScreenLeft = (window.screenLeft != undefined ? window.screenLeft : screen.left),
		dualScreenTop = (window.screenTop != undefined ? window.screenTop : screen.top);
	
	width = (window.innerWidth ? window.innerWidth : (document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width));
	height = (window.innerHeight ? window.innerHeight : (document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height));
	
	var left = ((width / 2) - (w / 2)) + dualScreenLeft,
		top = ((height / 2) - (h / 2)) + dualScreenTop,
		newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
	
	// Puts focus on the newWindow
	if (window.focus) {
		newWindow.focus();
	}
};

(function($){
/*
 * Display alert
 * @since 7.0.0
*/
$.fn.alerts = function(text, type){
	type = type || 'success';
	var appends = this.html('<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert">' + text + '<button type="button" class="close" data-dismiss="alert" aria-label="' + CFGP.label.alert.close + '"><span aria-hidden="true">&times;</span></button></div>');
	return appends;
}

})(jQuery || window.jQuery || Zepto || window.Zepto);

(function($){
	
	/*
	 * Set debouncing
	 * @since 7.0.0
	*/
	var debounce,
		debounce_delay = 250;
		
	/* 
	 * RSS FEED
	 * @since 7.0.0
	*/
	(function($$){ 
		if( $($$) )
		{
			$.ajax({
				method : 'post',
				cache : true,
				async : true,
				url : CFGP.ajaxurl,
				data : {action:'cf_geo_rss_feed'}
			}).done(function(d){
				if(d == '') d = CFGP.label.rss.no_news;
				$($$).html(d);
			}).fail(function(a){
				console.log(a);
				$($$).html(CFGP.label.rss.error);
			});
		}
	}("#rss"));
	
	/*
	 * Chosen initialization
	 * @since 7.0.0
	*/
	(function($$){
		if( $($$) )
		{
			$($$).each(function(index, element) {
				$(this).chosen({
					no_results_text: CFGP.label.chosen.not_found,
					width: "100%",
					search_contains:true
				});
			});
		}
	}('.chosen-select'));
	
	/*
	 * Autosave options on the change
	 * @since 7.0.0
	*/
	(function($$){
		if( $($$) )
		{
			$('input, select, textarea', $($$)).on('input keyup change select paste',function(e){
				clearTimeout(debounce);
				var $this = $(this),
					type = undefined,
					parent = $this.parents($$),
					delay = debounce_delay;
				
				$('#alert').alerts(CFGP.label.loading,'info');
				
				switch(true)
				{
					case $this.is('input'):
						type = $this.attr('type');
						break;
					case $this.is('select'):
						type = 'select';
						break;
					case $this.is('textarea'):
						type = 'textarea';
						break;
				}
				
				if(['radio','checkbox','slide','select'].indexOf(type) > -1)
				{
					delay=1;
				}
					
				debounce = setTimeout(function(){
					var value = $this.val(),
						name = $this.attr('name');
					
					$.ajax({
						method : 'post',
						cache : false,
						url : CFGP.ajaxurl,
						data : {action:'cf_geo_update_option', name : name, value : value}
					}).done(function(d){
						if(d == 'true')
						{
							$('#alert').alerts(CFGP.label.settings.saved,'success');
							if(name == 'proxy')
							{
								if(value == 1)
								{
									$('.proxy-disable').prop('disabled',false).removeClass('disabled');
								}
								else
								{
									$('.proxy-disable').prop('disabled',true).addClass('disabled');
								}
							}
							else if(name == 'enable_gmap')
							{
								if(value == 1)
								{
									$('.nav-item > a[href^="#settings-google-map"]').parent().show();
									$('#toplevel_page_cf-geoplugin a[href^="admin.php?page=cf-geoplugin-google-map"]').parent().show();
								}
								else
								{
									$('.nav-item > a[href^="#settings-google-map"]').parent().hide();
									$('#toplevel_page_cf-geoplugin a[href^="admin.php?page=cf-geoplugin-google-map"]').parent().hide();
								}
							}
							else if(name == 'enable_rest')
							{
								if(value == 1)
								{
									$('.nav-item > a[href^="#settings-rest-api"]').parent().show();
								}
								else
								{
									$('.nav-item > a[href^="#settings-rest-api"]').parent().hide();
								}
							}
							else if(name == 'enable_beta')
							{
								if(value == 1)
								{
									$('.beta-disable').prop('disabled',false).removeClass('disabled');
									$('.nav-item > a[href^="#settings-rest-api"]').parent().show();
								}
								else
								{
									$('.beta-disable').prop('disabled',true).addClass('disabled');
									$('.nav-item > a[href^="#settings-rest-api"]').parent().hide();
								}
							}
							else if(name == 'enable_woocommerce')
							{
								if(value == 1)
								{
									$('#base_currency').prop('disabled',true).addClass('disabled');
									$('#base_currency_info').show();
									$( '#woo_integration_html' ).show();
								}
								else
								{
									$('#base_currency').prop('disabled',false).removeClass('disabled');
									$('#base_currency_info').hide();
									$( '#woo_integration_html' ).hide();
								}
							}
						}
						else if(d == 'error')
						{
							$('#alert').alerts(CFGP.label.settings.error,'danger');
						}
						else
						{
							$('#alert').alerts(CFGP.label.settings.false,'warning');
						}
					}).fail(function(a){
						console.log(a);
						$('#alert').alerts(CFGP.label.settings.fail,'danger');
					});
				},delay);
			});
		}
	}('.cfgp-autosave'));
	
	/* 
	 * REMEBER TAB POSSITION IN SETTINGS
	 * @since 7.0.0
	*/
	(function($$) {
		if( $($$) )
		{
			$('a[data-toggle="tab"]', $$).on('click', function(e) {
				window.localStorage.setItem('settings-tab', $(e.target).attr('href'));
			});
			var activeTab = window.localStorage.getItem('settings-tab');
			if (activeTab) {
				$('a[href="' + activeTab + '"]', $$).tab('show');
				window.localStorage.removeItem("settings-tab");
			}
		}
	}('#settings-tab'));

	/**
	 * Save SEO redirect params
	 * @since	7.0.0
	 */
	(function($$) {
		if( $($$) )
		{
			$($$).bind( 'submit', function (e) {
				var url = $('#cf_geo_redirect_url', $$).val();
				var valid_url = isURL( url );
				var country = true;
				if( $( '#cf_geo_country' ).length && !$('#cf_geo_country', $$).val() )
				{
					country = false;
				}
				var region = true;
				if( $( '#cf_geo_region', $$ ).length && !$( '#cf_geo_region', $$ ).val() )
				{
					region = false;
				}
				var city = true;
				if( $('#cf_geo_city', $$).length && !$( '#cf_geo_city', $$ ).val() )
				{
					city = false;
				}

				if( valid_url && country && region && city ) 
				{
					var $form_data = $($$).serialize();
					$('.btn', $$).prop('disabled', true);
					var redirect_save_url = CFGP.ajaxurl + '?action=cf_geo_update_redirect';
					$.ajax({
						method: 'post',
						url: redirect_save_url,
						data: $form_data,
						cache: false
					}).done( function( d ) {
						if( d == 'true' )
						{
							$('#alert').alerts( CFGP.label.settings.saved, 'success' );
							setTimeout(function(){
								window.location.href = CFGP.adminurl + 'admin.php?page=cf-geoplugin-seo-redirection';
							},300);
						}
						else if( d == 'error' )
						{
							$('.btn', $$).prop('disabled', false);
							$('#alert').alerts( CFGP.label.settings.error, 'danger' );
						}
						else
						{
							$('.btn', $$).prop('disabled', false);
							$('#alert').alerts( CFGP.label.settings.false, 'warning' );
						}
					}).fail( function( a ) {
						console.log(a);
						$('.btn', $$).prop('disabled', false);
						$('#alert').alerts(CFGP.label.settings.fail,'danger');
					});
				}
				if( !valid_url )
				{
					$( '#cf_geo_redirect_url', $$ ).addClass( 'is-invalid' );
					$( 'div#input-url', $$).attr( 'hidden', false );
				}
				else
				{
					if( $( '#cf_geo_redirect_url', $$ ).hasClass('is-invalid') )
					{
						$( '#cf_geo_redirect_url', $$ ).removeClass( 'is-invalid' );
					}
					$( 'div#input-url', $$).attr( 'hidden', true );	
				}

				if( !country )
				{
					$( '#cf_geo_country', $$ ).addClass( 'is-invalid' );
					$( 'div#select-country', $$).attr( 'hidden', false );
				}
				else
				{
					if( $( '#cf_geo_country', $$ ).hasClass('is-invalid') ) 
					{
						$( '#cf_geo_country', $$ ).removeClass( 'is-invalid' );
					}
					$( 'div#select-country', $$).attr( 'hidden', true );
				}

				if( !region )
				{
					$( '#cf_geo_region', $$ ).addClass( 'is-invalid' );
					$( 'div#select-region', $$).attr( 'hidden', false );
				}
				else
				{
					if( $( '#cf_geo_region', $$ ).hasClass('is-invalid') )
					{
						$( '#cf_geo_region', $$ ).removeClass( 'is-invalid' );
					}
					$( 'div#select-region', $$).attr( 'hidden', true );
				}

				if( !city )
				{
					$( '#cf_geo_city', $$ ).addClass( 'is-invalid' );
					$( 'div#select-city', $$).attr( 'hidden', false );
				}
				else
				{
					if( $( '#cf_geo_city', $$ ).hasClass('is-invalid') )
					{
						$( '#cf_geo_city', $$ ).removeClass( 'is-invalid' );
					}
					$( 'div#select-city', $$).attr( 'hidden', true );
				}
				return false;
			});
		}
	}('form#cf_geo_redirect_form'));

	// Check if value is email
	function isURL( url )
	{
		var regex = /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/;
  		return regex.test(url);
	}

	// Confirm SEO redirection delete
	(function($$) {
		if( $($$) )
		{
			$($$).on( 'click', function (e) {
				$($$).prop('disabled', true).attr('disabled', true);
				var $ans = confirm(CFGP.label.csv.delete);
				if( $ans == false ) 
				{
					e.preventDefault();
					$($$).prop('disabled', false).attr('disabled', false);	
				}
			});
		}
	})('.cf_geo_redirect_delete');

	// Confirm SEO redirection cancel
	(function($$) {
		if( $($$) )
		{
			$($$).on( 'click touchstart', function (e) {
				$($$).prop('disabled', true).attr('disabled', true);
				var $ans = confirm(CFGP.label.csv.exit);
				if( $ans == false ) 
				{
					e.preventDefault();
					$($$).prop('disabled', false).attr('disabled', false);	
				}
			});
		}
	})('.cf_geo_redirect_cancel');

	// WP uploader
	(function($$) {
		if( $($$) )
		{
			$($$).each(function () {
				$uploader = $(this);
				$( '.btn-secondary', $uploader ).click( function (e) {
					e.preventDefault();
					var file = wp.media({
						title: CFGP.label.csv.upload,
						multiple: false
					}).open()
					.on('select', function (e) {
						var uploaded_file = file.state().get('selection').first();
						var file_url = uploaded_file.attributes.url;

						if( $('.file-url', $uploader ).attr('accept') !== undefined )
						{
							var filetype = $('.file-url',$uploader).attr('accept');
							if( filetype !== uploaded_file.attributes.subtype )
							{
								$( '#alert-fail' ).alerts(CFGP.label.csv.filetype, 'danger');
							}
							else
							{
								$('.file-url', $uploader).val( file_url );
							}
						}
					
					});
				});
			});
		}
	})('.input-group');
	
	// Generate Secret Key
	(function($$) {
		if( $($$) )
		{
			$($$).on( 'click touchstart', function (e) {
				e.preventDefault();
				var $this = $(this);
				$('#cf-geoplugin-secret-key').html('<i class="fa fa-circle-o-notch fa-spin fa-fw"></i><span class="sr-only">Loading...</span>');
				$this.prop('disabled', true).addClass('disabled');
				$.ajax({
					url: CFGP.ajaxurl,
					method: 'post',
					dataType: 'text',
					data: {
						action : 'cf_geoplugin_generate_secret_key'
					},
					cache: false
				}).done( function( data ) {
					$('#cf-geoplugin-secret-key').html(data);
					$this.prop('disabled', false).removeClass('disabled');
				}).fail(function(){
					$this.prop('disabled', false).removeClass('disabled');
				});
			});
		}
	})('#cf-geoplugin-generate-secret-key');
	
	// Delete Access Token
	(function($$) {
		if( $($$) )
		{
			$($$).on( 'click touchstart', function (e) {
				e.preventDefault();
				var $this = $(this), $token = $this.attr('data-token');
				if(confirm(CFGP.label.rest.delete))
				{
					$this.prop('disabled', true).addClass('disabled');
					$.ajax({
						url: CFGP.ajaxurl,
						method: 'post',
						dataType: 'text',
						data: {
							action : 'cf_geoplugin_delete_access_token',
							token : $token
						},
						cache: false
					}).done( function( data ) { console.log(data);
						$this.prop('disabled', false).removeClass('disabled');
						if(data == '1')
						{
							$('#' + $token).remove();
						}
						else
						{
							$('#alert').alerts( CFGP.label.rest.error, 'danger' );
						}
					}).fail(function(){
						$this.prop('disabled', false).removeClass('disabled');
						$('#alert').alerts( CFGP.label.rest.error, 'danger' );
					});
				}
			});
		}
	})('.cf-geoplugin-delete-token');

	// Ajax call for importing CSV
	(function($$) {
		if( $($$) )
		{
			$( '.btn-success', $$ ).on('click touchstart', function() {
				
				$('#alert-fail, #alert-success').empty();
				
				if($('.file-url', $$).val() != '')
				{
					var form_data = $($$).serialize(),
						import_button = $( '.btn-success', $$ );
					
					import_button.prop('disabled', true);
					
					var form_action_url = CFGP.ajaxurl + '?action=cf_geo_import_csv';
	
					$.ajax({
						url: form_action_url,
						method: 'post',
						dataType: 'json',
						data: form_data,
						cache: false
					}).done( function( data ) {
						if( data.message )
						{
							$('#alert-fail').alerts( data.message, 'danger' );
							import_button.prop('disabled', false);
						}
						else
						{
							if(data.success > 0){
								$('#alert-success').alerts( CFGP.label.csv.saved.replace(/\%d/,data.success), 'success' );
								setTimeout(function(){
									window.location.href = CFGP.adminurl + 'admin.php?page=cf-geoplugin-seo-redirection';
								},500);
							}
							if(data.fail > 0) $('#alert-fail').alerts( CFGP.label.csv.fail.replace(/\%d/,data.fail), 'danger' );
						}
					}).fail( function(a) {
						$('.file-url', $$).val('');
						import_button.prop('disabled', false);
						console.log(a);
						$('#alert-fail').alerts( CFGP.label.settings.fail,'danger');
					});
				}
				else
				{
					$('#alert-fail').alerts( CFGP.label.csv.missing_url,'warning');
				}
			});
		}
	})('#import-form');

	
	// Initialize popover
	(function ($$) {
		$( $($$) ).popover({
			template : '<div class="popover" role="tooltip"><h3 class="popover-header"></h3><div class="popover-body"></div></div>'	
		});
	}('[data-toggle="popover"]'));
	
})(jQuery || window.jQuery || Zepto || window.Zepto);