export class AuthConstants {
    public static readonly PLATFORM = 'platform';
    public static readonly AUTH = 'userData';
    public static readonly CACHE_FULL_PROFILE = "myProfile";
    public static readonly CATEGORIES = 'categories';
    public static readonly SUBJECTS = 'subjects';

    public static DEV_MODE = true;
    public static LOG_ENABLED = true;
    public static SHOW_OTP = false;
    public static APP_SETTINGS = "appSettings";

    public static readonly REGEX_PHONE = '^((\\+91-?)|0)?[0-9]{10}$';
    public static readonly REGEX_URL = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

    public static readonly CURRENT_ROLE_OPTIONS = [
        { label: 'Pursuing Tech Degree', value: 'Pursuing' },
        { label: 'IT Fresher (Graduate)', value: 'IT Fresher' },
        { label: 'Junior Developer (0-2 yrs)', value: 'Junior Developer' },
        { label: 'Experienced IT Professional (2+ yrs)', value: 'IT Professional' },
        { label: 'Career Switcher (Non-IT to IT)', value: 'IT Aspirant' },
        { label: 'Other', value: 'Other' }
    ];
}