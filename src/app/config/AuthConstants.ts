export class AuthConstants {
    public static readonly PLATFORM = 'platform';
    public static readonly AUTH = 'userData';
    public static readonly CACHE_FULL_PROFILE = "myProfile";
    public static readonly CATEGORIES = 'categories';
    public static readonly STATES = 'states';
  
    public static DEV_MODE = true;
    public static LOG_ENABLED = true;
    public static SHOW_OTP = false;
    public static APP_SETTINGS ="appSettings";
    public static ROLE_ADMIN = 1;
    public static ROLE_USER = 2;
    public static ROLE_AFFILIATE = 3;

    public static readonly REGEX_PHONE = '^((\\+91-?)|0)?[0-9]{10}$';
    public static readonly REGEX_URL = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

    public log(msg){
        console.log("APPDEBUG", msg);
    }
    }