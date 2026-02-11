<?php

class Session {

    private static $timeout = 900; // 15 minutos

    public static function start() {
       if (session_status() === PHP_SESSION_NONE) {
    session_start();
}


        if (isset($_SESSION['LAST_ACTIVITY']) &&
            (time() - $_SESSION['LAST_ACTIVITY'] > self::$timeout)) {

            session_unset();
            session_destroy();
            header("Location: /?expired=1");
            exit;
        }

        $_SESSION['LAST_ACTIVITY'] = time();
    }

    public static function set($key, $value) {
        $_SESSION[$key] = $value;
    }

    public static function get($key) {
        return $_SESSION[$key] ?? null;
    }

    public static function destroy() {
        session_destroy();
    }
}
