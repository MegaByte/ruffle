package flash.system {
    public final class Capabilities {
        public static function get os(): String {
            return "Linux 5.10.49"
        }
        public static function get playerType(): String {
            return "StandAlone"
        }
        public static function get version(): String {
            return "LNX 32,0,0,465"
        }
        public static function get manufacturer(): String {
            return "Adobe Linux"
        }
        public static function get language(): String {
            return "en"
        }
        public static function get isDebugger(): Boolean {
            return false
        }
    }
}
