<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * This has been slightly modified (to read environment variables) for use in Docker.
 *
 * @link https://wordpress.org/documentation/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// IMPORTANT: this file needs to stay in-sync with https://github.com/WordPress/WordPress/blob/master/wp-config-sample.php
// (it gets parsed by the upstream wizard in https://github.com/WordPress/WordPress/blob/f27cb65e1ef25d11b535695a660e7282b98eb742/wp-admin/setup-config.php#L356-L392)

// a helper function to lookup "env_FILE", "env", then fallback
if (!function_exists('getenv_docker')) {
	// https://github.com/docker-library/wordpress/issues/588 (WP-CLI will load this file 2x)
	function getenv_docker($env, $default) {
		if ($fileEnv = getenv($env . '_FILE')) {
			return rtrim(file_get_contents($fileEnv), "\r\n");
		}
		else if (($val = getenv($env)) !== false) {
			return $val;
		}
		else {
			// Try to load from $_ENV which might contain variables from .env file
			if (isset($_ENV[$env])) {
				return $_ENV[$env];
			}
			// Try to load from $_SERVER which might contain variables from .env file
			if (isset($_SERVER[$env])) {
				return $_SERVER[$env];
			}
			return $default;
		}
	}
}

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', getenv_docker('WORDPRESS_DB_NAME', 'wordpress') );

/** Database username */
define( 'DB_USER', getenv_docker('WORDPRESS_DB_USER', 'example username') );

/** Database password */
define( 'DB_PASSWORD', getenv_docker('WORDPRESS_DB_PASSWORD', 'example password') );

/**
 * Docker image fallback values above are sourced from the official WordPress installation wizard:
 * https://github.com/WordPress/WordPress/blob/1356f6537220ffdc32b9dad2a6cdbe2d010b7a88/wp-admin/setup-config.php#L224-L238
 * (However, using "example username" and "example password" in your database is strongly discouraged.  Please use strong, random credentials!)
 */

/** Database hostname */
define( 'DB_HOST', getenv_docker('WORDPRESS_DB_HOST', 'mysql') );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', getenv_docker('WORDPRESS_DB_CHARSET', 'utf8') );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', getenv_docker('WORDPRESS_DB_COLLATE', '') );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         getenv_docker('WORDPRESS_AUTH_KEY',         'put your unique phrase here') );
define( 'SECURE_AUTH_KEY',  getenv_docker('WORDPRESS_SECURE_AUTH_KEY',  'put your unique phrase here') );
define( 'LOGGED_IN_KEY',    getenv_docker('WORDPRESS_LOGGED_IN_KEY',    'put your unique phrase here') );
define( 'NONCE_KEY',        getenv_docker('WORDPRESS_NONCE_KEY',        'put your unique phrase here') );
define( 'AUTH_SALT',        getenv_docker('WORDPRESS_AUTH_SALT',        'put your unique phrase here') );
define( 'SECURE_AUTH_SALT', getenv_docker('WORDPRESS_SECURE_AUTH_SALT', 'put your unique phrase here') );
define( 'LOGGED_IN_SALT',   getenv_docker('WORDPRESS_LOGGED_IN_SALT',   'put your unique phrase here') );
define( 'NONCE_SALT',       getenv_docker('WORDPRESS_NONCE_SALT',       'put your unique phrase here') );
// (See also https://wordpress.stackexchange.com/a/152905/199287)

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = getenv_docker('WORDPRESS_TABLE_PREFIX', 'wp_');

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/documentation/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', !!getenv_docker('WORDPRESS_DEBUG', '') );

/* Add any custom values between this line and the "stop editing" line. */

// If we're behind a proxy server and using HTTPS, we need to alert WordPress of that fact
// see also https://wordpress.org/support/article/administration-over-ssl/#using-a-reverse-proxy
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strpos($_SERVER['HTTP_X_FORWARDED_PROTO'], 'https') !== false) {
	$_SERVER['HTTPS'] = 'on';
}
// (we include this by default because reverse proxying is extremely common in container environments)

// Debug environment variables
if (getenv_docker('WORDPRESS_DEBUG', '') !== '') {
    $env_debug = array(
        'DB_NAME' => DB_NAME,
        'DB_USER' => DB_USER,
        'DB_PASSWORD' => DB_PASSWORD,
        'DB_HOST' => DB_HOST,
        'WORDPRESS_DB_NAME' => getenv('WORDPRESS_DB_NAME'),
        'WORDPRESS_DB_USER' => getenv('WORDPRESS_DB_USER'),
        'WORDPRESS_DB_PASSWORD' => getenv('WORDPRESS_DB_PASSWORD'),
        'WORDPRESS_DB_HOST' => getenv('WORDPRESS_DB_HOST'),
        'ENV_WORDPRESS_DB_NAME' => isset($_ENV['WORDPRESS_DB_NAME']) ? $_ENV['WORDPRESS_DB_NAME'] : 'not set',
        'ENV_WORDPRESS_DB_USER' => isset($_ENV['WORDPRESS_DB_USER']) ? $_ENV['WORDPRESS_DB_USER'] : 'not set',
        'ENV_WORDPRESS_DB_PASSWORD' => isset($_ENV['WORDPRESS_DB_PASSWORD']) ? $_ENV['WORDPRESS_DB_PASSWORD'] : 'not set',
        'ENV_WORDPRESS_DB_HOST' => isset($_ENV['WORDPRESS_DB_HOST']) ? $_ENV['WORDPRESS_DB_HOST'] : 'not set',
        'SERVER_WORDPRESS_DB_NAME' => isset($_SERVER['WORDPRESS_DB_NAME']) ? $_SERVER['WORDPRESS_DB_NAME'] : 'not set',
        'SERVER_WORDPRESS_DB_USER' => isset($_SERVER['WORDPRESS_DB_USER']) ? $_SERVER['WORDPRESS_DB_USER'] : 'not set',
        'SERVER_WORDPRESS_DB_PASSWORD' => isset($_SERVER['WORDPRESS_DB_PASSWORD']) ? $_SERVER['WORDPRESS_DB_PASSWORD'] : 'not set',
        'SERVER_WORDPRESS_DB_HOST' => isset($_SERVER['WORDPRESS_DB_HOST']) ? $_SERVER['WORDPRESS_DB_HOST'] : 'not set',
    );
    error_log('WordPress Environment Variables: ' . print_r($env_debug, true));
}

if ($configExtra = getenv_docker('WORDPRESS_CONFIG_EXTRA', '')) {
	eval($configExtra);
}

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
